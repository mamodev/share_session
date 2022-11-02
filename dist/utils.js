"use strict";
/**
 * @param {  Record<any, any> } ws
 * @return { string | null}
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEntityPoolId = exports.getSocketRemoteAddress = void 0;
function getSocketRemoteAddress(ws) {
    if (ws._socket) {
        const address = ws._socket.remoteAddress;
        if (typeof address === "string") {
            return address;
        }
        else
            return null;
    }
    return null;
}
exports.getSocketRemoteAddress = getSocketRemoteAddress;
/**
 * @param {string} name
 * @param {string} id
 */
function generateEntityPoolId(name, id) {
    return `${name}-${id}`;
}
exports.generateEntityPoolId = generateEntityPoolId;
