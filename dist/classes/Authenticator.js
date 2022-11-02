"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Authenticator_token_validator, _Authenticator_connectionAcceptHandler, _Authenticator_connectionRefuseHandler;
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
class Authenticator {
    constructor(tokenValidator, connectionAcceptHandler, connectionRefuseHandler) {
        _Authenticator_token_validator.set(this, void 0);
        _Authenticator_connectionAcceptHandler.set(this, void 0);
        _Authenticator_connectionRefuseHandler.set(this, void 0);
        __classPrivateFieldSet(this, _Authenticator_token_validator, tokenValidator, "f");
        __classPrivateFieldSet(this, _Authenticator_connectionAcceptHandler, connectionAcceptHandler, "f");
        __classPrivateFieldSet(this, _Authenticator_connectionRefuseHandler, connectionRefuseHandler, "f");
    }
    handleConnection(ws) {
        console.log(`[?] Connection from ${(0, utils_1.getSocketRemoteAddress)(ws)}`);
        const authTimeout = setTimeout(() => {
            ws.terminate();
        }, 1000);
        const tokenValidator = __classPrivateFieldGet(this, _Authenticator_token_validator, "f");
        const messageHandler = (data) => {
            try {
                if (!(data instanceof Buffer))
                    throw new Error("Invalid data stream format");
                const decoded = data.toString();
                const connectionId = tokenValidator.validate(decoded);
                if (!connectionId)
                    throw new Error("Invalid token");
                // const connectionId = this.#connection_pool.addConnection(ws);
                // this.#addMessageHandler(ws, decoded);
                __classPrivateFieldGet(this, _Authenticator_connectionAcceptHandler, "f").call(this, ws, connectionId);
                clearTimeout(authTimeout);
            }
            catch (error) {
                const err = error;
                __classPrivateFieldGet(this, _Authenticator_connectionRefuseHandler, "f").call(this, ws, err);
            }
            ws.removeListener("message", messageHandler);
        };
        ws.addListener("message", messageHandler);
    }
}
exports.default = Authenticator;
_Authenticator_token_validator = new WeakMap(), _Authenticator_connectionAcceptHandler = new WeakMap(), _Authenticator_connectionRefuseHandler = new WeakMap();
