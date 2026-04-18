// Background Service Worker

// Handle extension icon click - open side panel
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Handle keyboard shortcut (Ctrl+Shift+S)
chrome.commands.onCommand.addListener((command) => {
  if (command === 'save-selection') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        // Send message to content script to get selected text
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelection' }, (response) => {
          if (response && response.text) {
            // Open side panel
            chrome.sidePanel.open({ windowId: tabs[0].windowId });
            
            // Wait a bit for sidebar to load, then send the text
            setTimeout(() => {
              chrome.runtime.sendMessage({
                action: 'quickSave',
                text: response.text
              });
            }, 500);
          }
        });
      }
    });
  }
});

// Listen for messages from sidebar
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'quickSave') {
    // Relay to sidebar if needed
    chrome.runtime.sendMessage(message);
  }
  return true;
});
