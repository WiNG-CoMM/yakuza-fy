/**
 * Yakuza-fy Entry Point
 * Main entry point for the Yakuza-fy module
 */

import { init } from './yakuza-core.js';
import { setupContextMenuHook, setupJournalButtons } from './yakuza-compatibility.js';
import { registerKeybindings } from './yakuza-settings.js';
import { logInfo, logDebug, logError, logWarning } from './yakuza-logging.js';

// Module initialization state
let i18nInitialized = false;
let moduleInitialized = false;

logInfo("Entry module loaded");

// Initialize when Foundry core is ready
Hooks.once("init", () => {
  logDebug("init hook triggered");
  
  // Set up context menu hooks early
  setupContextMenuHook();
});

// Register keybindings during setup
Hooks.once("setup", () => {
  logDebug("setup hook triggered");
  registerKeybindings();
});

// Wait for i18n to be initialized
Hooks.once("i18nInit", () => {
  logDebug(`i18nInit hook triggered, language: ${game.i18n.lang}`);
  i18nInitialized = true;
  
  // If ready hook has already fired, initialize the module now
  if (game.ready && !moduleInitialized) {
    initializeModule();
  }
});

// Initialize the module when ready
Hooks.once("ready", () => {
  logDebug("ready hook triggered");
  
  // If i18n is already initialized, initialize the module now
  if (i18nInitialized && !moduleInitialized) {
    initializeModule();
  }
});

/**
 * Initialize the module after both i18n and ready hooks have fired
 */
async function initializeModule() {
  if (moduleInitialized) return;
  moduleInitialized = true;
  
  logInfo(`Initializing module with language: ${game.i18n.lang}`);
  
  // Initialize the module
  await init();
  
  // Setup journal buttons
  setupJournalButtons();
  
  logInfo("Module initialization complete");
}