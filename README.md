# Yakuza-fy

> *“I never thought forever could be found in fists, blood, and honor... but it was.”*  
> — Kristi Lynn, *Forever*

A humble tribute to the **Yakuza / Ryu Ga Gotoku** series, where storytelling, loyalty, and style collide in unforgettable ways.

**Yakuza-fy** is a Foundry VTT module that brings that same dramatic flair to your tabletop sessions. Give your characters the entrance they deserve—with full-screen noir visuals, bold declarations, and a cinematic touch.

If you love the **Yakuza / Ryu Ga Gotoku** as much as I do, buy and play their games!

## Features

- Adds a **"Yakuza-fy"** button to Journal Entries for GMs.
- Overlays the first page image fullscreen with a noir filter.
- Displays the page names as **title and subtitles** in dramatic style.
- Responsive design with smooth fade-in text using the **EDO SZ** font.
- Integrates with **Table Map** to force overlay closing on the observer.
- Optional hotkey (`Alt+Y` by default) to force-close the overlay.
- Settings to control auto-close behavior and permissions.

## Installation

Install via the Foundry VTT module manager by providing the manifest URL:

```plaintext
https://github.com/WiNG-CoMM/yakuza-fy/module.json
```

Or clone/download the repository directly into your Data/modules folder.

## Usage
Prepare a Journal Entry:

The first page should contain an image.

The page name becomes the character's main title.

The second and third pages' names (if present) appear as subtitles.

## Trigger the intro:

Use the "Yakuza-fy" button in the Journal Entry header or context menu.

Players will see the overlay appear on their screen.

Clicking closes the overlay. The GM can optionally force-close for others.

## Settings (found in Configure Settings → Module Settings → Yakuza-fy):

Intro Closing Behaviour: Ask / Always / Never.

Grant Observer Permission: Give 'Observer' access to the journal entry.

Force Auto-close for TableMap user (only visible if Table Map module is active and a user is configured).

## Hotkey Support:

GMs can use Alt+Y (default) to force close the overlay for all players.
Hotkey can be configured in your Foundry VTT control setings.

##️ Dependencies
Socketlib – Required for communication between clients.

Optional: Table Map – For auto-forced closing on a designated observer player.

## Localization
Not implemented yet, but planned for future releases.

## License
This project is licensed under the GNU General Public License v3.0. See the LICENSE file for more details.