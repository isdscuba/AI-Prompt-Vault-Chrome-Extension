// Content Script - Runs on all pages

// Listen for messages from sidebar/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSelection') {
    // Get selected text from page
    const selectedText = window.getSelection().toString().trim();
    sendResponse({ text: selectedText });
  } else if (message.action === 'fillPrompt') {
    // Inject prompt into ChatGPT or Claude
    injectPrompt(message.platform, message.text);
    sendResponse({ success: true });
  }
  return true;
});

function injectPrompt(platform, text) {
  // Dispatch custom event that injector.js will catch
  window.dispatchEvent(new CustomEvent('injectPromptEvent', {
    detail: { platform, text }
  }));
  
  // Also try direct injection as fallback
  if (platform === 'chatgpt') {
    injectIntoChatGPT(text);
  } else if (platform === 'claude') {
    injectIntoClaude(text);
  }
}

function injectIntoChatGPT(text) {
  // Wait for page to be ready
  const checkInterval = setInterval(() => {
    // Try multiple selectors for ChatGPT's textarea
    const selectors = [
      '#prompt-textarea',
      'textarea[placeholder*="Message"]',
      'textarea[data-id="root"]',
      'div[contenteditable="true"]'
    ];

    let textarea = null;
    for (const selector of selectors) {
      textarea = document.querySelector(selector);
      if (textarea) break;
    }

    if (textarea) {
      clearInterval(checkInterval);
      
      // Focus the textarea
      textarea.focus();
      
      // Set the value
      if (textarea.tagName === 'TEXTAREA') {
        textarea.value = text;
        // Trigger input event
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (textarea.contentEditable === 'true') {
        // For contenteditable div
        textarea.textContent = text;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      // Try to find and focus the send button (optional)
      const sendButton = document.querySelector('button[data-testid="send-button"]') ||
                        document.querySelector('button[aria-label*="Send"]');
      if (sendButton) {
        sendButton.focus();
      }
    }
  }, 500);

  // Stop trying after 10 seconds
  setTimeout(() => clearInterval(checkInterval), 10000);
}

function injectIntoClaude(text) {
  // Wait for page to be ready
  const checkInterval = setInterval(() => {
    // Try multiple selectors for Claude's textarea
    const selectors = [
      'div[contenteditable="true"][role="textbox"]',
      'div.ProseMirror',
      'textarea',
      'div[contenteditable="true"]'
    ];

    let textarea = null;
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      // Find the main input (usually the largest one)
      for (const el of elements) {
        if (el.offsetHeight > 50) {
          textarea = el;
          break;
        }
      }
      if (textarea) break;
    }

    if (textarea) {
      clearInterval(checkInterval);
      
      // Focus the textarea
      textarea.focus();
      
      // Set the value
      if (textarea.tagName === 'TEXTAREA') {
        textarea.value = text;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (textarea.contentEditable === 'true') {
        // For contenteditable div (ProseMirror)
        textarea.textContent = text;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Trigger additional events for ProseMirror
        const inputEvent = new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: text
        });
        textarea.dispatchEvent(inputEvent);
      }
    }
  }, 500);

  // Stop trying after 10 seconds
  setTimeout(() => clearInterval(checkInterval), 10000);
}

// Export for use in injector if needed
window.injectPrompt = injectPrompt;
