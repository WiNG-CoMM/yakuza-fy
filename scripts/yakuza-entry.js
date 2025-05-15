import { YakuzaIntro } from './yakuza-fy.js';
Hooks.once("init", () => YakuzaIntro.setupContextMenuHook());
Hooks.once("ready", () => {
  YakuzaIntro.init();
});
Hooks.once("setup", () => YakuzaIntro.registerKeybindings());