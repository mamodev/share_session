"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _SocketServer_instances, _SocketServer_ws_server, _SocketServer_actions, _SocketServer_entity, _SocketServer_connectionAccept, _SocketServer_connectionRefuse, _SocketServer_addSocketHeartbit, _SocketServer_addMessageHandler;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketServer = void 0;
const ws_1 = require("ws");
const utils_1 = require("../utils");
const Authenticator_1 = __importDefault(require("./Authenticator"));
const ConnectionPool_1 = require("./ConnectionPool");
const RequestError_1 = __importStar(require("./RequestError"));
class SocketServer {
    constructor(httpServer, tokenValidator) {
        _SocketServer_instances.add(this);
        _SocketServer_ws_server.set(this, void 0);
        _SocketServer_actions.set(this, void 0);
        _SocketServer_entity.set(this, void 0);
        __classPrivateFieldSet(this, _SocketServer_ws_server, new ws_1.WebSocketServer({ server: httpServer }), "f");
        const authenticator = new Authenticator_1.default(tokenValidator, (ws, id) => __classPrivateFieldGet(this, _SocketServer_instances, "m", _SocketServer_connectionAccept).call(this, ws, id), (ws, error) => __classPrivateFieldGet(this, _SocketServer_instances, "m", _SocketServer_connectionRefuse).call(this, ws, error));
        __classPrivateFieldSet(this, _SocketServer_actions, new Map(), "f");
        __classPrivateFieldSet(this, _SocketServer_entity, new Map(), "f");
        __classPrivateFieldGet(this, _SocketServer_ws_server, "f").addListener("connection", (ws) => authenticator.handleConnection(ws));
        this.connectionPool = new ConnectionPool_1.ConnectionPool();
    }
    action(name, handler) {
        __classPrivateFieldGet(this, _SocketServer_actions, "f").set(name, handler);
    }
    entity(name, entityFactory) {
        __classPrivateFieldGet(this, _SocketServer_entity, "f").set(name, entityFactory);
    }
}
exports.SocketServer = SocketServer;
_SocketServer_ws_server = new WeakMap(), _SocketServer_actions = new WeakMap(), _SocketServer_entity = new WeakMap(), _SocketServer_instances = new WeakSet(), _SocketServer_connectionAccept = function _SocketServer_connectionAccept(ws, id) {
    this.connectionPool.addConnection(ws, id);
    __classPrivateFieldGet(this, _SocketServer_instances, "m", _SocketServer_addSocketHeartbit).call(this, ws, id);
    ws.send(JSON.stringify({ message: "Auth successfull" }));
    __classPrivateFieldGet(this, _SocketServer_instances, "m", _SocketServer_addMessageHandler).call(this, ws, id);
    console.log(`[+] [Connection] Connection acceped from ${(0, utils_1.getSocketRemoteAddress)(ws)}`);
}, _SocketServer_connectionRefuse = function _SocketServer_connectionRefuse(ws, error) {
    console.log("error");
    ws.send(ws.send((0, RequestError_1.requestError)("auth", error.message, 401)));
    ws.close();
    ws.terminate();
}, _SocketServer_addSocketHeartbit = function _SocketServer_addSocketHeartbit(ws, id) {
    const interval = setInterval(() => {
        const timeout = setTimeout(() => {
            console.log("Connection closed");
            this.connectionPool.removeConnection(id);
            ws.terminate();
            clearInterval(interval);
        }, 3000);
        ws.ping();
        ws.once("pong", () => {
            clearTimeout(timeout);
        });
    }, 5000);
    const handleClose = () => {
        clearInterval(interval);
    };
    ws.addListener("close", handleClose);
}, _SocketServer_addMessageHandler = function _SocketServer_addMessageHandler(ws, id) {
    const connectionPool = this.connectionPool;
    const actions = __classPrivateFieldGet(this, _SocketServer_actions, "f");
    const entityMap = __classPrivateFieldGet(this, _SocketServer_entity, "f");
    ws.addListener("message", (message) => {
        if (message instanceof Buffer) {
            const string = message.toString();
            let request;
            try {
                try {
                    request = JSON.parse(string);
                }
                catch (_a) {
                    throw new Error("Invalid json format!");
                }
                if (typeof request !== "object")
                    throw new Error("Message must be a json object!");
                if (typeof request.action !== "string")
                    throw new Error("Action must be a string!");
                const action = request.action;
                if (action === "subscribe" || action === "unsubscribe") {
                    if (!request.entityID)
                        throw new Error("Request missing the entity props!");
                    if (typeof request.entityID !== "string")
                        throw new Error("Entity props type must be string!");
                    const entityID = request.entityID;
                    const [entity, resuorceId] = entityID.split("$");
                    if (entity === "" || resuorceId === "")
                        throw new Error("Invalid entityID format!");
                    if (!entityMap.has(entity))
                        throw new Error("Not existing entity!");
                    const poolID = request.entityID;
                    if (action === "subscribe") {
                        const factory = entityMap.get(entity);
                        if (!connectionPool.hasPool(poolID)) {
                            connectionPool.addPool(poolID, factory(poolID));
                        }
                        connectionPool.joinPool(poolID, id);
                    }
                    else
                        connectionPool.leavePool(poolID, id);
                }
                else {
                    if (!actions.has(action))
                        throw new Error("Invalid action");
                    const actionHandler = actions.get(action);
                    const connectionPools = connectionPool.getConnectionPools(id);
                    const event = {
                        id,
                        ws,
                        msg: { action, data: request.data ? request.data : {} },
                        pools: connectionPools,
                    };
                    actionHandler(event, connectionPool);
                }
            }
            catch (error) {
                if (error instanceof RequestError_1.default) {
                    ws.send(error.toString());
                }
                else if (error instanceof Error) {
                    ws.send((0, RequestError_1.requestError)("fatal", error.message, 500));
                }
            }
        }
    });
};
