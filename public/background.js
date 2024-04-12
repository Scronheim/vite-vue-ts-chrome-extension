console.log("Background - service worker (updated)");chrome.runtime.onInstalled.addListener(()=>{});chrome.runtime.onMessage.addListener((r,d,e)=>{r==="getDOM"&&e({}),e({})});
