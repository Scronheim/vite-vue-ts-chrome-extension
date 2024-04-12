console.log('Background - service worker (updated)');

chrome.runtime.onInstalled.addListener(() => {
  // default state goes here
  // this runs ONE TIME ONLY (unless the user reinstalls your extension)
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === 'getDOM') {
    sendResponse({})
  }
  sendResponse({})
})
