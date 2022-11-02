"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotLinkedConnectionError = void 0;
class NotLinkedConnectionError extends Error {
    constructor(id) {
        super(`Connnection ${id} isn't connected to any page`);
    }
}
exports.NotLinkedConnectionError = NotLinkedConnectionError;
