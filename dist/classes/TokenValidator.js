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
var _TokenValidator_secret, _TokenValidator_idGenerator;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenValidator = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
class TokenValidator {
    constructor(secret, idGenerator) {
        _TokenValidator_secret.set(this, void 0);
        _TokenValidator_idGenerator.set(this, void 0);
        __classPrivateFieldSet(this, _TokenValidator_secret, secret, "f");
        __classPrivateFieldSet(this, _TokenValidator_idGenerator, idGenerator, "f");
    }
    validate(token) {
        try {
            const jwt = (0, jsonwebtoken_1.verify)(token, __classPrivateFieldGet(this, _TokenValidator_secret, "f"));
            if (typeof jwt !== "string" && jwt.exp) {
                const expDate = new Date(0);
                expDate.setUTCSeconds(jwt.exp);
                if (new Date().getTime() >= expDate.getTime())
                    throw new Error();
            }
            return __classPrivateFieldGet(this, _TokenValidator_idGenerator, "f").call(this, jwt);
        }
        catch (_a) {
            return null;
        }
    }
}
exports.TokenValidator = TokenValidator;
_TokenValidator_secret = new WeakMap(), _TokenValidator_idGenerator = new WeakMap();
