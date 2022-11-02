"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestError = void 0;
const requestError = (action, message, status) => JSON.stringify({ action, message, status });
exports.requestError = requestError;
class RequestError extends Error {
    constructor(action, message, status = 400) {
        super(message);
        this.status = status;
        this.action = action;
    }
    toString() {
        return JSON.stringify({ action: this.action, status: this.status, message: this.message });
    }
}
exports.default = RequestError;
