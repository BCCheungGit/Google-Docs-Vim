// Flag to track whether the event listener has been added to the iframe
let listenerAdded = false;

let mode = "normal";



const keyMap = {
    "ArrowLeft": 37,
    "ArrowDown": 40,
    "ArrowUp": 38,
    "ArrowRight": 39,
}

// Function to add keydown listener to the Google Docs iframe
function addKeyBindingToIframe() {
    if (mode == "normal") {

    const iframe = document.querySelector('iframe.docs-texteventtarget-iframe');
    if (!iframe) {
        console.warn('Google Docs editor iframe not found!');
        return;
    }

    // Avoid adding the listener multiple times
    if (listenerAdded) {
        return;
    }

    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    
    // Add the event listener for keydown
    iframeDocument.addEventListener('keydown', function (e) {
        
        switch (e.key) {
            case "h":
                e.preventDefault();
                simulateDirectionKey('ArrowLeft');
                break;
            case "j":
                e.preventDefault();
                simulateDirectionKey('ArrowDown');
                break;
            case "k":
                e.preventDefault();
                simulateDirectionKey('ArrowUp');
                break;
            case "l":  
                e.preventDefault();
                simulateDirectionKey('ArrowRight');
                break;
            case "w":
                e.preventDefault();
                simulateDirectionKey('ArrowRight', true);
                break;
            case "b":
                e.preventDefault();
                simulateDirectionKey('ArrowLeft', true);
                break;
            case "i":
                e.preventDefault();
                mode = "insert";
                break;
        } 
    });

    listenerAdded = true; // Mark that the listener has been added

    } else {
        return;
    } 

}



function simulateDirectionKey(key, ctrl = false) {
    const iframe = document.querySelector('iframe.docs-texteventtarget-iframe');
    if (!iframe) {
        console.warn('Google Docs editor iframe not found!');
        return;
    }

    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    const activeElement = iframeDocument.activeElement;

    if (!activeElement) {
        console.warn('No active element in Google Docs iframe!');
        return;
    }

    // Dispatch the ArrowLeft key event on the active element
    const event = new KeyboardEvent('keydown', {
        key: key,
        code: key,
        keyCode: parseInt(keyMap[key], 10),
        which: parseInt(keyMap[key], 10),
        bubbles: true, // Important to ensure the event propagates
        ctrlKey: ctrl,
    });
    activeElement.dispatchEvent(event);
}


// Run the function when the page loads
window.addEventListener('load', () => {
    addKeyBindingToIframe();
});

// Observe for dynamically loaded iframes
const observer = new MutationObserver(() => {
    addKeyBindingToIframe();
});
observer.observe(document.body, { childList: true, subtree: true });
