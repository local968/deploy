/*

Auth Wei.Zhang@unidt.com
Copyright  R2.AI, Inc.

*/
(function (global, factory) {
    // if (typeof define === 'function' && define.amd) {
    //     define([], factory);
    // } else if (typeof module !== 'undefined' && module.exports){
        module.exports = factory();
    // } else {
    //     global.R2WSClient = factory();
    // }
})(this, function () {
    if (!('WebSocket' in window)) {
        return;
    }
    var msgpack = require('msgpack-lite');
    function R2WSClient(url, protocols, options) {

        // Default settings
        var settings = {

            /** Whether this instance should log debug messages. */
            debug: false,

            /** Whether or not the websocket should attempt to connect immediately upon instantiation. */
            automaticOpen: true,

            /** The number of milliseconds to delay before attempting to reconnect. */
            reconnectInterval: 1000,
            /** The maximum number of milliseconds to delay a reconnection attempt. */
            maxReconnectInterval: 30000,
            /** The rate of increase of the reconnect delay. Allows reconnect attempts to back off when problems persist. */
            reconnectDecay: 1.5,

            /** The maximum time in milliseconds to wait for a connection to succeed before closing and retrying. */
            timeoutInterval: 2000,

            /** The maximum number of reconnection attempts to make. Unlimited if null. */
            maxReconnectAttempts: null,

            /** The binary type, possible values 'blob' or 'arraybuffer', default 'blob'. */
            binaryType: 'arraybuffer',
            /** The session id key in localStorage. */
            sidkey:'SID.R2WS.RuleEngine.R2AI',
        }
        if (!options) { options = {}; }

        // Overwrite and define settings with options if they exist.
        for (var key in settings) {
            if (typeof options[key] !== 'undefined') {
                this[key] = options[key];
            } else {
                this[key] = settings[key];
            }
        }

        // These should be treated as read-only properties

        /** The URL as resolved by the constructor. This is always an absolute URL. Read only. */
        this.url = url;

        /** The number of attempted reconnects since starting, or the last successful connection. Read only. */
        this.reconnectAttempts = 0;

        /**
         * The current state of the connection.
         * Can be one of: WebSocket.CONNECTING, WebSocket.OPEN, WebSocket.CLOSING, WebSocket.CLOSED
         * Read only.
         */
        this.readyState = WebSocket.CONNECTING;

        /**
         * A string indicating the name of the sub-protocol the server selected; this will be one of
         * the strings specified in the protocols parameter when creating the WebSocket object.
         * Read only.
         */
        this.protocol = null;

        // Private state variables

        var self = this;
        var ws;
        var forcedClose = false;
        var timedOut = false;
        var eventTarget = document.createElement('div');

        // Wire up "on*" properties as event handlers

        eventTarget.addEventListener('open',       function(event) { self.onopen(event); });
        eventTarget.addEventListener('close',      function(event) { self.onclose(event); });
        eventTarget.addEventListener('connecting', function(event) { self.onconnecting(event); });
        eventTarget.addEventListener('message',    function(event) { self.onmessage(event); });
        eventTarget.addEventListener('error',      function(event) { self.onerror(event); });
        eventTarget.addEventListener('ready',      function(event) { self.onready(event); });

        // Expose the API required by EventTarget

        this.addEventListener = eventTarget.addEventListener.bind(eventTarget);
        this.removeEventListener = eventTarget.removeEventListener.bind(eventTarget);
        this.dispatchEvent = eventTarget.dispatchEvent.bind(eventTarget);

        /**
         * This function generates an event that is compatible with standard
         * compliant browsers and IE9 - IE11
         *
         * This will prevent the error:
         * Object doesn't support this action
         *
         * http://stackoverflow.com/questions/19345392/why-arent-my-parameters-getting-passed-through-to-a-dispatched-event/19345563#19345563
         * @param s String The name that the event should use
         * @param args Object an optional object that the event will use
         */
        function generateEvent(s, args) {
            var evt = document.createEvent("CustomEvent");
            evt.initCustomEvent(s, false, false, args);
            return evt;
        };

        function messageEncode(type, data) {
            if (typeof(type) === "object") {
                data = type.data;
                type = type.type;
            }

            if (typeof(type) !== "string") {
                throw new Error('INVALID_ARGUEMNT_ERR : messageEncode typeof (type) err');
            }

            if (type.length > 255 || type.length === 0) {
                throw new Error('INVALID_ARGUEMNT_ERR : messageEncode length of type is zero or too long');
            }

            // if (typeof(data) !== "string") {
            //     throw 'INVALID_ARGUEMNT_ERR : messageEncode';
            // }
            var msg = msgpack.encode({type : type, data : data})
            return msg.buffer.slice(0, msg.byteLength);
        }

        function messageDecode(data) {
            data = msgpack.decode(new Uint8Array(data))
            if ("object" !== typeof(data) || !data.hasOwnProperty('type')){
                return null
            }
            return data
        }

        var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        function uuid() {
            var chars = CHARS, uuid = new Array(36), rnd=0, r;
            for (var i = 0; i < 36; i++) {
                if (i===8 || i===13 ||  i===18 || i===23) {
                    uuid[i] = '-';
                } else if (i===14) {
                    uuid[i] = '4';
                } else {
                    if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
                    r = rnd & 0xf;
                    rnd = rnd >> 4;
                    uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
                }
            }
            return uuid.join('').toLowerCase();
        }

        /**
         * the first type message need to send to server when connected
         */
        const SET_SESSION_ID_TYPE = '_sid';

        this.open = function (reconnectAttempt) {
            ws = new WebSocket(self.url, protocols || []);
            ws.binaryType = this.binaryType;

            if (reconnectAttempt) {
                if (this.maxReconnectAttempts && this.reconnectAttempts > this.maxReconnectAttempts) {
                    return;
                }
            } else {
                eventTarget.dispatchEvent(generateEvent('connecting'));
                this.reconnectAttempts = 0;
            }

            if (self.debug || R2WSClient.debugAll) {
                console.debug('R2WSClient', 'attempt-connect', self.url);
            }

            var localWs = ws;
            var timeout = setTimeout(function() {
                if (self.debug || R2WSClient.debugAll) {
                    console.debug('R2WSClient', 'connection-timeout', self.url);
                }
                timedOut = true;
                localWs.close();
                timedOut = false;
            }, self.timeoutInterval);

            ws.onopen = function(event) {
                // wait for SET_SESSION_ID_TYPE message recieved
                //clearTimeout(timeout);
                if (self.debug || R2WSClient.debugAll) {
                    console.debug('R2WSClient', 'onopen', self.url);
                }
                self.protocol = ws.protocol;
                self.readyState = WebSocket.OPEN;
                self.reconnectAttempts = 0;
                var e = generateEvent('open');
                e.isReconnect = reconnectAttempt;
                reconnectAttempt = false;
                eventTarget.dispatchEvent(e);

                // send SET_SESSION_ID_TYPE message
                var sid = localStorage.getItem(self.sidkey);
                if (!sid) {
                    sid = uuid();
                    localStorage.setItem(self.sidkey, sid);
                }
                self.sendmessage(SET_SESSION_ID_TYPE, sid);
            };

            ws.onclose = function(event) {
                clearTimeout(timeout);
                ws = null;
                if (forcedClose) {
                    self.readyState = WebSocket.CLOSED;
                    eventTarget.dispatchEvent(generateEvent('close'));
                } else {
                    self.readyState = WebSocket.CONNECTING;
                    var e = generateEvent('connecting');
                    e.code = event.code;
                    e.reason = event.reason;
                    e.wasClean = event.wasClean;
                    eventTarget.dispatchEvent(e);
                    if (!reconnectAttempt && !timedOut) {
                        if (self.debug || R2WSClient.debugAll) {
                            console.debug('R2WSClient', 'onclose', self.url);
                        }
                        eventTarget.dispatchEvent(generateEvent('close'));
                    }

                    var timeOut = self.reconnectInterval * Math.pow(self.reconnectDecay, self.reconnectAttempts);
                    setTimeout(function() {
                        self.reconnectAttempts++;
                        self.open(true);
                    }, timeOut > self.maxReconnectInterval ? self.maxReconnectInterval : timeOut);
                }
            };
            ws.onmessage = function(event) {
                if (self.debug || R2WSClient.debugAll) {
                    console.debug('R2WSClient', 'onmessage', self.url, event.data);
                }
                // var e = generateEvent('message');
                // e.data = event.data;
                // eventTarget.dispatchEvent(e);

                var message = messageDecode(event.data);
                if (message != null)
                {
                    if (SET_SESSION_ID_TYPE === message.type) {
                        var data = JSON.parse(message.data)
                        if ('object' === typeof(data) && 0 === data.errno) {
                            clearTimeout(timeout);

                            var e1 = generateEvent('ready');
                            eventTarget.dispatchEvent(e1);

                            if (self.debug || R2WSClient.debugAll) {
                                console.debug('R2WSClient', 'onready', self.url);
                            }
                        } else {
                            localWs.close();
                        }
                        return
                    }

                    var e2 = generateEvent('message');
                    e2.data = message;
                    eventTarget.dispatchEvent(e2);

                    var e3 = generateEvent('_ev_' + message.type);
                    e3.data = message.data;
                    eventTarget.dispatchEvent(e3);
                }
                else
                {
                    throw new Error('INVALID_FORMATE : message decode failed');
                }
            };
            ws.onerror = function(event) {
                if (self.debug || R2WSClient.debugAll) {
                    console.debug('R2WSClient', 'onerror', self.url, event);
                }
                eventTarget.dispatchEvent(generateEvent('error'));
            };
        }

        // Whether or not to create a websocket upon instantiation
        if (this.automaticOpen === true) {
            this.open(false);
        }

        /**
         * Transmits data to the server over the WebSocket connection.
         *
         * @param data a text string, ArrayBuffer or Blob to send to the server.
         */
        this.send = function(data) {
            if (ws) {
                if (self.debug || R2WSClient.debugAll) {
                    console.debug('R2WSClient', 'send', self.url, data);
                }
                return ws.send(data);
            } else {
                throw new Error('INVALID_STATE_ERR : Pausing to reconnect websocket');
            }
        };

        /**
         * Closes the WebSocket connection or connection attempt, if any.
         * If the connection is already CLOSED, this method does nothing.
         */
        this.close = function(code, reason) {
            // Default CLOSE_NORMAL code
            if (typeof code === 'undefined') {
                code = 1000;
            }
            forcedClose = true;
            if (ws) {
                ws.close(code, reason);
            }
        };

        /**
         * Additional public API method to refresh the connection if still open (close, re-open).
         * For example, if the app suspects bad data / missed heart beats, it can try to refresh.
         */
        this.refresh = function() {
            if (ws) {
                ws.close();
            }
        };

        /**
         * Transmits data to the server over the WebSocket connection.
         *
         * @param type a message type(string).
         * @param data a text string, ArrayBuffer or Blob to send to the server.
         */
        this.sendmessage = function(type, data) {
            return this.send(messageEncode(type, data));
        };

        /**
         * Add an event listener to be called when a message is received from the server.
         *
         * @param type a message type(string).
         * @param handle event function when happens.
         */
        this.addmessage = function (type, handle) {
            eventTarget.addEventListener('_ev_' + type, handle);
        }

        /**
         * Remove an event listener to be called when a message is received from the server.
         *
         * @param type a message type(string).
         * @param handle event function when happens.
         */
        this.removemessage = function (type, handle) {
            eventTarget.removeEventListener('_ev_' + type, handle);
        }
    }

    /**
     * An event listener to be called when the WebSocket connection's readyState changes to OPEN;
     * this indicates that the connection is ready to send and receive data.
     */
    R2WSClient.prototype.onopen = function(event) {};
    /** An event listener to be called when the WebSocket connection's readyState changes to CLOSED. */
    R2WSClient.prototype.onclose = function(event) {};
    /** An event listener to be called when a connection begins being attempted. */
    R2WSClient.prototype.onconnecting = function(event) {};
    /** An event listener to be called when a message is received from the server. */
    R2WSClient.prototype.onmessage = function(event) {};
    /** An event listener to be called when an error occurs. */
    R2WSClient.prototype.onerror = function(event) {};
    /** An event listener to be called when set session id success. */
    R2WSClient.prototype.onready = function(event) {};
    

    /**
     * Whether all instances of R2WSClient should log debug messages.
     * Setting this to true is the equivalent of setting all instances of R2WSClient.debug to true.
     */
    R2WSClient.debugAll = false;

    R2WSClient.CONNECTING = WebSocket.CONNECTING;
    R2WSClient.OPEN = WebSocket.OPEN;
    R2WSClient.CLOSING = WebSocket.CLOSING;
    R2WSClient.CLOSED = WebSocket.CLOSED;

    return R2WSClient;
});
