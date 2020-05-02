/**
 * Implement features in the Compatibility sidebar tab in the Inspector panel.
 */
class CompatibilitySidebar {
  /**
   * Initialize the new CompatibilitySidebar instance.
   */
  constructor() {
    this.checker = new CompatibilityChecker();
    this.checker.test();

    browser.devtools.panels.elements.onSelectionChanged.addListener(async () => {
      const [result] = await browser.devtools.inspectedWindow.eval('$0');

      // `onSelectionChanged` is called during page navigation so make sure an element is actually selected
      if (result) {
        this.checker.test();
      }
    });
  }
};

window.addEventListener('DOMContentLoaded', () => {
  new CompatibilitySidebar();
}, { once: true });
