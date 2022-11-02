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
var _ConnectionPool_defaultPool, _ConnectionPool_pools, _ConnectionPool_connections;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionPool = void 0;
const Pool_1 = require("./Pool");
class ConnectionPool {
    constructor() {
        _ConnectionPool_defaultPool.set(this, void 0);
        _ConnectionPool_pools.set(this, void 0);
        _ConnectionPool_connections.set(this, void 0);
        __classPrivateFieldSet(this, _ConnectionPool_defaultPool, new Pool_1.Pool(Pool_1.Pool.DEFAULT_POOL_ID), "f");
        __classPrivateFieldSet(this, _ConnectionPool_pools, new Map(), "f");
        __classPrivateFieldGet(this, _ConnectionPool_pools, "f").set(Pool_1.Pool.DEFAULT_POOL_ID, __classPrivateFieldGet(this, _ConnectionPool_defaultPool, "f"));
        __classPrivateFieldSet(this, _ConnectionPool_connections, new Map(), "f");
    }
    joinPool(poolID, connectionID) {
        let pool;
        if (__classPrivateFieldGet(this, _ConnectionPool_pools, "f").has(poolID)) {
            pool = __classPrivateFieldGet(this, _ConnectionPool_pools, "f").get(poolID);
        }
        else {
            pool = new Pool_1.Pool(poolID);
            __classPrivateFieldGet(this, _ConnectionPool_pools, "f").set(poolID, pool);
        }
        if (!__classPrivateFieldGet(this, _ConnectionPool_connections, "f").has(connectionID))
            throw new Error("Connection not found");
        const connection = __classPrivateFieldGet(this, _ConnectionPool_connections, "f").get(connectionID);
        pool.addConnection(connectionID, connection.ws);
        connection.pools = [pool, ...connection.pools];
        return pool;
    }
    leavePool(poolID, connectionID) {
        if (!__classPrivateFieldGet(this, _ConnectionPool_pools, "f").has(poolID))
            throw new Error("Pool not found");
        if (!__classPrivateFieldGet(this, _ConnectionPool_connections, "f").has(connectionID))
            throw new Error("Connection not found");
        const connection = __classPrivateFieldGet(this, _ConnectionPool_connections, "f").get(connectionID);
        connection.pools = connection.pools.filter((pool) => pool.poolId !== poolID);
        const pool = __classPrivateFieldGet(this, _ConnectionPool_pools, "f").get(poolID);
        pool.removeConnection(connectionID);
        if (pool.isEmpty() && !pool.isDefault()) {
            __classPrivateFieldGet(this, _ConnectionPool_pools, "f").delete(pool.poolId);
        }
    }
    getConnectionPools(id) {
        if (!__classPrivateFieldGet(this, _ConnectionPool_connections, "f").has(id))
            throw new Error("Connection not found");
        const connection = __classPrivateFieldGet(this, _ConnectionPool_connections, "f").get(id);
        return connection.pools;
    }
    addConnection(ws, id) {
        __classPrivateFieldGet(this, _ConnectionPool_defaultPool, "f").addConnection(id, ws);
        __classPrivateFieldGet(this, _ConnectionPool_connections, "f").set(id, { ws, pools: [__classPrivateFieldGet(this, _ConnectionPool_defaultPool, "f")] });
    }
    removeConnection(id) {
        if (__classPrivateFieldGet(this, _ConnectionPool_connections, "f").has(id)) {
            const connection = __classPrivateFieldGet(this, _ConnectionPool_connections, "f").get(id);
            connection.pools.forEach((pool) => {
                pool.removeConnection(id);
                if (pool.isEmpty() && !pool.isDefault()) {
                    __classPrivateFieldGet(this, _ConnectionPool_pools, "f").delete(pool.poolId);
                }
            });
            __classPrivateFieldGet(this, _ConnectionPool_connections, "f").delete(id);
        }
    }
    hasPool(id) {
        return __classPrivateFieldGet(this, _ConnectionPool_pools, "f").has(id);
    }
    addPool(id, pool) {
        return __classPrivateFieldGet(this, _ConnectionPool_pools, "f").set(id, pool);
    }
    getPool(id) {
        return __classPrivateFieldGet(this, _ConnectionPool_pools, "f").get(id);
    }
}
exports.ConnectionPool = ConnectionPool;
_ConnectionPool_defaultPool = new WeakMap(), _ConnectionPool_pools = new WeakMap(), _ConnectionPool_connections = new WeakMap();
