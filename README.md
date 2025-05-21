# Yakuza-fy

[![Latest Release](https://img.shields.io/github/v/release/WiNG-CoMM/yakuza-fy?style=for-the-badge&label=Latest%20Release)](https://github.com/WiNG-CoMM/yakuza-fy/releases)
[![GitHub all releases](https://img.shields.io/github/downloads/WiNG-CoMM/yakuza-fy/total?style=for-the-badge&label=Total%20Downloads)](https://github.com/WiNG-CoMM/yakuza-fy/releases)
[![GitHub release (latest by date)](https://img.shields.io/github/downloads/WiNG-CoMM/yakuza-fy/latest/total?style=for-the-badge&label=Latest%20Release%20Downloads)](https://github.com/WiNG-CoMM/yakuza-fy/releases/latest)
[![Foundry Version](https://img.shields.io/endpoint?url=https%3A%2F%2Ffoundryshields.com%2Fversion%3Fstyle%3Dfor-the-badge%26name%3Dyakuza-fy%26compatibility%3D12%2C13%26url%3Dhttps%3A%2F%2Fraw.githubusercontent.com%2FWiNG-CoMM%2Fyakuza-fy%2Fmain%2Fmodule.json)](https://foundryvtt.com/packages/yakuza-fy/)
[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fyakuza-fy&colorB=4aa94a&style=for-the-badge)](https://forge-vtt.com/bazaar#package=yakuza-fy)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=for-the-badge)](https://www.gnu.org/licenses/gpl-3.0)
[![ko-fi](https://img.shields.io/badge/Support%20Me-Ko--fi-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/wingc)

> *“I never thought forever could be found in fists, blood, and honor... but it was.”*  
> — Kristi Lynn, *Forever* (If her boyfriend was a Yakuza game main character)

https://github.com/user-attachments/assets/7a9a9419-8d41-4901-aabb-1738b0ce75fe

A humble tribute to the **Yakuza / Ryu Ga Gotoku** series, where storytelling, loyalty, and style collide in unforgettable ways.

**Yakuza-fy** is a Foundry VTT module that brings that same dramatic flair to your tabletop sessions. Give your characters the entrance they deserve—with full-screen noir visuals, bold declarations, and a cinematic touch.

If you love the **Yakuza / Ryu Ga Gotoku** as much as I do, buy and play their games!

## Important: Foundry V13 support

We now support Foundry V13 with Yakuza-fy. However, the TableMap complement at the moment is not working in V13 as TableMap isn't updated for V13 yet. Support for V13 however implicits a small change in the header button to use Yakuza-fy in V13. As the Journal default sheet in V13 is different from V12, you will need to use the three dots button first to show the Yakuza-fy option. Some systems in V13 do not use the Journal default sheet as their default sheet, such as DnD5e, so those are unaffected by these changes.

![v13 header button](https://github.com/user-attachments/assets/52ee7aca-6113-4fdb-9f80-ab45385ec69d)

## Features

- Adds a **"Yakuza-fy"** button to Journal Entries for GMs.
- Overlays the first page image fullscreen with a noir filter.
- Displays the page names as **title and subtitles** in dramatic style.
- Responsive design with smooth fade-in text using the **EDO SZ** font.
- Integrates with **Table Map** to force overlay closing on the observer.
- Optional hotkey (`Alt+Y` by default) to force-close the overlay.
- Settings to control auto-close behavior and permissions.
- New in 1.1.0: Support for Foundry V13.
- New in 1.1.0: Exposed API to use Yakuza-fy in other modules.
- New in 1.2.0: Localization. Spanish is now available too!
- New in 1.2.0: Image Adaptation and Scaling options

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

![Configurable options v1.2.0](https://github.com/user-attachments/assets/d442c678-02a9-4ae5-84c1-b59ea6c9470e)

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

### Image Adaptation Mode

Yakuzaf-y attempts to make sure the image is displayed in the most cinamatically impacting way, which
might include some resizing options. Keep in mind that all image adaptation modes might show empty spaces
around your images as, unless you prepare them specifically, they will rarely have the exact dimensions
as your screens. Furthermore, different players might have different screen sizes and orientations which
would make exact manual prepartions impossible altogether. These options are aimed to overcome such limitations
while trying to fill as much screen as possible for extra cinametic flair and honor.

Please, be also aware that whenever you change the size of an image over it's original it will have it's
overall quality affected. Small images will never look good if you resize them up aggressively. This 
module will simply resize them in the same way your browser would do, it does not repaint them based on 
original input, neither uses AI for rescaling.

![Image Adaptation Modes](https://github.com/user-attachments/assets/7f9819e8-f283-4f91-bf33-69f9f0aff9cb)

#### Automatic (based on image and screen orientation)

This mode makes automatic calculations to display the image as big as possible in the screen. It takes the
original image size into consideration and the screen size/orientation to show it, including some slight oversizing
while attempting to not cut the image excessively. Some slight cropping might be applied on the edges to provide
a better fitting. Take into consideration however that images with transparent backgrounds might seem to be
smaller than needed if the non-transparent part has margins around it in the image.

#### Fit to width

The image will be shown in a way that gives priority to width while adjusting height automatically.

#### Fit to height

The image will be shown in a way that gives priority to hight while adjusting width automatically.

#### Contain (show entire image, may have empty space)

Will ensure the whole image is shown, as big as possible, without ever cropping or oversizing out of the screen.

### Image Scale Factor

If your images still show too small, or too large, you may override the final size calculation and add/remove an extra
25% more/less space. A Scale Factor of 100 indicates the image will remain at 100% of the final calculated size by the
Image Adaptation Mode you selected. Give it a try at 105-110% and see how your images pack a bigger punch filling 
the screen!

## Hotkey Support:

GMs can use Alt+Y (default) to force close the overlay for all players.
Hotkey can be configured in your Foundry VTT control settings.

## Dependencies:
Socketlib – Required for communication between clients.

Optional: Table Map – For auto-forced closing on a designated observer player.

## API:

You can use the API to trigger the intro from other modules.
You will need to provide a YakuzaData structure to the API in order to do so. We provide helper functions to create a YakuzaData structure from a journal entry, journal entry ID or from scratch.

### Journal Entry:

This is the one we use internally when clicking on the buttons:

```javascript
YakuzaData.createYakuzaDataFromDefaultJournal(journal);
```

### Journal Entry ID:

This one is simply a shortcut for the Journal Entry version, so you can use it if you already have the journal ID but do not wish to pass the whole Journal entry object:

```javascript
YakuzaData.createYakuzaDataFromDefaultJournalId(journalId);
```

### From Scratch:

You may define all the data on your own by using the following function:

```javascript
YakuzaData.createYakuzaData(journalId, image, title, subtitle1, subtitle2);
```

The only really mandatory data is the image and the title. journalid, subtitle1 and subtitle2 are optional.

#### Do I need a Journal Entry or a journalId?

Not really. The Journal Entry is used as a way for the user to entry the data for this to work. Since we are using the Journal Entry to get the data, you can use either a Journal Entry or a journalId to trigger the intro. The Journal Entry version is simply a shortcut for the journalId version, so you can use it if you already have the journal ID but do not wish to pass the whole Journal entry object.

But you may opt to use the from scratch version if you do not wish to use a Journal Entry. There is no need to pass a JournalId to this version, as it is optional. The JournalId is only used to assign an observer permission to the journal entry (depending on the configuration options), so you can use it if you wish to do so.

## Localization:
Yes! We are now supporting localization and, as of this version, offering both English and Spanish. Other languages are welcome
if you want to contribute them!

## License:
This project is licensed under the GNU General Public License v3.0. See the LICENSE file for more details.

---

## Ko-fi link if you feel like it

If you enjoy using Yakuza-fy and feel that you would like to throw some extra support then consider buying me a coffee! This module is free and will always be free. No support will ever be needed. I do have a job and can afford to pay my bills fortunately. But, in any case, you can do it here if you wish:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/wingc)
