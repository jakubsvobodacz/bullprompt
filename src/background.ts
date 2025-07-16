// Simple background service worker - Chrome storage operations are handled in popup
chrome.runtime.onInstalled.addListener(() => {
  console.log("BullPrompt extension installed");
});

// Keep alive for extension
chrome.runtime.onStartup.addListener(() => {
  console.log("BullPrompt extension started");
});
