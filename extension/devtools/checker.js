/* eslint-disable indent */

import { _, HTML } from '../util.js';

/**
 * Implement the compatibility checker.
 */
export class CompatibilityChecker {
  /**
   * Initialize a new CompatibilityChecker instance.
   * @param {Boolean} [check_page] Whether to run against all the element on the current page.
   */
  constructor({ check_page = false } = {}) {
    this.check_page = check_page;
    this.tab_loading = false;

    this.$results_wrapper = document.querySelector('#checker-results-wrapper');

    // Run a test when the current browser tab is updated
    browser.runtime.onMessage.addListener(({ status }, sender) => {
      if (sender.id !== browser.runtime.id) {
        return;
      }

      if (status === 'tab:loading') {
        this.tab_loading = true;
        this.show_message(_('checker_loading'));
      }

      if (status === 'tab:complete') {
        this.tab_loading = false;
        this.test();
      }
    });
  }

  /**
   * Retrieve compatibility data.
   * @returns {Promise.<Array>} Data.
   */
  async get_data() {
    const response = await fetch('/data/compatibility.json');
    const data = await response.json();

    return data;
  }

  /**
   * Evaluate the selected element or all the elements on the page.
   * @param {String} expression Complex expression to check if an element has an issue.
   * @param {String} [selector] Simple CSS selector to check if an element has an issue.
   * @returns {Promise.<Array>} Array containing result and error.
   * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/devtools.inspectedWindow/eval
   */
  async evaluate({ expression, selector = null }) {
    if (selector) {
      expression = `$0.matches('${selector}')`;
    }

    if (this.check_page && expression.includes('$0')) {
      expression = `[...document.querySelectorAll('*')].map($0 => ${expression}).includes(true)`;
    }

    if (!this.check_page && !expression.includes('$0')) {
      return [false, undefined];
    }

    return browser.devtools.inspectedWindow.eval(expression);
  }

  /**
   * Run a test and show the results.
   */
  async test() {
    if (this.tab_loading) {
      return;
    }

    if (this.check_page) {
      this.show_message(_('checker_testing'));
    }

    const issues = [];

    this.data = this.data || await this.get_data();

    for (const { title, description, category, expression, selector, deprecated, removed, document } of this.data) {
      if (selector || expression) {
        const [result] = await this.evaluate({ expression, selector });

        if (result !== true) {
          continue;
        }

        issues.push({
          category,
          summary: `
            <strong>${HTML.escape(title)}</strong>:
            ${HTML.escape(removed ? `
              ${deprecated && deprecated.release ? `
                ${(_('deprecated_known_removed_known', [deprecated.release, removed.release]))}
              ` : `
                ${_('deprecated_unknown_removed_known', [removed.release])}
              `}
            ` : deprecated ? `
              ${deprecated.release ? `
                ${_('deprecated_known_removed_future', [deprecated.release])}
              ` : `
                ${_('deprecated_unknown_removed_future')}
              `}
            ` : '')}
            ${HTML.escape(description)}
            (<a href="${HTML.escape(document)}">${_('checker_details_link')}</a>)
          `
        });
      }
    }

    const categories = [...(new Set(issues.map(issue => issue.category)))];

    if (!issues.length) {
      this.show_message(_('checker_no_issues'));
    } else {
      this.$results_wrapper.innerHTML = `
        ${categories.map(category => `
          <section data-category="${category}">
            <h2>${_(`category_${category}`)}</h2>
            <ul class="results">
              ${issues.filter(issue => issue.category === category).map(issue => `
                <li>${issue.summary}</li>
              `).join('')}
            </ul>
          </section>
        `).join('')}
      `;
    }
  }

  /**
   * Display a short message in the results area, like “No issue found”.
   * @param {String} status Status message.
   */
  show_message(status) {
    this.$results_wrapper.innerHTML = `
      <ul class="results"><li><em>${status}</em></li></ul>
    `;
  }
};
