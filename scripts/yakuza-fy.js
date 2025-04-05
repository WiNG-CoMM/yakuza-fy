class YakuzaIntro {
    static ID = "yakuza-fy";
    static socket;

    static async init() {
        if (game.modules.get(this.ID).api) return; // Prevent duplicate registration

        if (!socketlib) throw new Error(this.logging_id + "socketlib not installed");

        // Register socketlib only once
        this.socket = socketlib.registerModule(this.ID);
        this.socket.register("showIntro", YakuzaIntro.showIntro);
        this.socket.register("closeIntro", YakuzaIntro.closeIntro);

        // Initialize hooks
        this.setupJournalButtonHook();
		
        // Expose API
        game.modules.get(this.ID).api = { triggerIntro: YakuzaIntro.triggerIntro };
    }

    // Hook to add Yakuza-fy button to Journal sheet
    static setupJournalButtonHook() {
        Hooks.on("getJournalSheetHeaderButtons", (sheet, buttons) => {
            if (!game.user.isGM) return;
            buttons.unshift({
                label: "Yakuza-fy",
                class: "yakuza-intro-button",
                icon: "fas fa-bomb",
                onclick: () => YakuzaIntro.triggerIntro(sheet.object)
            });
        });
    }

    // Hook to add Yakuza-fy option to the context menu of Journal entries
    static setupContextMenuHook() {
		Hooks.on("getJournalDirectoryEntryContext", (JournalDirectory, options)=>{
			if (!game.user.isGM) return; // Ensure only the GM can access the context menu item

			options.push(
					{
					  "name": `Yakuza-fy`,
					  "icon": `<i class="fas fa-bomb"></i>`,
					  callback: li => {
						  const journalId = li.data("documentId");
						  const journal = game.journal.get(journalId);
						  if (journal) {
							YakuzaIntro.triggerIntro(journal);
						  } else {
							ui.notifications.error("Could not find journal entry.");
						  }
						}
					}
				  )
		});
	}

    static async triggerIntro(journal) {
        if (!game.user.isGM) return;
		
		const shouldGrantObserver = game.settings.get(this.ID, "giveObserverPermission");

		if (shouldGrantObserver) {
			// Update journal permissions to allow all players to observe
			let permissions = foundry.utils.duplicate(journal.ownership);
			const allPlayersPermission = permissions["default"];
			if (allPlayersPermission !== foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER) {
				permissions["default"] = foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER;
				await journal.update({ ownership: permissions });
			}
		}

        const journalData = {
            id: journal.id,
            pages: journal.pages.map(p => ({
                name: p.name,
                src: p.src
            }))
        };

        await this.socket.executeForEveryone("showIntro", journalData);
    }

    static async showIntro(journalData) {
        $("#yakuza-intro-overlay").remove();

        // Validate if the first image exists
        if (!journalData.pages?.[0]?.src) {
            ui.notifications.error("Error: First page needs an image.");
            return;
        }

        // Load images safely
        const images = await Promise.all(
            journalData.pages.map(p => YakuzaIntro.loadImage(p.src))
        );

        if (!images[0]) {
            ui.notifications.warn("Error: couldn't load first page image.");
            return;
        }

        // Build & animate intro
        const overlay = $(
            `<div id="yakuza-intro-overlay" class="yakuza-intro-overlay">
                <img src="${journalData.pages[0].src}" class="yakuza-intro-image">
                ${YakuzaIntro.buildTextElements(journalData.pages)}
            </div>`
        );

        overlay.appendTo(document.body);
        await YakuzaIntro.animateElements();
        
        overlay.off("click").on("click", async () => {
            if (game.user.isGM) {
                overlay.remove(); // Instantly remove overlay for GM
                const closeBehavior = game.settings.get(YakuzaIntro.ID, "closeBehavior");
				const forceCloseTableMap = game.settings.get(YakuzaIntro.ID, "forceCloseTableMap");
				if (!closeBehavior || closeBehavior === "ask") {
					new Dialog({
						title: "Close for all players?",
						content: "Do you want to close the intro for all players?",
						buttons: {
							yes: {
								label: "Yes",
								callback: () => YakuzaIntro.socket.executeForEveryone("closeIntro")
							},
							no: {
								label: "No"
							}
						}
					}).render(true);
				} else if (closeBehavior === "always") {
					await YakuzaIntro.socket.executeForEveryone("closeIntro");
				}
				// force close for the specified user if any
				if (forceCloseTableMap) {
				  const tableMapUserId = game.settings.get("table-map", "userId");
				  if (tableMapUserId) {
					const tableMapUser = game.users.get(tableMapUserId);
					if (tableMapUser.active) {
						YakuzaIntro.socket.executeAsUser("closeIntro", tableMapUserId);
					}
				  }
				}
            } else {
                YakuzaIntro.closeIntro();
            }
        });
    }

    static closeIntro() {
        const overlay = $("#yakuza-intro-overlay");
        overlay.stop(true).fadeOut(500, () => overlay.remove());
    }

    static buildTextElements(pages) {
        return `
            <div class="yakuza-intro-text-wrapper">
                ${pages.slice(0, 3).map((p, i) => `
                    <div class="yakuza-intro-text ${i === 0 ? 'yakuza-title' : 'yakuza-subtitle'}">
                        ${p.name}
                    </div>
                `).join("")}
            </div>
        `;
    }

    static async animateElements() {
		let skip = false;
		const overlay = $("#yakuza-intro-overlay");
		const image = overlay.find(".yakuza-intro-image");

		// If clicked during animation, show everything instantly
		overlay.one("click", () => {
			skip = true;
			$(".yakuza-title, .yakuza-subtitle").stop(true, true).show();
			image.addClass("yakuza-intro-filtered"); // Force filter immediately
		});

		// Begin with a delay, then fade to filtered version
		await new Promise(resolve => setTimeout(resolve, skip ? 0 : 300));
		image.addClass("yakuza-intro-filtered");

		$(".yakuza-title").addClass("show");

		await new Promise(resolve => setTimeout(resolve, skip ? 0 : 1000));
		$(".yakuza-subtitle").each((i, el) => {
			$(el).delay(skip ? 0 : 300 * i).addClass("show");
		});
	}


    static loadImage(src) {
        return new Promise((resolve) => {
            if (!src) return resolve(null);
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.warn("Error loading image:", src);
                resolve(null);
            };
            img.src = src;
        });
    }
	
	// Register hotkey in its own category
	static registerKeybindings() {
		game.keybindings.register(this.ID, "close-intro", {
			name: "Close Yakuza Overlay",
			hint: "Press this hotkey to close the Yakuza Overlay for all players.",
			editable: [{ key: "KeyY", modifiers: ["Alt"] }], // Default: Alt + Y
			restricted: true, // GM only
			onDown: () => {
				if (game.user.isGM) {
					YakuzaIntro.socket.executeForEveryone("closeIntro");
				}
			},
			category: "Yakuza-fy"
		});
	}
	
	// Add Yakuza-fy settings
	static registerSettings() {
		console.log("Registrando ajustes de Yakuza-fy...");

		// Auto-close behavior setting remains unchanged
		game.settings.register(YakuzaIntro.ID, "closeBehavior", {
			name: "yakuza-fy intro closing behaviour for the rest of the players",
			hint: "Sets what should happen when GM closes the intro.",
			scope: "world",
			config: true,
			default: "ask",
			type: String,
			choices: {
			  ask: "Ask every time",
			  always: "Always close for everyone",
			  never: "Never close for everyone"
			}
		});
	  
		// Give observer permission setting
		game.settings.register(this.ID, "giveObserverPermission", {
			name: "Grant Observer Permission",
			hint: "Automatically grant 'Observer' permission to all players when the intro is triggered.",
			scope: "world",
			config: true,
			type: Boolean,
			default: true
		});

	  
		const tableMapUser = game.settings.get("table-map", "userId");

		if (tableMapUser) {
			// Forced player setting:
			game.settings.register(YakuzaIntro.ID, "forceCloseTableMap", {
				name: "Force Auto-close for TableMap user if configured",
				hint: "If you are using Table Map module and you have configured your table Observer user, you can check this option to enforce closing the overlay for that player even if it doesn't for other players",
				scope: "world",
				config: true,
				type: Boolean,
				default: false,
				restricted: true
			});
		}
	}
}

// Hooks
Hooks.once("init", () => YakuzaIntro.setupContextMenuHook());
Hooks.once("ready", () => {
  YakuzaIntro.init();
  YakuzaIntro.registerSettings();
});
Hooks.once("setup", () => YakuzaIntro.registerKeybindings());
