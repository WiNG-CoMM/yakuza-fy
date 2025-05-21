/**
 * Yakuza-fy Utilities Module
 * Contains utility functions used across the module
 */

// Constants
export const YAKUZA_ID = "yakuza-fy";
import { logInfo, logDebug, logError, logWarning } from './yakuza-logging.js';

/**
 * Localize a string using the i18n system
 * @param {string} key - The translation key (without the YAKUZA_FY prefix)
 * @param {object} [data={}] - Optional data for string formatting
 * @returns {string} The localized string
 */
export function localize(key, data = {}) {
  // If i18n is not ready yet, return a fallback
  if (!game.i18n || !game.i18n.lang) {
    return getFallbackTranslation(key);
  }
  
  const fullKey = `YAKUZA_FY.${key}`;
  let result = game.i18n.format(fullKey, data);
  
  // If the translation is not found, return the key in a dev-friendly way
  if (result === fullKey) {
    logWarning(`Yakuza-fy | Missing translation for key: ${key}`);
    return getFallbackTranslation(key);
  }
  
  return result;
}

/**
 * Get a fallback translation for a key when i18n is not available
 * @param {string} key - The translation key
 * @returns {string} A fallback translation
 */
function getFallbackTranslation(key) {
  // Basic fallbacks for common keys
  const fallbacks = {
    "Name": "Yakuza-fy",
    "Button.Label": "Yakuza-fy",
    "Settings.CloseBehavior.Name": "Intro closing behavior",
    "Settings.CloseBehavior.Hint": "When GM clicks, what should happen for other users?",
    "Settings.CloseBehavior.Choices.ask": "Ask every time",
    "Settings.CloseBehavior.Choices.always": "Always close",
    "Settings.CloseBehavior.Choices.never": "Never close",
    "Settings.GiveObserverPermission.Name": "Give Observer Permission",
    "Settings.GiveObserverPermission.Hint": "Grant all players observer access automatically",
    "Settings.ForceCloseTableMap.Name": "Force close for Table Map user",
    "Settings.ForceCloseTableMap.Hint": "Always close the overlay for the Table Map user",
    "Settings.ImageAdaptationMode.Name": "Image Adaptation Mode",
    "Settings.ImageAdaptationMode.Hint": "How should images be displayed",
    "Settings.ImageScaleFactor.Name": "Image Scale Factor",
    "Settings.ImageScaleFactor.Hint": "Scale the image size",
    "Keybindings.CloseIntro.Name": "Close Yakuza Overlay",
    "Keybindings.CloseIntro.Hint": "Hotkey to close Yakuza overlay"
  };
  
  return fallbacks[key] || `[${key}]`;
}

/**
 * Get the current Foundry VTT version
 * @returns {number} The major version number
 */
export function getFoundryVersion() {
  const version = game.version ? Number(game.version.split('.')[0]) : 12;
  logDebug(`Yakuza-fy | Detected Foundry version: ${version}`);
  return version; // Default to 12.0 if not found
}

/**
 * Check if the current Foundry version is at least the specified version
 * @param {number} version - The version to check against
 * @returns {boolean} True if the current version is at least the specified version
 */
export function isFoundryVersionAtLeast(version) {
  const current = getFoundryVersion();
  const result = current >= version;
  logDebug(`Yakuza-fy | Checking if Foundry version ${current} is at least ${version}: ${result}`);
  return result;
}

/**
 * Load an image and return a promise
 * @param {string} src - The image source URL
 * @returns {Promise<HTMLImageElement|null>} A promise that resolves to the loaded image or null
 */
export function loadImage(src) {
  logDebug(`Yakuza-fy | Loading image: ${src}`);
  return new Promise(resolve => {
    if (!src) {
      logWarning("Yakuza-fy | No image source provided");
      return resolve(null);
    }
    const img = new Image();
    img.onload = () => {
      logDebug(`Yakuza-fy | Image loaded successfully: ${src} (${img.naturalWidth}x${img.naturalHeight})`);
      resolve(img);
    };
    img.onerror = () => {
      logError(`Yakuza-fy | Failed to load image: ${src}`);
      resolve(null);
    };
    img.src = src;
  });
}
