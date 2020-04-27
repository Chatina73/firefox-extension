/**
 * An alias of `i18n.getMessage()`. Get a localized string by key.
 * @param {String} key String key that can be found in messages.json.
 * @param {String|String[]} [substitutions] Substitution string(s).
 * @returns {String} Localized string.
 * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getMessage
 */
const _ = (key, substitutions) => browser.i18n.getMessage(key, substitutions);

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
