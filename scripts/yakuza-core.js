/**
 * Yakuza-fy Core Module
 * Main functionality and API integration
 */

import { YAKUZA_ID, localize } from './yakuza-utils.js';
import { logInfo, logDebug, logError, logWarning } from './yakuza-logging.js';
import { registerSettings } from './yakuza-settings.js';
import { unifiedDialog } from './yakuza-compatibility.js';
import { showIntro, closeIntro } from './yakuza-ui.js';
import { createYakuzaDataFromDefaultJournal } from './yakuza-data.js';

// Socket instance for communication
let socket;

/**
 * Initialize the Yakuza-fy module
 */
export async function init() {
  logDebug("Initializing module");
  // Avoid double initialization
  if (game.modules.get(YAKUZA_ID).api) {
    logDebug("Module already initialized, skipping");
    return;
  }
  if (!socketlib) {
    logError("Socketlib not found, cannot initialize");
    throw new Error("Yakuza-fy requires socketlib");
  }
  logDebug("Socketlib found");

  // Register settings before using them
  registerSettings();

  logInfo(`Initializing for Foundry v${game.version ? Number(game.version.split('.')[0]) : 12}`);

  // Initialize socket
  logDebug("Registering socket");
  socket = socketlib.registerModule(YAKUZA_ID);
  socket.register("showIntro", handleShowIntro);
  socket.register("closeIntro", closeIntro);
  logDebug("Socket handlers registered");
  
  // Create global API access
  logDebug("Exposing global API");
  window.YakuzaFy = {
    triggerIntro,
    triggerIntroFromJournal,
    closeIntroForAll: () => {
      logDebug("Global API: closeIntroForAll called");
      socket.executeForEveryone("closeIntro");
    },
    localize
  };

  // Expose API
  logDebug("Exposing module API");
  game.modules.get(YAKUZA_ID).api = {
    triggerIntro,
    localize
  };
  logDebug("Core module initialization complete");
}

/**
 * Handle showing an intro (socket handler)
 * @param {Object} yakuzaData - Data for the intro
 */
async function handleShowIntro(yakuzaData) {
  logDebug("Socket handler: showIntro received", yakuzaData);
  await showIntro(yakuzaData, handleGMClick);
  logDebug("Intro display completed via socket");
}

/**
 * Handle GM click on the intro overlay
 */
async function handleGMClick() {
  logDebug("Handling GM click on overlay");
  let closeBehavior = "ask";
  try {
    logDebug("Getting closeBehavior setting");
    closeBehavior = game.settings.get(YAKUZA_ID, "closeBehavior");
    logDebug(`Close behavior setting: ${closeBehavior}`);
  } catch (error) {
    logWarning("Setting 'closeBehavior' not found, defaulting to 'ask'", error);
  }
  
  let forceClose = false;
  try {
    logDebug("Checking forceCloseTableMap setting");
    if (game.settings.settings.get(`${YAKUZA_ID}.forceCloseTableMap`)) {
      forceClose = game.settings.get(YAKUZA_ID, "forceCloseTableMap");
      logDebug(`Force close table map setting: ${forceClose}`);
    }
  } catch (error) {
    logWarning("Setting 'forceCloseTableMap' not found or not registered", error);
  }
  
  let tableMapUserId = null;
  if (game.modules.get("table-map")?.active) {
    try {
      logDebug("Getting table-map userId setting");
      tableMapUserId = game.settings.get("table-map", "userId");
      logDebug(`Table map user ID: ${tableMapUserId}`);
    } catch (error) {
      logWarning("Unable to access table-map.userId setting", error);
    } 
  }

  if (closeBehavior === "ask") {
    logDebug("Showing close confirmation dialog");
    const buttons = [{
      action: "yes",
      label: localize("Settings.CloseDialog.Yes"),
      callback: () => {
        logDebug("Dialog: Yes clicked, closing for all players");
        socket.executeForEveryone("closeIntro");
      }
    }, 
    {
      action: "no",
      label: localize("Settings.CloseDialog.No"),
      default: true,
      callback: () => logDebug("Dialog: No clicked, not closing for others")
    }]
    unifiedDialog(
      localize("Settings.CloseDialog.Title"),
      localize("Settings.CloseDialog.Content"), buttons, "no");
  } else if (closeBehavior === "always") {
    logDebug("Auto-closing for all players (closeBehavior=always)");
    socket.executeForEveryone("closeIntro");
  } else {
    logDebug("Not closing for other players (closeBehavior=never)");
  }

  if (forceClose && tableMapUserId) {
    logDebug("Force close enabled for table map user");
    const user = game.users.get(tableMapUserId);
    if (user?.active) {
      logDebug(`Closing intro for table map user: ${user.name}`);
      socket.executeAsUser("closeIntro", tableMapUserId);
    } else {
      logDebug("Table map user not active, skipping force close");
    }
  }
}

/**
 * Trigger an intro from a journal entry
 * @param {string} journalId - ID of the journal entry
 */
export function triggerIntroFromJournal(journalId) {
  logInfo(`Triggering intro from journal: ${journalId}`);
  const journal = game.journal.get(journalId);
  if (!journal) {
    logError(`Journal with ID ${journalId} not found`);
    ui.notifications.error(localize("Notifications.JournalNotFound"));
    return;
  }
  logDebug(`Found journal: ${journal.name}`);

  logDebug("Creating yakuza data from journal");
  const yakuzaData = createYakuzaDataFromDefaultJournal(journal);
  logDebug("Yakuza data created:", yakuzaData);
  triggerIntro(yakuzaData);
}

/**
 * Trigger an intro with the provided data
 * @param {Object} yakuzaData - Data for the intro
 */
export function triggerIntro(yakuzaData) {
  logInfo("Triggering intro with data:", yakuzaData);
  if (!yakuzaData || !yakuzaData.image) {
    logError("Invalid yakuza data, missing image");
    ui.notifications.error(localize("Notifications.InvalidData"));
    return;
  }

  // Grant observer permission if enabled
  let giveObserverPermission = true;
  try {
    logDebug("Getting giveObserverPermission setting");
    giveObserverPermission = game.settings.get(YAKUZA_ID, "giveObserverPermission");
    logDebug(`Give observer permission setting: ${giveObserverPermission}`);
  } catch (error) {
    logWarning("Setting 'giveObserverPermission' not found, defaulting to true", error);
  }

  if (giveObserverPermission && yakuzaData.journalId) {
    logDebug(`Checking journal permissions for ID: ${yakuzaData.journalId}`);
    const journal = game.journal.get(yakuzaData.journalId);
    if (journal && game.user.isGM) {
      logDebug("Granting observer permission to all users");
      const permissions = foundry.utils.duplicate(journal.ownership);
      permissions.default = CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER;
      journal.update({ ownership: permissions });
      logDebug("Observer permission granted");
    } else {
      logDebug("Cannot update permissions: journal not found or user not GM");
    }
  }

  // Show intro for all users
  logInfo("Executing showIntro for all users");
  socket.executeForEveryone("showIntro", yakuzaData);
  logInfo("Intro triggered for all users");
}
