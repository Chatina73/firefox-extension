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

  /**
   * Sanitize a HTML string by simply disallowed tags and attributes. Note: this only supports part of tags and
   * attributes allowed in Markdown. Simple yet powerful.
   * @param {String} string Input string.
   * @returns {String} Sanitized HTML string.
   */
  static sanitize(string) {
    const allowed_tags = 'h1,h2,h3,h4,h5,h6,p,ul,ol,li,blockquote,pre,strong,em,code,a,img,br'.split(',');
    const allowed_attrs = 'href,src'.split(',');
    const $div = document.createElement('div');

    $div.innerHTML = string;

    for (const $element of [...$div.querySelectorAll('*')]) {
      if (!allowed_tags.includes($element.tagName.toLowerCase())) {
        $element.remove();
      }

      for (const { name } of [...$element.attributes]) {
        if (!allowed_attrs.includes(name)) {
          $element.attributes.removeNamedItem(name);
        }
      }
    }

    return $div.innerHTML;
  }
};
