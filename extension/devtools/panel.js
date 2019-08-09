/**
 * Implement features in the News tab panel.
 */
class NewsPanel {
  /**
   * Initialize the new NewsPanel instance.
   */
  constructor() {
    this.endpoint = browser.i18n.getMessage('feed_endpoint');
    this.$panel = document.querySelector('#news-panel');

    this.init();
  }

  /**
   * Load and render news feeds for the recent 3 versions of Firefox.
   */
  async init() {
    try {
      const $feed = await this.fetch_feed('versions/index.xml');
      const versions = [...$feed.querySelectorAll('entry > title')]
        .map($title => Number($title.textContent)).sort((a, b) => a < b).slice(0, 3);
      const feeds = await Promise.all(versions.map(version => this.fetch_feed(`versions/${version}/index.xml`)));
      const _ = key => browser.i18n.getMessage(key);

      this.$panel.innerHTML = `${feeds.map($feed => {
        const version = Number($feed.querySelector('feed > title').textContent.match(/\d+/)[0]);
        const channel = $feed.querySelector('feed > subtitle').textContent;

        return `
          <section>
            <hgroup>
              <h3>Firefox ${version}</h3>
              ${channel ? `<h4>${HTML.escape(channel)}</h4>` : ''}
              ${version === Browser.version ? `<h5>${_('your_version')}</h5>` : ''}
            </hgroup>
            <ul>${[...$feed.querySelectorAll('entry')].map($entry => `
              <li>
                <a href="${HTML.escape($entry.querySelector('link').getAttribute('href'))}?src=firefox-extension"
                  target="fxsitecompat">${HTML.escape($entry.querySelector('title').textContent)}</a>
                ${[...$entry.querySelectorAll('category')].map($cat => `
                  <span>${HTML.escape($cat.getAttribute('term'))}</span>
                `).join('')}
              </li>
            `).join('')}
            </ul>
          </section>
        `;
      }).join('')}`;
    } catch (ex) {
      this.$panel.querySelector('p').innerHTML = _('feed_fetch_error');
    }
  }

  /**
   * Fetch an Atom feed from remote.
   * @param {String} path URL path to the feed.
   * @returns {Promise.<XMLDocument>} Parsed XML document.
   */
  async fetch_feed(path) {
    const parser = new DOMParser();
    const response = await fetch(`${this.endpoint}${path}`);
    const string = await response.text();

    return parser.parseFromString(string, 'application/xml');
  }
};

/**
 * Implement features in the Reporter tab panel.
 */
class ReporterPanel {
  /**
   * Initialize the new ReporterPanel instance.
   */
  constructor() {
    this.$panel = document.querySelector('#reporter-panel');
  }
};

window.addEventListener('DOMContentLoaded', () => {
  const set_theme = theme => document.documentElement.dataset.theme = theme;

  // Check for the DevTools theme: dark or light
  set_theme(browser.devtools.panels.themeName);
  browser.devtools.panels.onThemeChanged.addListener(set_theme);

  // Use the user's platform info for better styling
  document.documentElement.dataset.platform = navigator.platform;

  // Localize strings
  document.querySelectorAll('[data-str]').forEach($element => {
    $element.innerHTML = browser.i18n.getMessage($element.dataset.str);
  });

  // Activate the panels
  new NewsPanel();
  new ReporterPanel();
}, { once: true });

// Disable context menu
window.addEventListener('contextmenu', event => event.preventDefault());
