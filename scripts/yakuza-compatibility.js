/**
 * Yakuza-fy Compatibility Module
 * Contains version-specific code for different Foundry VTT versions
 */

import { YAKUZA_ID, isFoundryVersionAtLeast } from './yakuza-utils.js';

/**
 * Setup journal buttons based on Foundry version
 */
export function setupJournalButtons() {
  console.log("Yakuza-fy | Setting up journal buttons");
  // Setup for v12 (and compatible sheets in v13)
  setupJournalButtons_v12();
  
  // Setup for v13 if running on v13+
  if (isFoundryVersionAtLeast(13)) {
    setupJournalButtons_v13();
  }
  console.log("Yakuza-fy | Journal buttons setup complete");
}

/**
 * Setup journal buttons for Foundry v12
 */
function setupJournalButtons_v12() {
  console.log("Yakuza-fy | Setting up journal buttons for v12");
  Hooks.on("getJournalSheetHeaderButtons", (sheet, buttons) => {
    if (!game.user.isGM) return;
    buttons.unshift({
      label: "Yakuza-fy",
      class: "yakuza-intro-button",
      icon: "fas fa-bomb",
      onclick: () => {
        console.log("Yakuza-fy | v12 journal button clicked", sheet.object.id);
        if (window.YakuzaFy && window.YakuzaFy.triggerIntroFromJournal) {
          window.YakuzaFy.triggerIntroFromJournal(sheet.object.id);
        } else {
          console.error("Yakuza-fy | Global API not available");
          ui.notifications.error("Yakuza-fy API not available");
        }
      }
    });
  });
}

/**
 * Setup journal buttons for Foundry v13
 */
function setupJournalButtons_v13() {
  console.log("Yakuza-fy | Setting up journal buttons for v13");
  
  Hooks.on("getHeaderControlsJournalEntrySheet", (app, controls) => {
    console.log("Yakuza-fy | Adding header button to JournalEntrySheet", app);
    console.log("Yakuza-fy | app keys:", Object.keys(app));
    console.log("Yakuza-fy | app.document:", app.document);
    console.log("Yakuza-fy | app.object:", app.object);
    
    if (!game.user.isGM) return;
    
    controls.unshift({
      label: "Yakuza-fy",
      class: "yakuza-intro-button",
      icon: "fas fa-bomb",
      onClick: () => {
        console.log("Yakuza-fy | v13 journal button clicked");
        console.log("Yakuza-fy | Header button clicked for v13");
        console.log("Yakuza-fy | App in onclick:", app);
        
        // Intentar varias formas de obtener el ID
        let journalId = null;
        
        if (app.document && app.document.id) {
          journalId = app.document.id;
          console.log("Yakuza-fy | Found ID via app.document.id:", journalId);
        } else if (app.object && app.object.id) {
          journalId = app.object.id;
          console.log("Yakuza-fy | Found ID via app.object.id:", journalId);
        } else if (app.id) {
          journalId = app.id;
          console.log("Yakuza-fy | Found ID via app.id:", journalId);
        } else if (app._id) {
          journalId = app._id;
          console.log("Yakuza-fy | Found ID via app._id:", journalId);
        } else if (app.options && app.options.journalId) {
          journalId = app.options.journalId;
          console.log("Yakuza-fy | Found ID via app.options.journalId:", journalId);
        } else if (app.options && app.options.pageId) {
          // Obtener el journalId desde el pageId
          const pageId = app.options.pageId;
          console.log("Yakuza-fy | Found pageId:", pageId);
          // Buscar journal que contiene esta página
          for (const journal of game.journal) {
            if (journal.pages && journal.pages.has(pageId)) {
              journalId = journal.id;
              console.log("Yakuza-fy | Found journal ID from page:", journalId);
              break;
            }
          }
        }
        
        if (journalId) {
          console.log("Yakuza-fy | Triggering intro from journal ID:", journalId);
          if (window.YakuzaFy && window.YakuzaFy.triggerIntroFromJournal) {
            window.YakuzaFy.triggerIntroFromJournal(journalId);
          } else {
            console.error("Yakuza-fy | Global API not available");
            ui.notifications.error("Yakuza-fy API not available");
          }
        } else {
          console.error("Yakuza-fy | Could not determine Journal ID");
          ui.notifications.error("Could not determine Journal ID");
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
  console.log("Yakuza-fy | Setting up context menu hooks");
  // Setup for v12
  setupContextMenuHook_v12();
  
  // Setup for v13 if running on v13+
  if (isFoundryVersionAtLeast(13)) {
    setupContextMenuHook_v13();
  }
  console.log("Yakuza-fy | Context menu hooks setup complete");
}

/**
 * Setup context menu for Foundry v12
 * @param {Function} triggerIntroFromJournal - Function to trigger intro from journal
 */
function setupContextMenuHook_v12() {
  console.log("Yakuza-fy | Setting up context menu for v12");
  Hooks.on("getJournalDirectoryEntryContext", (html, options) => {
    if (!game.user.isGM) return;
    
    options.push({
      name: "Yakuza-fy",
      icon: '<i class="fas fa-bomb"></i>',
      condition: li => {
        const id = li.data("documentId") || li.data("entryId");
        return !!id;
      },
      callback: li => {
        const id = li.data("documentId") || li.data("entryId");
        console.log("Yakuza-fy | v12 context menu triggered for journal ID:", id);
        if (window.YakuzaFy && window.YakuzaFy.triggerIntroFromJournal) {
          window.YakuzaFy.triggerIntroFromJournal(id);
        } else {
          console.error("Yakuza-fy | Global API not available");
          ui.notifications.error("Yakuza-fy API not available");
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
  console.log("Yakuza-fy | Setting up context menu for v13");
  Hooks.on("getJournalEntryDirectoryEntryContext", (html, options) => {
    if (!game.user.isGM) return;
    
    options.push({
      name: "Yakuza-fy",
      icon: '<i class="fas fa-bomb"></i>',
      condition: li => {
        const id = li.data("documentId") || li.data("entryId") || li.data("document-id") || li.data("entry-id");
        return !!id;
      },
      callback: li => {
        const id = li.data("documentId") || li.data("entryId") || li.data("document-id") || li.data("entry-id");
        console.log("Yakuza-fy | v13 context menu triggered for journal ID:", id);
        if (window.YakuzaFy && window.YakuzaFy.triggerIntroFromJournal) {
          window.YakuzaFy.triggerIntroFromJournal(id);
        } else {
          console.error("Yakuza-fy | Global API not available");
          ui.notifications.error("Yakuza-fy API not available");
        }
      }
    });
  });
}
