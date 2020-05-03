/**
 * Implement a tab widget.
 */
export class Tab extends HTMLElement {
  /**
   * Called once the element is added to the document.
   */
  connectedCallback() {
    this.tabIndex = -1;
    this.setAttribute('role', 'tab');
    this.setAttribute('aria-selected', 'false');
  }

  /**
   * Check if the tab is selected.
   * @type {Boolean}
   */
  get selected() {
    return this.matches('[aria-selected="true"]');
  }

  /**
   * Select the tab.
   * @param {Boolean} selected Whether the tab should be selected.
   */
  set selected(selected) {
    this.tabIndex = selected ? 0 : -1;
    this.setAttribute('aria-selected', selected);
    this.tabpanel.setAttribute('aria-hidden', !selected);

    if (selected) {
      this.dispatchEvent(new CustomEvent('selected'));
    }
  }

  /**
   * Get the corresponding tabpanel.
   * @type {Tabpanel}
   */
  get tabpanel() {
    return document.getElementById(this.getAttribute('aria-controls'));
  }
};

/**
 * Implement a tablist widget.
 */
export class TabList extends HTMLElement {
  /**
   * Called once the element is added to the document.
   */
  connectedCallback() {
    this.setAttribute('role', 'tablist');

    this.addEventListener('click', event => this._onclick(event));
    this.addEventListener('keydown', event => this._onkeydown(event));

    window.addEventListener('DOMContentLoaded', () => {
      this._select_tab(this.tabs.find($tab => $tab.selected) || this.tabs[0]);
    }, { once: true });
  }

  /**
   * Get a list of tabs.
   * @private
   * @type {Array.<Tab>}
   */
  get tabs() {
    return [...this.querySelectorAll('aria-tab')];
  }

  /**
   * Called whenever somewhere on the tablist is clicked.
   * @private
   * @param {MouseEvent} event `click` event.
   */
  _onclick(event) {
    const $target = event.target;

    if ($target.matches('aria-tab') && !$target.selected) {
      this._select_tab($target);
    }
  }

  /**
   * Called whenever a keyboard key is pressed.
   * @private
   * @param {MouseEvent} event `keydown` event.
   */
  _onkeydown(event) {
    const { key, ctrlKey, metaKey, altKey, shiftKey } = event;

    if (ctrlKey || metaKey || altKey || shiftKey) {
      return;
    }

    const { tabs } = this;
    const index = tabs.findIndex($tab => $tab.selected);

    const $target = {
      Home: tabs[0],
      End: tabs[tabs.length - 1],
      ArrowLeft: tabs[index - 1],
      ArrowRight: tabs[index + 1],
    }[key];

    if ($target) {
      this._select_tab($target);
    }
  }

  /**
   * Select a specified tab.
   * @private
   * @param {HTMLElement} $target Element with the `tab` role.
   */
  _select_tab($target) {
    const $current = this.tabs.find($tab => $tab.selected);

    if ($current) {
      $current.selected = false;
    }

    $target.selected = true;
    $target.focus();
  }
};

/**
 * Implement a tabpanel widget.
 */
export class TabPanel extends HTMLElement {
  /**
   * Called once the element is added to the document.
   */
  connectedCallback() {
    this.tabIndex = -1;
    this.setAttribute('role', 'tabpanel');
    this.setAttribute('aria-hidden', 'true');
  }
};

window.customElements.define('aria-tab', Tab);
window.customElements.define('aria-tablist', TabList);
window.customElements.define('aria-tabpanel', TabPanel);
