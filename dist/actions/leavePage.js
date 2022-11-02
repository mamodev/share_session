"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RequestError_1 = __importDefault(require("../classes/RequestError"));
function leavePage(event, connectionPool) {
    const page = event.msg.data.url;
    if (!page)
        throw new RequestError_1.default("leavePage", "Invalid data format");
    if (!connectionPool.hasPool(`page$${page}`))
        throw new RequestError_1.default("leavePage", "The entity doesnt't exist");
    const pagePool = connectionPool.getPool(`page$${page}`);
    pagePool.updateData(event.id, (data) => {
        return { users: data.users.filter((user) => user !== event.id) };
    });
}
exports.default = leavePage;
