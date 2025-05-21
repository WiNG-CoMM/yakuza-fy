/**
 * Yakuza-fy Settings Module
 * Contains all settings registration and management
 */

import { YAKUZA_ID, localize } from './yakuza-utils.js';
import { logInfo, logDebug, logError, logWarning } from './yakuza-logging.js';

/**
 * Register all module settings
 */
export function registerSettings() {
  logDebug("Registering all settings");
  registerCloseBehaviour();
  registerGiveObserverPermission();
  registerForceCloseTableMap();
  registerImageAdaptationMode();
  registerImageScaleFactor();
  logDebug("All settings registered");
}

/**
 * Register the close behavior setting
 */
export function registerCloseBehaviour() {
  logDebug("Registering close behavior setting");
  game.settings.register(YAKUZA_ID, "closeBehavior", {
    name: localize("Settings.CloseBehavior.Name"),
    hint: localize("Settings.CloseBehavior.Hint"),
    scope: "world",
    config: true,
    default: "ask",
    type: String,
    choices: {
      ask: localize("Settings.CloseBehavior.Choices.ask"),
      always: localize("Settings.CloseBehavior.Choices.always"),
      never: localize("Settings.CloseBehavior.Choices.never")
    }
  });
}

/**
 * Register the observer permission setting
 */
export function registerGiveObserverPermission() {
  logDebug("Registering observer permission setting");
  game.settings.register(YAKUZA_ID, "giveObserverPermission", {
    name: localize("Settings.GiveObserverPermission.Name"),
    hint: localize("Settings.GiveObserverPermission.Hint"),
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
  logDebug("Checking for table-map module");
  // Only needed if integrating with TableMap and already configured
  const hasTableMap = game.modules.get("table-map")?.active;
  let tableMapUserIdExists = false;
  
  if (hasTableMap) {
    try {
      game.settings.get("table-map", "userId");
      tableMapUserIdExists = true;
    } catch (error) {
      logWarning("The 'table-map' module is active but 'userId' setting is not registered yet");
    }
  }
  
  if (hasTableMap && tableMapUserIdExists) {
    logDebug("Registering force close table map setting");
    game.settings.register(YAKUZA_ID, "forceCloseTableMap", {
      name: localize("Settings.ForceCloseTableMap.Name"),
      hint: localize("Settings.ForceCloseTableMap.Hint"),
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
  logDebug("Registering image adaptation mode setting");
  game.settings.register(YAKUZA_ID, "imageAdaptationMode", {
    name: localize("Settings.ImageAdaptationMode.Name"),
    hint: localize("Settings.ImageAdaptationMode.Hint"),
    scope: "world",
    config: true,
    default: "auto",
    type: String,
    choices: {
      auto: localize("Settings.ImageAdaptationMode.Choices.auto"),
      width: localize("Settings.ImageAdaptationMode.Choices.width"),
      height: localize("Settings.ImageAdaptationMode.Choices.height"),
      contain: localize("Settings.ImageAdaptationMode.Choices.contain")
    }
  });
}

/**
 * Register the image scale factor setting
 */
export function registerImageScaleFactor() {
  logDebug("Registering image scale factor setting");
  game.settings.register(YAKUZA_ID, "imageScaleFactor", {
    name: localize("Settings.ImageScaleFactor.Name"),
    hint: localize("Settings.ImageScaleFactor.Hint"),
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
  logDebug("Registering keybindings");
  game.keybindings.register(YAKUZA_ID, "close-intro", {
    name: localize("Keybindings.CloseIntro.Name"),
    hint: localize("Keybindings.CloseIntro.Hint"),
    editable: [{ key: "KeyY", modifiers: ["Alt"] }],
    restricted: true,
    onDown: () => {
      logDebug("Keybinding triggered");
      if (game.user.isGM) {
        // This will be connected in the core module
        if (window.YakuzaFy && window.YakuzaFy.closeIntroForAll) {
          logDebug("Executing closeIntroForAll via keybinding");
          window.YakuzaFy.closeIntroForAll();
        }
      }
    },
    category: localize("Name")
  });
}
