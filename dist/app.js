"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const leavePage_1 = __importDefault(require("./actions/leavePage"));
const loadPage_1 = __importDefault(require("./actions/loadPage"));
const DataPool_1 = __importDefault(require("./classes/DataPool"));
const Server_1 = require("./classes/Server");
const TokenValidator_1 = require("./classes/TokenValidator");
//
// const httpsServer = createServer({
//   cert: readFileSync("cert/cert.pem"),
//   key: readFileSync("cert/key.pem"),
// });
const tokenValidator = new TokenValidator_1.TokenValidator("123a567w901a34567a90x2j4567j90w2", (token) => {
    if (typeof token !== "string") {
        return token.utente;
    }
    return null;
});
const httpServer = (0, http_1.createServer)();
const server = new Server_1.SocketServer(httpServer, tokenValidator);
server.action("loadPage", loadPage_1.default);
server.action("leavePage", leavePage_1.default);
server.entity("page", (id) => {
    return new DataPool_1.default(id, { users: [] });
});
httpServer.listen(8080);
// test();
