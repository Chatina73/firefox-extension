/**
 * Implement browser utility methods.
 */
class Browser {
  /**
   * Get the user's Firefox version in an integer.
   * @type {Number}
   */
  static get version() {
    const match = navigator.userAgent.match(/\bFirefox\/(\d+)/);

    return match ? Number(match[1]) : undefined;
  }
};

/**
 * Implement HTML utility methods.
 */
class HTML {
  /**
   * Escape several special characters in HTML.
   * @param {String} string Input string.
   * @returns {String} Escaped string.
   * @see https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
   */
  static escape(string) {
    return string.replace(/[&<>"'\/]/g, char => `&${{
      '&': 'amp',
      '<': 'lt',
      '>': 'gt',
      '"': 'quot',
      '\'': 'apos',
      '/': 'sol',
    }[char]};`);
  }

  /**
   * Remove any HTML tags from the input.
   * @param {String} string Input string.
   * @returns {String} Sanitized string.
   */
  static strip_tags(string) {
    const $div = document.createElement('div');

    $div.innerHTML = string;

    return $div.textContent;
  }
};
