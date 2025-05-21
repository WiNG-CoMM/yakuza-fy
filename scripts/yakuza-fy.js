import { createYakuzaDataFromDefaultJournal } from './yakuza-data.js';

export class YakuzaIntro {
  static ID = "yakuza-fy";
  static socket;

  static getFoundryVersion() {
    return game.version ? Number(game.version.split('.')[0]) : 12; // Default to 12.0 if not found
  }

  static isFoundryVersionAtLeast(version) {
    const current = YakuzaIntro.getFoundryVersion();
    return current >= version;
  }

  static async init() {
    if (game.modules.get(YakuzaIntro.ID).api) return;
    if (!socketlib) throw new Error("Yakuza-fy requires socketlib");

    // Register settings before using them:
    YakuzaIntro.registerSettings();

    logDebug(`Yakuza-fy | Initializing for Foundry v${YakuzaIntro.getFoundryVersion()}`);

    // Initialize socket
    YakuzaIntro.socket = socketlib.registerModule(YakuzaIntro.ID);
    YakuzaIntro.socket.register("showIntro", YakuzaIntro.showIntro);
    YakuzaIntro.socket.register("closeIntro", YakuzaIntro.closeIntro);

    // Config buttons and context menu options
    YakuzaIntro.setupJournalButtons();

    // Expose API
    game.modules.get(YakuzaIntro.ID).api = {
      triggerIntro: YakuzaIntro.triggerIntro
    };
  }

  static setupJournalButtons() {
    YakuzaIntro.setupJournalButtons_v12();
    if (YakuzaIntro.isFoundryVersionAtLeast(13)) {
      // setupJournalButtons_v12 is still triggered before this one in V13 because DnD5e default sheet still uses it
      YakuzaIntro.setupJournalButtons_v13();
    }
  }

  static setupJournalButtons_v12() {
    logDebug("Yakuza-fy | Setting up journal buttons for v12");
    Hooks.on("getJournalSheetHeaderButtons", (sheet, buttons) => {
      if (!game.user.isGM) return;
      buttons.unshift({
        label: "Yakuza-fy",
        class: "yakuza-intro-button",
        icon: "fas fa-bomb",
        onclick: () => YakuzaIntro.triggerIntroFromJournal(sheet.object.id)
      });
    });
  }

  static setupJournalButtons_v13() {
    logDebug("Yakuza-fy | Setting up journal buttons for v13");
    
    Hooks.on("getHeaderControlsJournalEntrySheet", (app, controls) => {
      logDebug("Yakuza-fy | Adding header button to JournalEntrySheet", app);
      logDebug("Yakuza-fy | app keys:", Object.keys(app));
      logDebug("Yakuza-fy | app.document:", app.document);
      logDebug("Yakuza-fy | app.object:", app.object);
      
      if (!game.user.isGM) return;
      
      controls.unshift({
        label: "Yakuza-fy",
        class: "yakuza-intro-button",
        icon: "fas fa-bomb",
        onClick: () => {
          logDebug("Yakuza-fy | Header button clicked for v13");
          logDebug("Yakuza-fy | App in onclick:", app);
          
          // Intentar varias formas de obtener el ID
          let journalId = null;
          
          if (app.document && app.document.id) {
            journalId = app.document.id;
            logDebug("Yakuza-fy | Found ID via app.document.id:", journalId);
          } else if (app.object && app.object.id) {
            journalId = app.object.id;
            logDebug("Yakuza-fy | Found ID via app.object.id:", journalId);
          } else if (app.id) {
            journalId = app.id;
            logDebug("Yakuza-fy | Found ID via app.id:", journalId);
          } else if (app._id) {
            journalId = app._id;
            logDebug("Yakuza-fy | Found ID via app._id:", journalId);
          } else if (app.options && app.options.journalId) {
            journalId = app.options.journalId;
            logDebug("Yakuza-fy | Found ID via app.options.journalId:", journalId);
          } else if (app.options && app.options.pageId) {
            // Obtener el journalId desde el pageId
            const pageId = app.options.pageId;
            logDebug("Yakuza-fy | Found pageId:", pageId);
            // Buscar journal que contiene esta página
            for (const journal of game.journal) {
              if (journal.pages && journal.pages.has(pageId)) {
                journalId = journal.id;
                logDebug("Yakuza-fy | Found journal containing page:", journalId);
                break;
              }
            }
          }
          
          if (journalId) {
            logDebug("Yakuza-fy | Triggering intro with journalId:", journalId);
            YakuzaIntro.triggerIntroFromJournal(journalId);
          } else {
            logError("Yakuza-fy | Could not determine journal ID. Full app object:", app);
            
            // Último intento: tratar de usar el DocID directamente si estamos en la hoja de un journal
            if (app instanceof JournalSheet || app.constructor.name.includes("Journal")) {
              const sheetElement = app.element?.[0];
              if (sheetElement) {
                const dataDocId = sheetElement.dataset.documentId;
                if (dataDocId) {
                  logDebug("Yakuza-fy | Last resort - found document ID in DOM:", dataDocId);
                  YakuzaIntro.triggerIntroFromJournal(dataDocId);
                  return;
                }
              }
            }
            
            logError("Yakuza-fy | Could not determine journal ID.");
          }
        }
      });
      
      logDebug("Yakuza-fy | Button added, controls:", controls);
    });
  }

  static setupContextMenuHook() {
    logDebug(`Yakuza-fy | Setting up context menu hooks for v${YakuzaIntro.getFoundryVersion()}`);
    
    if (YakuzaIntro.isFoundryVersionAtLeast(13)) {
      YakuzaIntro.setupContextMenuHook_v13();
    } else {
      YakuzaIntro.setupContextMenuHook_v12();
    }
  }

  static setupContextMenuHook_v12() {
    logDebug("Yakuza-fy | Setting up context menu for v12");
    
    Hooks.on("getJournalDirectoryEntryContext", (html, options) => {
      if (!game.user.isGM) return;
      
      options.push({
        name: "Yakuza-fy",
        icon: '<i class="fas fa-bomb"></i>',
        callback: li => {
          const id = li.data("documentId");
          YakuzaIntro.triggerIntroFromJournal(id);
        }
      });
    });
  }

  static setupContextMenuHook_v13() {
    logDebug("Yakuza-fy | Setting up context menu for v13");
    
    Hooks.on("getJournalEntryContextOptions", (application, menuItems) => {
      logDebug("Yakuza-fy | Adding context menu option to JournalDirectory");
      if (!game.user.isGM) return;
      
      menuItems.push({
        name: "Yakuza-fy",
        icon: '<i class="fas fa-bomb"></i>',
        callback: (li) => {
          logDebug("Yakuza-fy | Context menu clicked for journal: ", li);
          // In Foundry v13, the attribute has changed from documentId to entryId
          const id = li.dataset.entryId || li.dataset.documentId;
          logDebug("Yakuza-fy | Attempting to use journal ID:", id);
          YakuzaIntro.triggerIntroFromJournal(id);
        }
      });
    });
  }

  static triggerIntroFromJournal(journalId) {
    const journal = game.journal.get(journalId);
    if (!journal) {
      logError("Yakuza-fy | Could not find journal entry.");
      return;
    }
    const yakuzaData = createYakuzaDataFromDefaultJournal(journal);
    YakuzaIntro.triggerIntro(yakuzaData);
  }

  static async triggerIntro(yakuzaData) {
    if (!game.user.isGM) return; 
    
    if (!yakuzaData || !yakuzaData.image ) {
      logError("Yakuza-fy | Invalid data: Must provide yakuzaData with an image.");
      return;
    }
    
    let shouldGrantObserver = false;
    try {
      shouldGrantObserver = game.settings.get(YakuzaIntro.ID, "giveObserverPermission");
    } catch (error) {
      logWarning("Yakuza-fy | Setting 'giveObserverPermission' not found, defaulting to false");
    } 
    
    if (shouldGrantObserver && yakuzaData.journalId) {
      const journal = game.journal.get(yakuzaData.journalId);
      if (journal) {
        const permissions = foundry.utils.duplicate(journal.ownership);
        if (permissions.default !== CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER) {
          permissions.default = CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER;
          await journal.update({ ownership: permissions });
        }
      }
    }
    
    await YakuzaIntro.socket.executeForEveryone("showIntro", yakuzaData);
  }

  static async showIntro(yakuzaData) {
    $("#yakuza-intro-overlay").remove();

    if (!yakuzaData.image) {
      logError("Yakuza-fy | Must contain an image.");
      return;
    }

    // Get image adaptation settings
    let adaptationMode = "auto";
    let scaleFactor = 100;
    try {
      adaptationMode = game.settings.get(YakuzaIntro.ID, "imageAdaptationMode");
      scaleFactor = game.settings.get(YakuzaIntro.ID, "imageScaleFactor");
    } catch (error) {
      logWarning("Yakuza-fy | Could not get image adaptation settings, using defaults");
    }

    // Preload the image before creating the overlay to ensure it's fully loaded
    const preloadedImage = await YakuzaIntro.loadImage(yakuzaData.image);
    
    // Create overlay with image container but don't append it yet
    // We'll hide both the overlay and the image initially
    const overlay = $(`
      <div id="yakuza-intro-overlay" class="yakuza-intro-overlay" style="opacity: 0;">
        <div id="yakuza-image-container" class="yakuza-image-container">
          <img src="${yakuzaData.image}" class="yakuza-intro-image" style="visibility: hidden;" data-adaptation-mode="${adaptationMode}" data-scale-factor="${scaleFactor}">
        </div>
        ${YakuzaIntro.buildTextElements(yakuzaData.title, yakuzaData.subtitle1, yakuzaData.subtitle2)}
      </div>
    `);
    
    // Append to DOM but keep it hidden
    overlay.appendTo(document.body);
    
    // Get the image element
    const img = overlay.find(".yakuza-intro-image")[0];
    
    // Apply adaptation immediately since we've already preloaded the image
    YakuzaIntro.applyImageAdaptation(img, adaptationMode, scaleFactor);
    
    // Small delay to ensure the browser has applied the styles
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Make the image visible first with scaling already applied
    $(img).css("visibility", "visible");
    
    // Then make the overlay visible
    overlay.css("opacity", "");
    
    await YakuzaIntro.animateElements();

    overlay.off("click").on("click", async () => {
      if (game.user.isGM) {
        overlay.remove();

        let closeBehavior = "ask";
        try {
          closeBehavior = game.settings.get(YakuzaIntro.ID, "closeBehavior");
        } catch (error) {
          logWarning("Yakuza-fy | Setting 'closeBehavior' not found, defaulting to 'ask'");
        }
        let forceClose = false;
        try {
          if (game.settings.settings.get(`${YakuzaIntro.ID}.forceCloseTableMap`)) {
            forceClose = game.settings.get(YakuzaIntro.ID, "forceCloseTableMap");
          }
        } catch (error) {
          logWarning("Yakuza-fy | Setting 'forceCloseTableMap' not found or not registered");
        }
        
        let tableMapUserId = null;
        if (game.modules.get("table-map")?.active) {
          try {
            tableMapUserId = game.settings.get("table-map", "userId");
          } catch (error) {
            logWarning("Yakuza-fy | Unable to access table-map.userId setting");
          } 
        }

        if (closeBehavior === "ask") {
          new Dialog({
            title: "Close for all players?",
            content: "Do you want to close the intro for all players?",
            buttons: {
              yes: {
                label: "Yes",
                callback: () => YakuzaIntro.socket.executeForEveryone("closeIntro")
              },
              no: { label: "No" }
            }
          }).render(true);
        } else if (closeBehavior === "always") {
          YakuzaIntro.socket.executeForEveryone("closeIntro");
        }

        if (forceClose && tableMapUserId) {
          const user = game.users.get(tableMapUserId);
          if (user?.active) YakuzaIntro.socket.executeAsUser("closeIntro", tableMapUserId);
        }
      } else {
        YakuzaIntro.closeIntro();
      }
    });
  }

  static closeIntro() {
    $("#yakuza-intro-overlay").stop(true).fadeOut(500, function () {
      $(this).remove();
    });
  }

  static buildTextElements(title, subtitle1, subtitle2) {
    let textElements = `<div class="yakuza-intro-text yakuza-title">${title}</div>`;
    if (subtitle1) textElements += `<div class="yakuza-intro-text yakuza-subtitle">${subtitle1}</div>`;
    if (subtitle2) textElements += `<div class="yakuza-intro-text yakuza-subtitle">${subtitle2}</div>`;
    return `
      <div class="yakuza-intro-text-wrapper">
        ${textElements}
      </div>
    `;
  }

  static async animateElements() {
    let skip = false;
    const overlay = $("#yakuza-intro-overlay");
    const image = overlay.find(".yakuza-intro-image");

    overlay.one("click", () => {
      skip = true;
      $(".yakuza-title, .yakuza-subtitle").stop(true, true).show();
      image.addClass("yakuza-intro-filtered");
    });

    await new Promise(r => setTimeout(r, skip ? 0 : 300));
    image.addClass("yakuza-intro-filtered");

    $(".yakuza-title").addClass("show");
    await new Promise(r => setTimeout(r, skip ? 0 : 1000));
    $(".yakuza-subtitle").each((i, el) => {
      $(el).delay(skip ? 0 : 300 * i).addClass("show");
    });
  }

  static loadImage(src) {
    return new Promise(resolve => {
      if (!src) return resolve(null);
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  static applyImageAdaptation(img, adaptationMode, scaleFactor) {
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
      logWarning(`Yakuza-fy | Normalized scale factor from ${scaleFactor}% to ${normalizedScaleFactor}%`);
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
    
    logDebug(`Yakuza-fy | Applied image adaptation: mode=${adaptationMode}, scale=${scale}, ` +
                `image=${imageWidth}x${imageHeight} (${isImagePortrait ? 'portrait' : 'landscape'}), ` +
                `screen=${screenWidth}x${screenHeight} (${isScreenPortrait ? 'portrait' : 'landscape'})`);
  }

  static registerKeybindings() {
    
    game.keybindings.register(YakuzaIntro.ID, "close-intro", {
      name: "Close Yakuza Overlay",
      hint: "Hotkey to close Yakuza overlay for all players",
      editable: [{ key: "KeyY", modifiers: ["Alt"] }],
      restricted: true,
      onDown: () => {
        if (game.user.isGM) {
          YakuzaIntro.socket.executeForEveryone("closeIntro");
        }
      },
      category: "Yakuza-fy"
    });
  }

  static registerSettings() {
    YakuzaIntro.registerCloseBehaviour();
    YakuzaIntro.registerGiveObserverPermission();
    YakuzaIntro.registerForceCloseTableMap();
    YakuzaIntro.registerImageAdaptationMode();
    YakuzaIntro.registerImageScaleFactor();
  }

  static registerCloseBehaviour() {
    game.settings.register(YakuzaIntro.ID, "closeBehavior", {
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

  static registerGiveObserverPermission() {
    game.settings.register(YakuzaIntro.ID, "giveObserverPermission", {
      name: "Give Observer Permission",
      hint: "Grant all players observer access automatically",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });
  }

  static registerForceCloseTableMap() {
    // Only needed if integrating with TableMap and already configured
    const hasTableMap = game.modules.get("table-map")?.active;
    let tableMapUserIdExists = false;
    
    if (hasTableMap) {
      try {
        game.settings.get("table-map", "userId");
        tableMapUserIdExists = true;
      } catch (error) {
        logWarning("Yakuza-fy | The 'table-map' module is active but 'userId' setting is not registered yet");
      }
    }
    
    if (hasTableMap && tableMapUserIdExists) {
      game.settings.register(YakuzaIntro.ID, "forceCloseTableMap", {
        name: "Force close for Table Map user",
        hint: "Always close the overlay for the Table Map user regardless of settings",
        scope: "world",
        config: true,
        type: Boolean,
        default: false
      });
    }
  }

  static registerImageAdaptationMode() {
    game.settings.register(YakuzaIntro.ID, "imageAdaptationMode", {
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

  static registerImageScaleFactor() {
    game.settings.register(YakuzaIntro.ID, "imageScaleFactor", {
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
}
