console.log('Background - service worker (updated)');

chrome.runtime.onInstalled.addListener(() => {
  // default state goes here
  // this runs ONE TIME ONLY (unless the user reinstalls your extension)
});

chrome.tabs.onActivated.addListener(async (tab) => {
  console.log(tab.tabId);
  await chrome.tabs.query()
})
