// ==UserScript==
// @name         Sentry2Odoo
// @version      0.1
// @description  try to take over the world!
// @author       Achraf (abz)
// @match        https://sentry.io/organizations/online/issues/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=sentry.io
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    class SocketClient {
        constructor(url) {
            this.socket = new WebSocket(url);
            this.id = generateId(10);
            this.callbacks = {};
            this.eventListeners = {
                error: [{ callback: e => console.log("error", e), once: false }],
                disconnect: [{ callback: e => console.log("disconnect socket", e), once: false }],
                open: [{ callback: e => this.emit("imConnected"), once: true }],
            };
            function generateId(len) {
                const charset = "abdefghijklmnopqrstuvwxyzABDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                const hash = n => [...new Array(n)].map(x => charset[Math.floor(Math.random() * charset.length)]).join("")
                return hash(len);
            }
            function checkCallbacks({ event, args }) {
                for (let key of Object.keys(this.callbacks)) {
                    const string = `__${key}:callback_`
                    if (!event.indexOf(string)) {
                        const index = event[string.length];
                        this.callbacks[key][index](...args);
                        this.callbacks[key].splice(index, 1);
                        return true;
                    }
                }
                return false;
            }
            this.socket.onopen = (event) => {
                this.callListener("open", event)
            }
            this.socket.onclose = closeArg => {
                this.callListener("close", closeArg)
                this.callListener("disconnect", closeArg);
            }
            this.socket.onmessage = ({ data }) => {
                let parsedEvent = {};
                try {
                    parsedEvent = JSON.parse(data);
                } catch (e) {
                    return this.callListener("error", e);
                } finally {
                    const { event } = parsedEvent;
                    if (!parsedEvent || !parsedEvent.hasOwnProperty("event")) return this.callListener("error", "Invalid JSON content")
                    if (checkCallbacks.call(this, parsedEvent)) return;
                    let eventCallback = this.eventListeners[event];
                    if (!eventCallback) {
                        return;
                    }
                    let args = parsedEvent.args;
                    let functions = args.map((x, y) => [x, y]).filter(x => typeof x[0] === "string" && ~x[0].indexOf("__function(){}__"));
                    functions.forEach((data, callbackIndex) => {
                        let [arg, i] = data;
                        args[i] = ((...callbackArgs) => {
                            this.emit(`__${event}:callback_${callbackIndex}`, ...callbackArgs);
                        }).bind(this);
                    })
                    this.callListener(event, ...parsedEvent.args);
                }
            }

        }
        callListener(listener, ...args) {
            if (!this.eventListeners.hasOwnProperty(listener)) return this.socket;
            console.log("call", listener, ...args);
            const eventCallbacks = this.eventListeners[listener];
            eventCallbacks.forEach((eventCallback, eventCallbackIndex) => {
                eventCallback.callback(...args);
                if (eventCallbacks.once) {
                    this.eventListeners[event].splice(eventCallbackIndex, 1);
                }
            });
            return this;
        }
        removeAllListeners(listener) {
            if (!listener || !listener.length) listener = Object.keys(this.eventListeners);
            else listener = [listener];
            listener.forEach(x => {
                if (this.eventListeners.hasOwnProperty(x)) this.eventListeners[x].length = 0;
            })
            return this;
        }
        once(eventName, callback) {
            return this.on(eventName, callback, true);
        }
        on(eventName, callback, once = false) {
            if (typeof callback !== "function" || !eventName) return this.socket;
            this.eventListeners[eventName] = this.eventListeners[eventName] || [];
            this.eventListeners[eventName].push({
                callback, once
            })
            return this;
        }
        off(eventName, callback) {
            if (!eventName) return this.socket;
            if (!callback || typeof callback !== "function") return this.removeAllListeners(eventName);
            if (this.eventListeners.hasOwnProperty(eventName)) {
                this.eventListeners[eventName].forEach((event, index) => {
                    if (event.callback == callback) this.eventListeners[eventName].splice(index, 1);
                })
            }
            return this;
        }
        disconnect() {
            this.socket.close();
        }
        emit(event, ...spreadArgs) {
            if (this.socket.readyState !== 1) return;
            this.socket.send(JSON.stringify({
                event,
                args: [...spreadArgs]
            }, (a, elem) => {
                if (typeof elem == "function") {
                    this.callbacks[event] = this.callbacks[event] || [];
                    this.callbacks[event].push(elem);
                    return "__function(){}__";
                } else return elem
            }))
            return this;
        }
    }
    const getData = async url => {
        const response = await fetch(url, {
            "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language": "en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7",
                "cache-control": "max-age=0",
                "sec-ch-ua": '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1"
            },
            "referrerPolicy": "no-referrer",
            "body": null,
            "method": "GET",
            "mode": "no-cors",
            "credentials": "include"
        });
        const json = await response.json();
        return json;
    }
    const start = () => {
        console.log("Starting");
        const resolveButton = document.querySelector('button[aria-label="Resolve"]');
        if (resolveButton) {
            const socket = new SocketClient("wss://sentry.macadelic.io");
            socket.on("connect", () => {
                const clone = resolveButton.cloneNode(true);
                clone.children[1].textContent = "Create Odoo Ticket";
                clone.style.marginLeft = "1em";
                resolveButton.parentElement.appendChild(clone);
                clone.addEventListener("click", async () => {
                    const url = document.querySelector('a[rel="noreferrer noopener"]').href;
                    const data = await getData(url);
                    socket.emit("createTicket", url, data, (id) => {
                        window.open(`https://www.odoo.com/web#id=${id}&cids=1&menu_id=5879&action=3531&model=project.task&view_type=form`);           
                    });
                })
            })
        }
    }
    const tryStart = () => {
        const depends = [
            document.querySelector('button[aria-label="Resolve"]'),
            document.querySelector('a[rel="noreferrer noopener"]')
        ]
        if (depends.some(el => !el)) {
            console.log("not yet, trying in 500ms")
            setTimeout(tryStart, 500);
        } else {
            start();
        }
    }
    tryStart();
})();