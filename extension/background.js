let panel_is_open = false;
let sidebar_is_open = false;

browser.runtime.onMessage.addListener(({ status }, sender) => {
  if (sender.id !== browser.runtime.id) {
    return;
  }

  if (status === 'panel:opened') {
    panel_is_open = true;
  }

  if (status === 'panel:closed') {
    panel_is_open = false;
  }

  if (status === 'sidebar:opened') {
    sidebar_is_open = true;
  }

  if (status === 'sidebar:closed') {
    sidebar_is_open = false;
  }
});

// Send a message when the tab is loaded
browser.tabs.onUpdated.addListener((tabId, { status }) => {
  if (panel_is_open || sidebar_is_open) {
    browser.runtime.sendMessage({ status: `tab:${status}` });
  }
});
