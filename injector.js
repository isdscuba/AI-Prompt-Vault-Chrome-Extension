// Injector - Runs in page context for more direct DOM access
// This is a web-accessible resource that can be injected if needed

(function() {
  'use strict';

  // Listen for custom events from content script
  window.addEventListener('injectPromptEvent', function(e) {
    const { platform, text } = e.detail;
    
    if (platform === 'chatgpt') {
      injectToChatGPT(text);
    } else if (platform === 'claude') {
      injectToClaude(text);
    }
  });

  function injectToChatGPT(text) {
    // Multiple attempts with different selectors
    const attempts = [
      () => {
        const textarea = document.getElementById('prompt-textarea');
        if (textarea) {
          textarea.value = text;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
        return false;
      },
      () => {
        const textarea = document.querySelector('textarea[placeholder*="Message"]');
        if (textarea) {
          textarea.value = text;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
        return false;
      },
      () => {
        const div = document.querySelector('div[contenteditable="true"]');
        if (div) {
          div.textContent = text;
          div.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
        return false;
      }
    ];

    for (const attempt of attempts) {
      if (attempt()) break;
    }
  }

  function injectToClaude(text) {
    // Claude uses ProseMirror - needs special handling
    const selectors = [
      'div.ProseMirror[contenteditable="true"]',
      'div[contenteditable="true"][data-placeholder]',
      'fieldset div[contenteditable="true"]',
      'div[contenteditable="true"]'
    ];
    
    let editor = null;
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        // Find visible, large enough input area
        if (el.offsetHeight > 30 && el.offsetWidth > 200) {
          editor = el;
          break;
        }
      }
      if (editor) break;
    }
    
    if (editor) {
      // Focus the editor
      editor.focus();
      
      // Clear existing content
      editor.innerHTML = '';
      
      // Insert text as a paragraph (ProseMirror expects block elements)
      const p = document.createElement('p');
      p.setAttribute('data-pm-slice', '0 0 []');
      p.textContent = text;
      editor.appendChild(p);
      
      // Place cursor at end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(p);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      
      // Dispatch comprehensive set of events for ProseMirror
      const events = [
        new Event('focus', { bubbles: true }),
        new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: text
        }),
        new InputEvent('input', {
          bubbles: true,
          cancelable: false,
          inputType: 'insertText',
          data: text
        }),
        new Event('change', { bubbles: true }),
        new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }),
        new KeyboardEvent('keyup', { bubbles: true, key: 'Enter' })
      ];
      
      events.forEach(e => editor.dispatchEvent(e));
      
      return true;
    }
    
    return false;
  }
})();
