// Send a message when the tab is loaded
browser.tabs.onUpdated.addListener((tabId, { status }) => {
  if (status === 'complete') {
    browser.tabs.sendMessage(tabId, { status: 'tab_loaded' });
  }
});
