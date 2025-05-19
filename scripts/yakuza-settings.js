/**
 * Yakuza-fy Settings Module
 * Contains all settings registration and management
 */

import { YAKUZA_ID } from './yakuza-utils.js';

/**
 * Register all module settings
 */
export function registerSettings() {
  console.log("Yakuza-fy | Registering all settings");
  registerCloseBehaviour();
  registerGiveObserverPermission();
  registerForceCloseTableMap();
  registerImageAdaptationMode();
  registerImageScaleFactor();
  console.log("Yakuza-fy | All settings registered");
}

/**
 * Register the close behavior setting
 */
export function registerCloseBehaviour() {
  console.log("Yakuza-fy | Registering close behavior setting");
  game.settings.register(YAKUZA_ID, "closeBehavior", {
    name: "Intro closing behavior",
    hint: "When GM clicks, what should happen for other users?",
    scope: "world",
    config: true,
    default: "ask",
    type: String,
    choices: {
      ask: "Ask every time",
      always: "Always close",
      never: "Never close"
    }
  });
}

/**
 * Register the observer permission setting
 */
export function registerGiveObserverPermission() {
  console.log("Yakuza-fy | Registering observer permission setting");
  game.settings.register(YAKUZA_ID, "giveObserverPermission", {
    name: "Give Observer Permission",
    hint: "Grant all players observer access automatically",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
}

/**
 * Register the table map force close setting
 */
export function registerForceCloseTableMap() {
  console.log("Yakuza-fy | Checking for table-map module");
  // Only needed if integrating with TableMap and already configured
  const hasTableMap = game.modules.get("table-map")?.active;
  let tableMapUserIdExists = false;
  
  if (hasTableMap) {
    try {
      game.settings.get("table-map", "userId");
      tableMapUserIdExists = true;
    } catch (error) {
      console.warn("Yakuza-fy | The 'table-map' module is active but 'userId' setting is not registered yet");
    }
  }
  
  if (hasTableMap && tableMapUserIdExists) {
    console.log("Yakuza-fy | Registering force close table map setting");
    game.settings.register(YAKUZA_ID, "forceCloseTableMap", {
      name: "Force close for Table Map user",
      hint: "Always close the overlay for the Table Map user regardless of settings",
      scope: "world",
      config: true,
      type: Boolean,
      default: false
    });
  }
}

/**
 * Register the image adaptation mode setting
 */
export function registerImageAdaptationMode() {
  console.log("Yakuza-fy | Registering image adaptation mode setting");
  game.settings.register(YAKUZA_ID, "imageAdaptationMode", {
    name: "Image Adaptation Mode",
    hint: "How should images be displayed in the intro overlay",
    scope: "world",
    config: true,
    default: "auto",
    type: String,
    choices: {
      auto: "Automatic (based on image and screen orientation)",
      width: "Fit to Width",
      height: "Fit to Height",
      contain: "Contain (show entire image, may have empty space)"
    }
  });
}

/**
 * Register the image scale factor setting
 */
export function registerImageScaleFactor() {
  console.log("Yakuza-fy | Registering image scale factor setting");
  game.settings.register(YAKUZA_ID, "imageScaleFactor", {
    name: "Image Scale Factor",
    hint: "Scale the image size (75% to 125%)",
    scope: "world",
    config: true,
    type: Number,
    default: 100,
    range: {
      min: 75,
      max: 125,
      step: 5
    }
  });
}

/**
 * Register keybindings for the module
 */
export function registerKeybindings() {
  console.log("Yakuza-fy | Registering keybindings");
  game.keybindings.register(YAKUZA_ID, "close-intro", {
    name: "Close Yakuza Overlay",
    hint: "Hotkey to close Yakuza overlay for all players",
    editable: [{ key: "KeyY", modifiers: ["Alt"] }],
    restricted: true,
    onDown: () => {
      console.log("Yakuza-fy | Keybinding triggered");
      if (game.user.isGM) {
        // This will be connected in the core module
        if (window.YakuzaFy && window.YakuzaFy.closeIntroForAll) {
          console.log("Yakuza-fy | Executing closeIntroForAll via keybinding");
          window.YakuzaFy.closeIntroForAll();
        }
      }
    },
    category: "Yakuza-fy"
  });
}
