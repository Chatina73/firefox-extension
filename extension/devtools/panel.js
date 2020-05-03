/* eslint-disable indent */

import { _, HTML, Browser } from '../util.js';
import { Tab, TabList, TabPanel } from '../widgets.js';
import { CompatibilityChecker } from './checker.js';

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
   * Load and render news feeds for the recent 3 releases of Firefox.
   */
  async init() {
    try {
      const blog_feed = await this.fetch_feed('blog');
      const versions = [...(await this.fetch_feed('releases')).items.map(item => Number(item._release.version))]
        .filter(version => !isNaN(version)).sort((a, b) => a < b).slice(0, 3);
      const release_feeds = await Promise.all(versions.map(version => this.fetch_feed(`releases/${version}`)));

      this.$panel.innerHTML = `
        <div class="row">
          <div id="blog">
            ${blog_feed.items.slice(0, 1).map(({ title, url, date_published, content_html }) => `
              <section>
                <header>
                  <h3>${HTML.sanitize(title)}</h3>
                  <h4>
                    <a href="${HTML.escape(url)}">
                      ${HTML.escape(this.get_date(date_published))}
                    </a>
                  </h4>
                </header>
                ${HTML.sanitize(content_html)}
              </section>
            `).join('')}
          </div>
          <div id="releases">
            ${release_feeds.map(({ items, _release: { version, channel } }) => `
              <section>
                <header>
                  <hgroup role="heading" aria-level="3">
                    <h3 role="none">Firefox ${version}</h3>
                    ${channel ? `
                      <h4 role="none">${HTML.escape(channel)}</h4>
                    ` : ''}
                    ${Number(version) === Browser.version ? `
                      <h5 role="none">${_('your_version')}</h5>
                    ` : ''}
                  </hgroup>
                </header>
                <ul>${items.map(({ url, _title_html, _status, _categories }) => `
                  <li>
                    <a href="${HTML.escape(url)}">${HTML.sanitize(_title_html)}</a>
                    ${_status ? `
                      <em class="status">${_status.name}</em>
                    ` : ''}
                    ${_categories.map(({ link, name }) => `
                      <a href="${HTML.escape(link)}" class="category">${HTML.escape(name)}</a>
                    `).join('')}
                  </li>
                `).join('')}
                </ul>
              </section>
            `).join('')}
          </div>
        </div>
      `;
    } catch (ex) {
      this.$panel.querySelector('p').innerHTML = _('feed_fetch_error');
    }
  }

  /**
   * Fetch a JSON feed from remote.
   * @param {String} path URL path to the feed.
   * @returns {Promise.<Object>} Parsed JSON document.
   */
  async fetch_feed(path) {
    const response = await fetch(`${this.endpoint}${path}/index.json`);
    const data = await response.json();

    return data;
  }

  /**
   * Get human-readable date label. Reformat Japanese date with spaces.
   * @param {String} str ISO format date.
   * @returns {String} Formatted date.
   */
  get_date(str) {
    return (new Date(str))
      .toLocaleDateString(_('locale'), { year: 'numeric', month: 'long', day: 'numeric' })
      .replace(/(\d+)年(\d+)月(\d+)日/g, '$1 年 $2 月 $3 日');
  }
};

/**
 * Implement features in the Checker tab panel.
 */
class CheckerPanel {
  /**
   * Initialize the new CheckerPanel instance.
   */
  constructor() {
    this.$tab = document.querySelector('#checker-tab');
    this.$panel = document.querySelector('#checker-panel');

    // Run a test when the Checker tab is selected
    this.$tab.addEventListener('selected', () => {
      if (!this.checker) {
        this.checker = new CompatibilityChecker({ check_page: true });
        this.checker.test();
      }
    });

    // Run a test when the Check Again button is clicked
    document.querySelector('#checker-rerun').addEventListener('click', event => {
      event.preventDefault();
      this.checker.test();
    });
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
  // Activate the panels
  new NewsPanel();
  new CheckerPanel();
  new ReporterPanel();
}, { once: true });
