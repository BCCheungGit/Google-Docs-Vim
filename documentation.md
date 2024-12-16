# Documentation
---
## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Implementation](#implementation)

## Introduction
This is a simple chrome extension meant to simulate basic vim commands in google docs. It is a work in progress and is not meant to be a full replacement for vim. The extension is meant to be a fun way to practice vim commands in a different environment. Currently, features are very limited and only basic commands are supported, but more features will be added in the future.

## Installation
1. Clone this repository
```bash
git clone https://github.com/BCCheungGit/Google-Docs-Vim.git
```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable developer mode (toggle in top right corner)
4. Click `Load unpacked` and select the directory where you cloned the repository
5. The extension should now be installed and ready to use, have fun!


## Usage
- `i` to enter insert mode
- `esc` to exit insert mode
- `a` to enter insert mode after the cursor
- `hjkl` to move the cursor in normal and visual mode
- `w` to move the cursor to the beginning of the next word
- `b` to move the cursor to the beginning of the previous word
- `x` to delete the character under the cursor
- `u` to undo the last action
- `/` to enter search mode
- `v` to enter visual mode
- `$` to move the cursor to the end of the line
- `0` to move the cursor to the beginning of the line

## Implementation
The extension is implemented in pure JavaScript that works to manipulate the DOM, specifically the iframe in which the Google Docs editor is located. The extension listens for key presses and manipulates the cursor position and text content accordingly.

### Potentially Confusing Code Snippets
1. Why do we need to add the keybinding to the iframe?
```javascript
function addKeyBindingToIframe() {
    const iframe = document.querySelector('iframe.docs-texteventtarget-iframe');
    if (!iframe) {
        console.warn('Google Docs editor iframe not found!');
        return;
    }

    iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

    // Remove existing listener if present
    if (listenerAdded) {
        iframeDocument.removeEventListener('keydown', handleKeydown);
        listenerAdded = false;
    }

    // Add the event listener for keydown based on the current mode
    iframeDocument.addEventListener('keydown', handleKeydown);
    listenerAdded = true;  // Mark that the listener has been added
}
```
This is the real "meat and potatoes" of the extension. The Google Docs editor is located in an iframe, so we need to add the keybinding to the iframe itself. This function is called whenever the user switches between normal, insert, and visual mode so that the keybindings are updated accordingly. Without it, the keybindings would not work because the extension would not be listening for key presses in the correct location.

2. How do we change the keybindings based on the current mode?
```javascript
function simulateKey(key, ctrl = false, shift = false) {
    const iframe = document.querySelector('iframe.docs-texteventtarget-iframe');
    if (!iframe) {
        console.warn('Google Docs editor iframe not found!');
        return;
    }

    const activeElement = iframe.contentDocument.activeElement;

    if (!activeElement) {
        console.warn('No active element in Google Docs iframe!');
        return;
    }

    const event = new KeyboardEvent('keydown', {
        key: key,
        code: key,
        keyCode: keyMap[key] ? keyMap[key] : key.charCodeAt(0),
        which: keyMap[key] ? keyMap[key] : key.charCodeAt(0),
        bubbles: true,
        ctrlKey: ctrl,
        shiftKey: shift,
    });

    activeElement.dispatchEvent(event);
}
```
This function is used to simulate key presses in the Google Docs editor. It creates a new `KeyboardEvent` object with the specified key, control key, and shift key settings. This allows us to programmatically trigger key presses in the editor, which is essential for implementing the vim-like functionality. This function alone is enough to implement hjkl movement, w, b, x, u, and other basic commands.

3. How do we handle yank and paste commands?
```javascript
function simulateCopy() {
    document.querySelector(".docs-texteventtarget-iframe").contentDocument.execCommand("copy");
    const selectedText = document.querySelector(".docs-texteventtarget-iframe").contentDocument.body.innerText
    console.log(selectedText)
}
function simulatePaste() {
    console.log("Pasting...");
    const iframe = document.querySelector('iframe.docs-texteventtarget-iframe');
    if (!iframe) {
        console.warn('Google Docs editor iframe not found!');
        return;
    }

    const activeElement = iframe.contentDocument.activeElement;

    if (!activeElement) {
        console.warn('No active element in Google Docs iframe!');
        return;
    }
    navigator.clipboard.readText().then(text => {
        for (let i = 0; i < text.length; i++) {

            const pasteEvent = {
                bubbles: true,
                cancelable: true,
                key: text[i],
                keyCode: text[i].charCodeAt(0),
                ctrlKey: false,
                shiftKey: false,
            }
            activeElement.dispatchEvent(new KeyboardEvent('keypress', pasteEvent));
        }
        return;

    }
    )
}
```
This is where things get weird, and the implementation will be improved in the future (I hope). I first tried to simulate copy and paste by simply calling the aforementioned `simulateKey()` function with the appropriate key codes and ctrl parameter set to true. However, this did not work as expected because Google Docs protects against synthetic key presses modifying the clipboard. Next, I tried using the `execCommand("copy")` and `navigator.clipboard.readText()` functions to copy and paste text, respectively. This did not work at first either because the function is deprecated or for some other reason. The current implementation is a workaround that reads the text from the clipboard and simulates key presses for each character in the text. This is not ideal and will be improved in the future, but hey it works, which is good enough for now. 

