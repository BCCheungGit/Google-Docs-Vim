let listenerAdded = false;
let mode = "normal"; // Mode variable to track current mode

const keyMap = {
    "ArrowLeft": 37,
    "ArrowDown": 40,
    "ArrowUp": 38,
    "ArrowRight": 39,
    "Delete": 46,
}

let iframeDocument = null;  // To store iframe document

// Function to add keydown listener to the Google Docs iframe
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

// Keydown handler function that adapts based on the mode
function handleKeydown(e) {
    switch (mode) {
        case "normal":
            handleNormalMode(e);
            break;
        case "insert":
            handleInsertMode(e);
            break;
        case "visual":
            handleVisualMode(e);
            break;
    }
}

// Normal mode keybindings (e.g., arrow keys)
function handleNormalMode(e) {
    switch (e.key) {
        case "h":
            e.preventDefault();
            simulateKey('ArrowLeft');
            break;
        case "j":
            e.preventDefault();
            simulateKey('ArrowDown');
            break;
        case "k":
            e.preventDefault();
            simulateKey('ArrowUp');
            break;
        case "l":
            e.preventDefault();
            simulateKey('ArrowRight');
            break;
        case "w":
            e.preventDefault();
            simulateKey('ArrowRight', true);
            break;
        case "b":
            e.preventDefault();
            simulateKey('ArrowLeft', true);
            break;
        case "i":
            e.preventDefault();
            enterInsertMode();
            break;
        case "a":
            e.preventDefault();
            simulateKey('ArrowRight');
            enterInsertMode();
            break;
        case "x":
            e.preventDefault();
            simulateKey('Delete');
            break;
        case "u":
            e.preventDefault();
            console.log('Undoing...');
            simulateKey('z', true)
            break;
        case "d":
            e.preventDefault();
            break;
        case "v":
            e.preventDefault();
            enterVisualMode();
            break;
        default:
            e.preventDefault();
            break;
    }
}


function handleVisualMode(e) {
    switch (e.key) {
        case "h":
            e.preventDefault();
            simulateKey('ArrowLeft', false, true);
            break;
        case "j":
            e.preventDefault();
            simulateKey('ArrowDown', false, true);
            break;
        case "k":
            e.preventDefault();
            simulateKey('ArrowUp', false, true);
            break;
        case "l":
            e.preventDefault();
            simulateKey('ArrowRight', false, true);
            break;
        case "w":
            e.preventDefault();
            simulateKey('ArrowRight', true, true);
            break;
        case "b":
            e.preventDefault();
            simulateKey('ArrowLeft', true, true);
            break;
        case "x":
            e.preventDefault();
            simulateKey('Delete');
            break;
        case "Escape":
            e.preventDefault();
            enterNormalMode();
            break;
    }
}

// Insert mode keybindings (Escape to go back to normal mode)
function handleInsertMode(e) {
    if (e.key === "Escape") {
        e.preventDefault();
        enterNormalMode();
    }
}

// Enter insert mode (switch mode state)
function enterInsertMode() {
    mode = "insert";
    addKeyBindingToIframe();  // Reinitialize event listeners for insert mode
    updateStatusIndicator();
}

function enterVisualMode() {
    mode = "visual";
    addKeyBindingToIframe();
    updateStatusIndicator();
}

// Enter normal mode (switch mode state)
function enterNormalMode() {
    mode = "normal";
    addKeyBindingToIframe();  // Reinitialize event listeners for normal mode
    updateStatusIndicator();
}


// Simulate key events for direction keys
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


function createStatusIndicator() {
    // Minimal inline styling to reduce CSP conflicts
    const style = 'position:fixed;bottom:10px;right:10px;background:rgba(0,0,0,0.7);color:white;padding:5px;border-radius:3px;z-index:9999;';

    let statusElement = document.createElement('div');
    statusElement.setAttribute('style', style);
    statusElement.setAttribute('id', 'status-indicator');

    document.body.appendChild(statusElement);
    updateStatusIndicator();
}


function updateStatusIndicator() {
    const statusElement = document.querySelector('#status-indicator');
    if (!statusElement) {
        return;
    }

    statusElement.innerText = `MODE: ${mode.toUpperCase()}`;
}


// Run the function when the page loads
window.addEventListener('load', () => {
    addKeyBindingToIframe();
    createStatusIndicator();
});

// Observe for dynamically loaded iframes
const observer = new MutationObserver(() => {
    addKeyBindingToIframe();
});
observer.observe(document.body, { childList: true, subtree: true });
