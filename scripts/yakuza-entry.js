/**
 * Yakuza-fy Entry Point
 * Main entry point for the Yakuza-fy module
 */

import { init } from './yakuza-core.js';
import { setupContextMenuHook, setupJournalButtons } from './yakuza-compatibility.js';
import { registerKeybindings } from './yakuza-settings.js';

console.log("Yakuza-fy | Entry module loaded");

// Initialize context menu hooks
Hooks.once("init", () => {
  console.log("Yakuza-fy | init hook triggered");
  setupContextMenuHook();
});

// Initialize the module when ready
Hooks.once("ready", async () => {
  console.log("Yakuza-fy | ready hook triggered");
  await init();
  
  // Setup journal buttons
  setupJournalButtons();
  
  console.log("Yakuza-fy | Module initialization complete");
});

// Register keybindings during setup
Hooks.once("setup", () => registerKeybindings());