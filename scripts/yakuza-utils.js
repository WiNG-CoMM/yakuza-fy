/**
 * Yakuza-fy Utilities Module
 * Contains utility functions used across the module
 */

// Constants
export const YAKUZA_ID = "yakuza-fy";

/**
 * Get the current Foundry VTT version
 * @returns {number} The major version number
 */
export function getFoundryVersion() {
  const version = game.version ? Number(game.version.split('.')[0]) : 12;
  console.log(`Yakuza-fy | Detected Foundry version: ${version}`);
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
  console.log(`Yakuza-fy | Checking if Foundry version ${current} is at least ${version}: ${result}`);
  return result;
}

/**
 * Load an image and return a promise
 * @param {string} src - The image source URL
 * @returns {Promise<HTMLImageElement|null>} A promise that resolves to the loaded image or null
 */
export function loadImage(src) {
  console.log(`Yakuza-fy | Loading image: ${src}`);
  return new Promise(resolve => {
    if (!src) {
      console.warn("Yakuza-fy | No image source provided");
      return resolve(null);
    }
    const img = new Image();
    img.onload = () => {
      console.log(`Yakuza-fy | Image loaded successfully: ${src} (${img.naturalWidth}x${img.naturalHeight})`);
      resolve(img);
    };
    img.onerror = () => {
      console.error(`Yakuza-fy | Failed to load image: ${src}`);
      resolve(null);
    };
    img.src = src;
  });
}
