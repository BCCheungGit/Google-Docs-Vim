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
- `y` to yank the selected text (visual mode only)
- `p` to paste the yanked text (normal mode only)

## Implementation
The extension is implemented in pure JavaScript that works to manipulate the DOM, specifically the iframe in which the Google Docs editor is located. The extension listens for key presses and manipulates the cursor position and text content accordingly.

### How is Google-Docs-Vim different from actual Vim?
Because of the way Google Docs works and how it is now canvas based [see here](https://workspaceupdates.googleblog.com/2021/05/Google-Docs-Canvas-Based-Rendering-Update.html), many features are difficult to implement correctly since there are now limitations to what I can do with only JavaScript. To work around this, I reverse-engineered many other chrome extensions who seem to work fine with Google Docs (such as Grammarly), but ultimately the fact of the matter is that many vim keybindings are too difficult to implement currently (I will attempt to do more later).

Some differences that you may notice:
- pressing `e`, `b` and `w` may not work as intended with trailing whitespaces.
- pressing `x` doesn't work ***exactly*** the same
- Cursor style remains the same throughout the different modes
- In visual mode, pressing any key other than ones that I have keybound will revert back to normal mode.
- pressing `dd` will not properly delete empty lines.


### So why not use the suggested Google Workspace Add-ons framework?
- Good Question.
- I wanted to learn how to make a chrome extension because I've always wondered how they worked (and I was procrastinating studying for my Operating Systems exam...)
    - Therefore I stubbornly refuse to use this feature. for now. I probably will migrate this extension there in the future if I see there is a need for it, but for right now this is just a pet project of mine.
    - If you are a developer feel free to write your own version in Google Workspace.


### Potentially Confusing Code Snippets

1. What does this do?
```javascript
iframeDocument.addEventListener("keydown", handleKeydown, true); // Use capture phase
```
This adds the event listener to the iframe document, which is where the Google Docs editor is located. The `handleKeydown` function is called whenever a keydown event is detected in the iframe. The `true` parameter specifies that the event listener should be added in the capture phase, which means that the event will be captured by the iframe document ***before*** it reaches the target element. If we do not do this, even if we call `e.preventDefault()` in the event handler, the event will still be passed to the Google Docs editor, which will then handle the event itself. This is not what we want, so we need to add the event listener in the capture phase to prevent the event from reaching the editor. 



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

