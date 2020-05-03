import { _ } from '../util.js';

window.addEventListener('DOMContentLoaded', () => {
  const set_theme = theme => document.documentElement.dataset.theme = theme;

  // Check for the DevTools theme: dark or light
  set_theme(browser.devtools.panels.themeName);
  browser.devtools.panels.onThemeChanged.addListener(set_theme);

  // Localize strings
  document.querySelectorAll('[data-str]').forEach($element => {
    $element.innerHTML = _($element.dataset.str);
  });
}, { once: true });

window.addEventListener('contextmenu', event => {
  // Disable context menu
  event.preventDefault();
});
