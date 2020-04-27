// Create the Compatibility panel
(async () => {
  const title = browser.i18n.getMessage('panel_title');
  const icon = `/devtools/icon-check-${browser.devtools.panels.themeName}.svg`;
  const page = '/devtools/panel.html';
  const panel = await browser.devtools.panels.create(title, icon, page);
})();

// Create the Compatibility sidebar pane within the Inspector panel
(async () => {
  const title = browser.i18n.getMessage('sidebar_pane_title');
  const page = '/devtools/sidebar.html';
  const sidebar_pane = await browser.devtools.panels.elements.createSidebarPane(title);

  sidebar_pane.setPage(page);
})();
