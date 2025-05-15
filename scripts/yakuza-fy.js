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

    console.log(`Yakuza-fy | Initializing for Foundry v${YakuzaIntro.getFoundryVersion()}`);

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
    console.log("Yakuza-fy | Setting up journal buttons for v12");
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
                console.log("Yakuza-fy | Found journal containing page:", journalId);
                break;
              }
            }
          }
          
          if (journalId) {
            console.log("Yakuza-fy | Triggering intro with journalId:", journalId);
            YakuzaIntro.triggerIntroFromJournal(journalId);
          } else {
            console.error("Yakuza-fy | Could not determine journal ID. Full app object:", app);
            
            // Último intento: tratar de usar el DocID directamente si estamos en la hoja de un journal
            if (app instanceof JournalSheet || app.constructor.name.includes("Journal")) {
              const sheetElement = app.element?.[0];
              if (sheetElement) {
                const dataDocId = sheetElement.dataset.documentId;
                if (dataDocId) {
                  console.log("Yakuza-fy | Last resort - found document ID in DOM:", dataDocId);
                  YakuzaIntro.triggerIntroFromJournal(dataDocId);
                  return;
                }
              }
            }
            
            ui.notifications.error("Could not determine journal ID.");
          }
        }
      });
      
      console.log("Yakuza-fy | Button added, controls:", controls);
    });
  }

  static setupContextMenuHook() {
    console.log(`Yakuza-fy | Setting up context menu hooks for v${YakuzaIntro.getFoundryVersion()}`);
    
    if (YakuzaIntro.isFoundryVersionAtLeast(13)) {
      YakuzaIntro.setupContextMenuHook_v13();
    } else {
      YakuzaIntro.setupContextMenuHook_v12();
    }
  }

  static setupContextMenuHook_v12() {
    console.log("Yakuza-fy | Setting up context menu for v12");
    
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
    console.log("Yakuza-fy | Setting up context menu for v13");
    
    Hooks.on("getJournalEntryContextOptions", (application, menuItems) => {
      console.log("Yakuza-fy | Adding context menu option to JournalDirectory");
      if (!game.user.isGM) return;
      
      menuItems.push({
        name: "Yakuza-fy",
        icon: '<i class="fas fa-bomb"></i>',
        callback: (li) => {
          console.log("Yakuza-fy | Context menu clicked for journal: ", li);
          // In Foundry v13, the attribute has changed from documentId to entryId
          const id = li.dataset.entryId || li.dataset.documentId;
          console.log("Yakuza-fy | Attempting to use journal ID:", id);
          YakuzaIntro.triggerIntroFromJournal(id);
        }
      });
    });
  }

  static triggerIntroFromJournal(journalId) {
    const journal = game.journal.get(journalId);
    if (!journal) {
      ui.notifications.error("Could not find journal entry.");
      return;
    }
    const yakuzaData = createYakuzaDataFromDefaultJournal(journal);
    YakuzaIntro.triggerIntro(yakuzaData);
  }

  static async triggerIntro(yakuzaData) {
    if (!game.user.isGM) return; 
    
    if (!yakuzaData || !yakuzaData.image ) {
      ui.notifications.error("Invalid data: Must provide yakuzaData with an image.");
      return;
    }
    
    let shouldGrantObserver = false;
    try {
      shouldGrantObserver = game.settings.get(YakuzaIntro.ID, "giveObserverPermission");
    } catch (error) {
      console.warn("Yakuza-fy | Setting 'giveObserverPermission' not found, defaulting to false");
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
      ui.notifications.error("Must contain an image.");
      return;
    }

    const overlay = $(`
      <div id="yakuza-intro-overlay" class="yakuza-intro-overlay">
        <img src="${yakuzaData.image}" class="yakuza-intro-image">
        ${YakuzaIntro.buildTextElements(yakuzaData.title, yakuzaData.subtitle1, yakuzaData.subtitle2)}
      </div>
    `);

    overlay.appendTo(document.body);
    await YakuzaIntro.animateElements();

    overlay.off("click").on("click", async () => {
      if (game.user.isGM) {
        overlay.remove();

        let closeBehavior = "ask";
        try {
          closeBehavior = game.settings.get(YakuzaIntro.ID, "closeBehavior");
        } catch (error) {
          console.warn("Yakuza-fy | Setting 'closeBehavior' not found, defaulting to 'ask'");
        }
        let forceClose = false;
        try {
          if (game.settings.settings.get(`${YakuzaIntro.ID}.forceCloseTableMap`)) {
            forceClose = game.settings.get(YakuzaIntro.ID, "forceCloseTableMap");
          }
        } catch (error) {
          console.warn("Yakuza-fy | Setting 'forceCloseTableMap' not found or not registered");
        }
        
        let tableMapUserId = null;
        if (game.modules.get("table-map")?.active) {
          try {
            tableMapUserId = game.settings.get("table-map", "userId");
          } catch (error) {
            console.warn("Yakuza-fy | Unable to access table-map.userId setting");
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
    return `
      <div class="yakuza-intro-text-wrapper">
        <div class="yakuza-intro-text yakuza-title">${title}</div>
        <div class="yakuza-intro-text yakuza-subtitle">${subtitle1}</div>
        <div class="yakuza-intro-text yakuza-subtitle">${subtitle2}</div>
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
        console.warn("Yakuza-fy | The 'table-map' module is active but 'userId' setting is not registered yet");
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
}
