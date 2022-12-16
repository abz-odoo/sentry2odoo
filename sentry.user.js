// ==UserScript==
// @name         Sentry2Odoo
// @version      0.1
// @description  try to take over the world!
// @author       Achraf (abz)
// @match        https://sentry.io/organizations/online/issues/*/events/*/?project=20801
// @icon         https://www.google.com/s2/favicons?sz=64&domain=sentry.io
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const start = (url) => {
        console.log("Starting", url);
        const resolveButton = document.querySelector('button[aria-label="Resolve"]');
        if (resolveButton){
            const clone = resolveButton.cloneNode(true);
            clone.children[1].textContent = "Create Odoo Ticket";
            clone.style.marginLeft = "1em";
            resolveButton.parentElement.appendChild(clone);
            clone.addEventListener("click", ()=>{
                
            })
        }
    }
    const tryStart = () => {
        const depends = [
            document.querySelector('button[aria-label="Resolve"]'),
            document.querySelector('a[rel="noreferrer noopener"]')
        ]
        if (depends.some(el=>!el)){
            console.log("not yet, trying in 500ms")
            setTimeout(tryStart, 500);
        } else {
            start();
        }
    }
    tryStart();
})();