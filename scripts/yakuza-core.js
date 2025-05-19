/**
 * Yakuza-fy Core Module
 * Main functionality and API integration
 */

import { YAKUZA_ID } from './yakuza-utils.js';
import { registerSettings, registerKeybindings } from './yakuza-settings.js';
import { setupJournalButtons, setupContextMenuHook } from './yakuza-compatibility.js';
import { showIntro, closeIntro } from './yakuza-ui.js';
import { createYakuzaDataFromDefaultJournal } from './yakuza-data.js';

// Socket instance for communication
let socket;

/**
 * Initialize the Yakuza-fy module
 */
export async function init() {
  console.log("Yakuza-fy | Initializing module");
  // Avoid double initialization
  if (game.modules.get(YAKUZA_ID).api) {
    console.log("Yakuza-fy | Module already initialized, skipping");
    return;
  }
  if (!socketlib) {
    console.error("Yakuza-fy | Socketlib not found, cannot initialize");
    throw new Error("Yakuza-fy requires socketlib");
  }
  console.log("Yakuza-fy | Socketlib found");

  // Register settings before using them
  registerSettings();

  console.log(`Yakuza-fy | Initializing for Foundry v${game.version ? Number(game.version.split('.')[0]) : 12}`);

  // Initialize socket
  console.log("Yakuza-fy | Registering socket");
  socket = socketlib.registerModule(YAKUZA_ID);
  socket.register("showIntro", handleShowIntro);
  socket.register("closeIntro", closeIntro);
  console.log("Yakuza-fy | Socket handlers registered");
  
  // Create global API access
  console.log("Yakuza-fy | Creating global API access");
  window.YakuzaFy = {
    triggerIntro,
    triggerIntroFromJournal,
    closeIntroForAll: () => {
      console.log("Yakuza-fy | Global API: closeIntroForAll called");
      socket.executeForEveryone("closeIntro");
    }
  };

  // Expose API
  console.log("Yakuza-fy | Exposing module API");
  game.modules.get(YAKUZA_ID).api = {
    triggerIntro
  };
  console.log("Yakuza-fy | Module initialization complete");
}

/**
 * Handle showing an intro (socket handler)
 * @param {Object} yakuzaData - Data for the intro
 */
async function handleShowIntro(yakuzaData) {
  console.log("Yakuza-fy | Socket handler: showIntro received", yakuzaData);
  await showIntro(yakuzaData, handleGMClick);
  console.log("Yakuza-fy | Intro display completed via socket");
}

/**
 * Handle GM click on the intro overlay
 */
async function handleGMClick() {
  console.log("Yakuza-fy | Handling GM click on overlay");
  let closeBehavior = "ask";
  try {
    console.log("Yakuza-fy | Getting closeBehavior setting");
    closeBehavior = game.settings.get(YAKUZA_ID, "closeBehavior");
    console.log(`Yakuza-fy | Close behavior setting: ${closeBehavior}`);
  } catch (error) {
    console.warn("Yakuza-fy | Setting 'closeBehavior' not found, defaulting to 'ask'", error);
  }
  
  let forceClose = false;
  try {
    console.log("Yakuza-fy | Checking forceCloseTableMap setting");
    if (game.settings.settings.get(`${YAKUZA_ID}.forceCloseTableMap`)) {
      forceClose = game.settings.get(YAKUZA_ID, "forceCloseTableMap");
      console.log(`Yakuza-fy | Force close table map setting: ${forceClose}`);
    }
  } catch (error) {
    console.warn("Yakuza-fy | Setting 'forceCloseTableMap' not found or not registered", error);
  }
  
  let tableMapUserId = null;
  if (game.modules.get("table-map")?.active) {
    try {
      console.log("Yakuza-fy | Getting table-map userId setting");
      tableMapUserId = game.settings.get("table-map", "userId");
      console.log(`Yakuza-fy | Table map user ID: ${tableMapUserId}`);
    } catch (error) {
      console.warn("Yakuza-fy | Unable to access table-map.userId setting", error);
    } 
  }

  if (closeBehavior === "ask") {
    console.log("Yakuza-fy | Showing close confirmation dialog");
    new Dialog({
      title: "Close for all players?",
      content: "Do you want to close the intro for all players?",
      buttons: {
        yes: {
          label: "Yes",
          callback: () => {
            console.log("Yakuza-fy | Dialog: Yes clicked, closing for all players");
            socket.executeForEveryone("closeIntro");
          }
        },
        no: { 
          label: "No",
          callback: () => console.log("Yakuza-fy | Dialog: No clicked, not closing for others")
        }
      }
    }).render(true);
  } else if (closeBehavior === "always") {
    console.log("Yakuza-fy | Auto-closing for all players (closeBehavior=always)");
    socket.executeForEveryone("closeIntro");
  } else {
    console.log("Yakuza-fy | Not closing for other players (closeBehavior=never)");
  }

  if (forceClose && tableMapUserId) {
    console.log("Yakuza-fy | Force close enabled for table map user");
    const user = game.users.get(tableMapUserId);
    if (user?.active) {
      console.log(`Yakuza-fy | Closing intro for table map user: ${user.name}`);
      socket.executeAsUser("closeIntro", tableMapUserId);
    } else {
      console.log("Yakuza-fy | Table map user not active, skipping force close");
    }
  }
}

/**
 * Trigger an intro from a journal entry
 * @param {string} journalId - ID of the journal entry
 */
export function triggerIntroFromJournal(journalId) {
  console.log(`Yakuza-fy | Triggering intro from journal: ${journalId}`);
  const journal = game.journal.get(journalId);
  if (!journal) {
    console.error(`Yakuza-fy | Journal with ID ${journalId} not found`);
    ui.notifications.error(`Journal with ID ${journalId} not found.`);
    return;
  }
  console.log(`Yakuza-fy | Found journal: ${journal.name}`);

  console.log("Yakuza-fy | Creating yakuza data from journal");
  const yakuzaData = createYakuzaDataFromDefaultJournal(journal);
  console.log("Yakuza-fy | Yakuza data created:", yakuzaData);
  triggerIntro(yakuzaData);
}

/**
 * Trigger an intro with the provided data
 * @param {Object} yakuzaData - Data for the intro
 */
export function triggerIntro(yakuzaData) {
  console.log("Yakuza-fy | Triggering intro with data:", yakuzaData);
  if (!yakuzaData || !yakuzaData.image) {
    console.error("Yakuza-fy | Invalid yakuza data, missing image");
    ui.notifications.error("Invalid Yakuza data. Must contain an image.");
    return;
  }

  // Grant observer permission if enabled
  let giveObserverPermission = true;
  try {
    console.log("Yakuza-fy | Getting giveObserverPermission setting");
    giveObserverPermission = game.settings.get(YAKUZA_ID, "giveObserverPermission");
    console.log(`Yakuza-fy | Give observer permission setting: ${giveObserverPermission}`);
  } catch (error) {
    console.warn("Yakuza-fy | Setting 'giveObserverPermission' not found, defaulting to true", error);
  }

  if (giveObserverPermission && yakuzaData.journalId) {
    console.log(`Yakuza-fy | Checking journal permissions for ID: ${yakuzaData.journalId}`);
    const journal = game.journal.get(yakuzaData.journalId);
    if (journal && game.user.isGM) {
      console.log("Yakuza-fy | Granting observer permission to all users");
      const permissions = foundry.utils.duplicate(journal.ownership);
      permissions.default = CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER;
      journal.update({ ownership: permissions });
      console.log("Yakuza-fy | Observer permission granted");
    } else {
      console.log("Yakuza-fy | Cannot update permissions: journal not found or user not GM");
    }
  }

  // Show intro for all users
  console.log("Yakuza-fy | Executing showIntro for all users");
  socket.executeForEveryone("showIntro", yakuzaData);
  console.log("Yakuza-fy | Intro triggered for all users");
}
