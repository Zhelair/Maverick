// Maverick - Background Service Worker
// Handles extension lifecycle events

chrome.runtime.onInstalled.addListener(() => {
  console.log('Maverick installed');
});

// Context menu: right-click a link → download audio
chrome.contextMenus?.create({
  id: 'maverick-download',
  title: 'Download audio with Maverick',
  contexts: ['link'],
});

chrome.contextMenus?.onClicked.addListener((info) => {
  if (info.menuItemId === 'maverick-download' && info.linkUrl) {
    chrome.storage.local.set({ maverick_pending_url: info.linkUrl });
    chrome.action.openPopup?.();
  }
});
