/**
 * Yakuza-fy Compatibility Module
 * Contains version-specific code for different Foundry VTT versions
 */

import { YAKUZA_ID, isFoundryVersionAtLeast, localize} from './yakuza-utils.js';
import { logDebug, logError, logWarning } from './yakuza-logging.js';

/**
 * Setup journal buttons based on Foundry version
 */
export function setupJournalButtons() {
  logDebug("Setting up journal buttons");
  // Setup for v12 (and compatible sheets in v13)
  setupJournalButtons_v12();
  
  // Setup for v13 if running on v13+
  if (isFoundryVersionAtLeast(13)) {
    setupJournalButtons_v13();
  }
  logDebug("Journal buttons setup complete");
}

/**
 * Setup journal buttons for Foundry v12
 */
function setupJournalButtons_v12() {
  logDebug("Setting up journal buttons for v12");
  Hooks.on("getJournalSheetHeaderButtons", (sheet, buttons) => {
    if (!game.user.isGM) return;
    buttons.unshift({
      label: localize("Button.Label"),
      class: "yakuza-intro-button",
      icon: "fas fa-bomb",
      onclick: () => {
        logDebug("v12 journal button clicked", sheet.object.id);
        if (window.YakuzaFy && window.YakuzaFy.triggerIntroFromJournal) {
          window.YakuzaFy.triggerIntroFromJournal(sheet.object.id);
        } else {
          logError("Global API not available");
          ui.notifications.error(localize("Notifications.ApiNotAvailable"));
        }
      }
    });
  });
}

/**
 * Setup journal buttons for Foundry v13
 */
function setupJournalButtons_v13() {
  logDebug("Setting up journal buttons for v13");
  
  Hooks.on("getHeaderControlsJournalEntrySheet", (app, controls) => {
    logDebug("Adding header button to JournalEntrySheet", app);
    logDebug("app keys:", Object.keys(app));
    logDebug("app.document:", app.document);
    logDebug("app.object:", app.object);
    
    if (!game.user.isGM) return;
    
    controls.unshift({
      label: localize("Button.Label"),
      class: "yakuza-intro-button",
      icon: "fas fa-bomb",
      onClick: () => {
        logDebug("v13 journal button clicked");
        logDebug("Header button clicked for v13");
        logDebug("App in onclick:", app);
        
        // Attempt several ways to obtain Id
        let journalId = null;
        
        if (app.document && app.document.id) {
          journalId = app.document.id;
          logDebug("Found ID via app.document.id:", journalId);
        } else if (app.object && app.object.id) {
          journalId = app.object.id;
          logDebug("Found ID via app.object.id:", journalId);
        } else if (app.id) {
          journalId = app.id;
          logDebug("Found ID via app.id:", journalId);
        } else if (app._id) {
          journalId = app._id;
          logDebug("Found ID via app._id:", journalId);
        } else if (app.options && app.options.journalId) {
          journalId = app.options.journalId;
          logDebug("Found ID via app.options.journalId:", journalId);
        } else if (app.options && app.options.pageId) {
          // Get journalId from pageId
          const pageId = app.options.pageId;
          logDebug("Found pageId:", pageId);
          // Search for journal containing this page
          for (const journal of game.journal) {
            if (journal.pages && journal.pages.has(pageId)) {
              journalId = journal.id;
              logDebug("Found journal ID from page:", journalId);
              break;
            }
          }
        }
        
        if (journalId) {
          logDebug("Triggering intro from journal ID:", journalId);
          if (window.YakuzaFy && window.YakuzaFy.triggerIntroFromJournal) {
            window.YakuzaFy.triggerIntroFromJournal(journalId);
          } else {
            logError("Global API not available");
            ui.notifications.error(localize("Notifications.ApiNotAvailable"));
          }
        } else {
          logError("Could not determine Journal ID");
          ui.notifications.error(localize("Notifications.NoJournalId"));
        }
      }
    });
  });
}

/**
 * Setup context menu hooks based on Foundry version
 * @param {Function} triggerIntroFromJournal - Function to trigger intro from journal
 */
export function setupContextMenuHook() {
  logDebug("Setting up context menu hooks");
  
  // Setup for v13 if running on v13+
  if (isFoundryVersionAtLeast(13)) {
    setupContextMenuHook_v13();
  } else {
    // Setup for v12
    setupContextMenuHook_v12(); 
  }
  logDebug("Context menu hooks setup complete");
}

/**
 * Setup context menu for Foundry v12
 * @param {Function} triggerIntroFromJournal - Function to trigger intro from journal
 */
function setupContextMenuHook_v12() {
  logDebug("Setting up context menu for v12");
  Hooks.on("getJournalDirectoryEntryContext", (html, options) => {
    if (!game.user.isGM) return;
    
    options.push({
      name: localize("Button.Label"),
      icon: '<i class="fas fa-bomb"></i>',
      condition: li => {
        const id = li.data("documentId") || li.data("entryId");
        return !!id;
      },
      callback: li => {
        const id = li.data("documentId") || li.data("entryId");
        logDebug("v12 context menu triggered for journal ID:", id);
        if (window.YakuzaFy && window.YakuzaFy.triggerIntroFromJournal) {
          window.YakuzaFy.triggerIntroFromJournal(id);
        } else {
          logError("Global API not available");
          ui.notifications.error(localize("Notifications.ApiNotAvailable"));
        }
      }
    });
  });
}

/**
 * Setup context menu for Foundry v13
 * @param {Function} triggerIntroFromJournal - Function to trigger intro from journal
 */
function setupContextMenuHook_v13() {
  logDebug("Setting up context menu for v13");
  Hooks.on("getJournalEntryContextOptions", (application, menuItems) => {
    if (!game.user.isGM) return;
    
    menuItems.push({
      name: localize("Button.Label"),
      icon: '<i class="fas fa-bomb"></i>',
      callback: (li) => {
        logDebug("Context menu clicked for journal: ", li);
        // In Foundry v13, the attribute has changed from documentId to entryId
        const id = li.dataset.entryId || li.dataset.documentId;
        logDebug("v13 context menu triggered for journal ID:", id);
        if (window.YakuzaFy && window.YakuzaFy.triggerIntroFromJournal) {
          window.YakuzaFy.triggerIntroFromJournal(id);
        } else {
          logError("Global API not available");
          ui.notifications.error(localize("Notifications.ApiNotAvailable"));
        }
      }
    });
  });
}

/**
 * Unified Dialog for Foundry v12 and v13
 */
export function unifiedDialog(title, content, buttons, defaultButton) {
  logDebug("Showing dialog for v12/v13");
  if (isFoundryVersionAtLeast(13)) {
    return dialog_V13(title, content, buttons);
  } else {
    return dialog_V12(title, content, buttons, defaultButton);
  }
}

/**
 * Old Dialog for Foundry v12
 */
function dialog_V12(title, content, buttons, defaultButton) {
  logDebug("Showing dialog for v12");
  logDebug("Title:", title);
  logDebug("Content:", content);
  logDebug("Buttons:", buttons);
  logDebug("Default Button:", defaultButton);

  const transformedButtons = transformButtonsIntoV2(buttons);

  logDebug("Transformed Buttons:", transformedButtons);
  return new Dialog({
        title: title,
        content: content,
        buttons: transformedButtons,
        default: defaultButton
      }).render(true);
}

/**
 * New Dialog for Foundry v13
 */
function dialog_V13(title, content, buttons) {
  logDebug("Showing dialog for v13");
  logDebug("Title:", title);
  logDebug("Content:", content);
  logDebug("Buttons:", buttons);

  // Wrap buttons in a config object as required by DialogV2
  return new foundry.applications.api.DialogV2({
    window: { title: title },
    content: content,
    buttons: buttons
  }).render(true);
}

function transformButtonsIntoV2(buttonArray) {
  const buttonObj = {};

  for (const btn of buttonArray) {
    if (!btn.action || !btn.label || typeof btn.callback !== "function") {
      console.warn("Skipping invalid button:", btn);
      continue;
    }

    buttonObj[btn.action] = {
      label: btn.label,
      callback: btn.callback
    };
  }

  return buttonObj;
}
