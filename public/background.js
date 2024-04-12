console.log("Background - service worker (updated)"); chrome.runtime.onInstalled.addListener(() => { });
chrome.tabs.onActivated.addListener(async e => {
  const tab = await chrome.tabs.get(e.tabId)
  console.log(tab)
});
