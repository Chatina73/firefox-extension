browser.devtools.panels.elements.onSelectionChanged.addListener(() => {
  CompatibilityChecker.test();
});

window.addEventListener('DOMContentLoaded', () => {
  CompatibilityChecker.test();
}, { once: true });
