/* eslint-disable indent */

/**
 * Get a localized string by key.
 * @param {String} key String key that can be found in messages.json.
 * @returns {String} Localized string.
 */
const _ = key => browser.i18n.getMessage(key);

/**
 * Implement features in the News tab panel.
 */
class NewsPanel {
  /**
   * Initialize the new NewsPanel instance.
   */
  constructor() {
    this.endpoint = _('feed_endpoint');
    this.$panel = document.querySelector('#news-panel');

    if (navigator.onLine) {
      this.init();
    } else {
      this.$panel.querySelector('p').innerHTML = _('feed_fetch_offline');
      window.addEventListener('online', () => this.init(), { once: true });
    }
  }

  /**
   * Load and render news feeds for the recent 3 versions of Firefox.
   */
  async init() {
    const get_date = str => (new Date(str))
      .toLocaleDateString(_('locale'), { year: 'numeric', month: 'long', day: 'numeric' })
      .replace(/(\d+)年(\d+)月(\d+)日/g, '$1 年 $2 月 $3 日'); // Reformat Japanese date

    try {
      const $blog_feed = await this.fetch_feed('blog/index.xml');
      const versions = [...(await this.fetch_feed('versions/index.xml')).querySelectorAll('entry > title')]
        .map($title => Number($title.textContent)).filter(version => !isNaN(version)).sort((a, b) => a < b).slice(0, 3);
      const version_feeds =
        await Promise.all(versions.map(version => this.fetch_feed(`versions/${version}/index.xml`)));

      this.$panel.innerHTML = `
        <div class="row">
          <div id="blog">
            ${[...$blog_feed.querySelectorAll('entry')].slice(0, 1).map($entry => `
              <section>
                <header>
                  <h3>${HTML.escape($entry.querySelector('title').textContent)}</h3>
                  <h4>${HTML.escape(get_date($entry.querySelector('updated').textContent))}</h4>
                </header>
                <p>${HTML.escape(HTML.strip_tags($entry.querySelector('content').textContent))}</p>
              </section>
            `).join('')}
          </div>
          <div id="releases">
            ${version_feeds.map($feed => {
              const version = Number($feed.querySelector('feed > title').textContent.match(/\d+/)[0]);
              const channel = $feed.querySelector('feed > subtitle').textContent;

              return `
                <section>
                  <header>
                    <hgroup role="heading" aria-level="3">
                      <h3 role="none">Firefox ${version}</h3>
                      ${channel ? `<h4 role="none">${HTML.escape(channel)}</h4>` : ''}
                      ${version === Browser.version ? `<h5 role="none">${_('your_version')}</h5>` : ''}
                    </hgroup>
                  </header>
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
            }).join('')}
          </div>
        </div>
      `;
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
    $element.innerHTML = _($element.dataset.str);
  });

  // Activate the panels
  new NewsPanel();
  new ReporterPanel();
}, { once: true });

// Disable context menu
window.addEventListener('contextmenu', event => event.preventDefault());
