/* eslint-disable indent */

/**
 * Implement the compatibility checker.
 */
class CompatibilityChecker {
  /**
   * Retrieve compatibility data.
   * @returns {Promise.<Array>} Data.
   */
  static async get_data() {
    if (!this.data) {
      this.data = await (await fetch('/data/compatibility.json')).json();
    }

    return this.data;
  }

  /**
   * Evaluate the selected element or all the elements on the page.
   * @param {String} expression Complex expression to check if an element has an issue.
   * @param {String} [selector] Simple CSS selector to check if an element has an issue.
   * @param {Boolean} [all] Whether to run against all the element on the current page.
   * @returns {Promise.<Array>} Array containing result and error.
   * @see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/devtools.inspectedWindow/eval
   */
  static async evaluate(expression, selector = null, all = false) {
    if (selector) {
      expression = `$0.matches('${selector}')`;
    }

    if (all && expression.includes('$0')) {
      expression = `[...document.querySelectorAll('*')].map($0 => ${expression}).includes(true)`;
    }

    if (!all && !expression.includes('$0')) {
      return [false, undefined];
    }

    return browser.devtools.inspectedWindow.eval(expression);
  }

  /**
   * Run a test and show the results.
   * @param {Boolean} [all] Whether to run against all the element on the current page.
   */
  static async test({ all = false } = {}) {
    const issues = [];
    const data = await this.get_data();

    for (const { title, description, category, expression, selector, deprecated, removed, document } of data) {
      if (selector || expression) {
        const [result] = await this.evaluate(expression, selector, all);

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

    document.querySelector('#checker-results-wrapper').innerHTML = `
      ${issues.length ? `
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
      ` : `
        <ul class="results"><li><em>${_('checker_no_issues')}</em></li></ul>
      `}
    `;
  }
};
