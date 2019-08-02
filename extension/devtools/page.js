(async () => {
  const title = browser.i18n.getMessage('panel_title');
  const icon = `/devtools/icon-check-${browser.devtools.panels.themeName}.svg`;
  const page = '/devtools/panel.html';
  const panel = await browser.devtools.panels.create(title, icon, page);
})();
