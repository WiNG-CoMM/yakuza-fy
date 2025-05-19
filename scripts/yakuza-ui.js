/**
 * Yakuza-fy UI Module
 * Contains functions related to UI rendering and animations
 */

import { loadImage } from './yakuza-utils.js';

/**
 * Build the text elements for the intro overlay
 * @param {string} title - The main title
 * @param {string} subtitle1 - The first subtitle
 * @param {string} subtitle2 - The second subtitle
 * @returns {string} HTML string for the text elements
 */
export function buildTextElements(title, subtitle1, subtitle2) {
  console.log(`Yakuza-fy | Building text elements: title="${title}", subtitle1="${subtitle1}", subtitle2="${subtitle2}"`);
  return `
    <div class="yakuza-intro-text-wrapper">
      <div class="yakuza-intro-text yakuza-title">${title}</div>
      <div class="yakuza-intro-text yakuza-subtitle">${subtitle1}</div>
      <div class="yakuza-intro-text yakuza-subtitle">${subtitle2}</div>
    </div>
  `;
}

/**
 * Animate the intro elements
 * @returns {Promise<void>} Promise that resolves when animation is complete
 */
export async function animateElements() {
  console.log("Yakuza-fy | Starting animation sequence");
  let skip = false;
  const overlay = $("#yakuza-intro-overlay");
  const image = overlay.find(".yakuza-intro-image");

  overlay.one("click", () => {
    console.log("Yakuza-fy | Animation skipped by user click");
    skip = true;
    $(".yakuza-title, .yakuza-subtitle").stop(true, true).show();
    image.addClass("yakuza-intro-filtered");
  });

  await new Promise(r => setTimeout(r, skip ? 0 : 300));
  console.log("Yakuza-fy | Adding filtered effect to image");
  image.addClass("yakuza-intro-filtered");

  console.log("Yakuza-fy | Showing title");
  $(".yakuza-title").addClass("show");
  await new Promise(r => setTimeout(r, skip ? 0 : 1000));
  console.log("Yakuza-fy | Showing subtitles");
  $(".yakuza-subtitle").each((i, el) => {
    $(el).delay(skip ? 0 : 300 * i).addClass("show");
  });
  console.log("Yakuza-fy | Animation sequence complete");
}

/**
 * Apply image adaptation based on mode and scale factor
 * @param {HTMLImageElement} img - The image element
 * @param {string} adaptationMode - The adaptation mode (auto, width, height, contain)
 * @param {number} scaleFactor - The scale factor (75-125)
 */
export function applyImageAdaptation(img, adaptationMode, scaleFactor) {
  console.log(`Yakuza-fy | Applying image adaptation: mode=${adaptationMode}, scaleFactor=${scaleFactor}`);
  // Get image dimensions
  const imageWidth = img.naturalWidth;
  const imageHeight = img.naturalHeight;
  const imageRatio = imageWidth / imageHeight;
  
  // Get screen dimensions
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const screenRatio = screenWidth / screenHeight;
  
  // Determine if screen is in portrait or landscape mode
  const isScreenPortrait = screenHeight > screenWidth;
  
  // Determine if image is in portrait or landscape mode
  const isImagePortrait = imageHeight > imageWidth;
  
  // Normalize scale factor to ensure it's within our limits (75-125)
  let normalizedScaleFactor = Math.max(75, Math.min(125, scaleFactor));
  
  // If we had to normalize, log a warning
  if (normalizedScaleFactor !== scaleFactor) {
    console.warn(`Yakuza-fy | Normalized scale factor from ${scaleFactor}% to ${normalizedScaleFactor}%`);
  }
  
  // Apply normalized scale factor (convert from percentage to decimal)
  const scale = normalizedScaleFactor / 100;
  
  // Get the image container
  const container = $(img).parent();
  
  // Reset any previously applied styles
  $(img).css({
    'width': '',
    'height': '',
    'object-fit': '',
    'transform': ''
  });
  
  // Apply adaptation mode
  let objectFit = 'cover'; // Default
  let width = '100%';
  let height = '100%';
  
  switch (adaptationMode) {
    case 'width':
      // Fit to width
      objectFit = 'contain';
      width = '100%';
      height = 'auto';
      break;
      
    case 'height':
      // Fit to height
      objectFit = 'contain';
      width = 'auto';
      height = '100%';
      break;
      
    case 'contain':
      // Show entire image
      objectFit = 'contain';
      break;
      
    case 'auto':
    default:
      // Auto mode - adapt based on screen and image orientation
      if (isScreenPortrait === isImagePortrait) {
        // Screen and image have same orientation
        objectFit = 'cover';
      } else {
        // Screen and image have different orientations
        if (isScreenPortrait) {
          // Screen is portrait, image is landscape
          width = '100%';
          height = 'auto';
        } else {
          // Screen is landscape, image is portrait
          width = 'auto';
          height = '100%';
        }
        objectFit = 'contain';
      }
      break;
  }
  
  // Apply the styles with scale factor
  $(img).css({
    'width': width,
    'height': height,
    'object-fit': objectFit,
    'transform': `scale(${scale})`,
    'transform-origin': 'center center'
  });
  
  console.log(`Yakuza-fy | Applied image adaptation: mode=${adaptationMode}, scale=${scale}, ` +
              `image=${imageWidth}x${imageHeight} (${isImagePortrait ? 'portrait' : 'landscape'}), ` +
              `screen=${screenWidth}x${screenHeight} (${isScreenPortrait ? 'portrait' : 'landscape'})`);
}

/**
 * Close the intro overlay
 */
export function closeIntro() {
  console.log("Yakuza-fy | Closing intro overlay");
  $("#yakuza-intro-overlay").stop(true).fadeOut(500, function () {
    console.log("Yakuza-fy | Intro overlay removed from DOM");
    $(this).remove();
  });
}

/**
 * Show the intro overlay
 * @param {Object} yakuzaData - Data for the intro (image, title, subtitles)
 * @param {Function} onGMClick - Function to handle GM click events
 * @returns {Promise<void>} Promise that resolves when intro is shown
 */
export async function showIntro(yakuzaData, onGMClick) {
  console.log("Yakuza-fy | Showing intro with data:", yakuzaData);
  $("#yakuza-intro-overlay").remove();

  if (!yakuzaData.image) {
    console.error("Yakuza-fy | No image provided in yakuzaData");
    ui.notifications.error("Must contain an image.");
    return;
  }

  // Get image adaptation settings
  let adaptationMode = "auto";
  let scaleFactor = 100;
  try {
    console.log("Yakuza-fy | Getting image adaptation settings");
    adaptationMode = game.settings.get("yakuza-fy", "imageAdaptationMode");
    scaleFactor = game.settings.get("yakuza-fy", "imageScaleFactor");
    console.log(`Yakuza-fy | Retrieved settings: mode=${adaptationMode}, scale=${scaleFactor}`);
  } catch (error) {
    console.warn("Yakuza-fy | Could not get image adaptation settings, using defaults", error);
  }

  // Preload the image before creating the overlay to ensure it's fully loaded
  console.log("Yakuza-fy | Preloading image");
  const preloadedImage = await loadImage(yakuzaData.image);
  
  // Create overlay with image container but don't append it yet
  // We'll hide both the overlay and the image initially
  console.log("Yakuza-fy | Creating overlay DOM structure");
  const overlay = $(`
    <div id="yakuza-intro-overlay" class="yakuza-intro-overlay" style="opacity: 0;">
      <div id="yakuza-image-container" class="yakuza-image-container">
        <img src="${yakuzaData.image}" class="yakuza-intro-image" style="visibility: hidden;" data-adaptation-mode="${adaptationMode}" data-scale-factor="${scaleFactor}">
      </div>
      ${buildTextElements(yakuzaData.title, yakuzaData.subtitle1, yakuzaData.subtitle2)}
    </div>
  `);
  
  // Append to DOM but keep it hidden
  console.log("Yakuza-fy | Appending overlay to document body (still hidden)");
  overlay.appendTo(document.body);
  
  // Get the image element
  const img = overlay.find(".yakuza-intro-image")[0];
  
  // Apply adaptation immediately since we've already preloaded the image
  console.log("Yakuza-fy | Applying image adaptation");
  applyImageAdaptation(img, adaptationMode, scaleFactor);
  
  // Small delay to ensure the browser has applied the styles
  console.log("Yakuza-fy | Waiting for browser to apply styles");
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // Make the image visible first with scaling already applied
  console.log("Yakuza-fy | Making image visible");
  $(img).css("visibility", "visible");
  
  // Then make the overlay visible
  console.log("Yakuza-fy | Making overlay visible");
  overlay.css("opacity", "");
  
  await animateElements();

  overlay.off("click").on("click", async () => {
    console.log("Yakuza-fy | Overlay clicked by user: " + (game.user.isGM ? "GM" : "Player"));
    if (game.user.isGM) {
      console.log("Yakuza-fy | GM clicked - removing overlay");
      overlay.remove();
      
      // Call the provided GM click handler
      if (onGMClick) {
        console.log("Yakuza-fy | Calling GM click handler");
        onGMClick();
      }
    } else {
      console.log("Yakuza-fy | Player clicked - closing intro");
      closeIntro();
    }
  });
  console.log("Yakuza-fy | Intro display setup complete");
}
