# Yakuza-fy

> *“I never thought forever could be found in fists, blood, and honor... but it was.”*  
> — Kristi Lynn, *Forever* (If her boyfriend was a Yakuza game main character)

https://github.com/user-attachments/assets/7a9a9419-8d41-4901-aabb-1738b0ce75fe

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
https://raw.githubusercontent.com/WiNG-CoMM/yakuza-fy/refs/heads/main/module.json
```

Or clone/download the repository directly into your Data/modules folder.

## Usage
Prepare a Journal Entry:

The first page should contain an image.

The page name becomes the character's main title.

The second and third pages' names (if present) appear as subtitles.

https://github.com/user-attachments/assets/612049c8-9199-4823-bc96-88c5b29b56b1

## Trigger the intro:

Use the "Yakuza-fy" button in the Journal Entry header or context menu.

Players will see the overlay appear on their screen.

Clicking closes the overlay. The GM can optionally force-close for others.

https://github.com/user-attachments/assets/df0ae561-6aba-4c10-a842-3641f947ce6c

## Settings (found in Configure Settings → Module Settings → Yakuza-fy):

![Configurable options](https://github.com/user-attachments/assets/3e6c60bb-8dfc-4f5d-841a-1aff081bcc40)

### Intro Closing Behaviour: Ask / Always / Never.

Default closing behaviour is to simply click on the intro. However, as a GM, you might want to 
automatically close this window for other players too. There are three ways to handle this behaviour:

![Auto close](https://github.com/user-attachments/assets/027f96b5-75ef-4057-8476-c849ddaf01cb)

Ask everytime will prompt the GM for closing other players' intro when the GM closed it:

https://github.com/user-attachments/assets/edb4ad46-22d2-4280-8cec-c56fffedba69

Always close will always close it for other players when the GM does so:

https://github.com/user-attachments/assets/e17b79aa-d074-441c-b33d-d3786ac9547a

Never close will never close it for other players when the GM does so. The players will have to close it manually by clicking it:

https://github.com/user-attachments/assets/4fc4a3a8-3da9-4a5c-b35c-0d476551f138

### Grant Observer Permission: Give 'Observer' access to the journal entry.

This will set the permissions for the Journal entry used to Observer to every player automatically:

https://github.com/user-attachments/assets/65eddeb5-4bc9-4f97-90be-f2639325c693

### Force Auto-close for TableMap user (only visible if Table Map module is active and a user is configured).

Additionally, if you have the TableMap module configured, you make check this to override the default
auto-close behaviour defined above and always close it for the TableMap when the GM does. This is very useful
when you are using a secondary screen as a table map and you do not wish to move your cursor to theç
table monitor in order to close it:

https://github.com/user-attachments/assets/44ec745c-b6cf-4701-bb9b-b6532d863d01

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
