"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pool = void 0;
class Pool {
    constructor(id) {
        this.poolId = id;
        this.connectionMap = new Map();
    }
    addConnection(id, ws) {
        return this.connectionMap.set(id, ws);
    }
    hasConnecion(id) {
        return this.connectionMap.has(id);
    }
    removeConnection(id) {
        return this.connectionMap.delete(id);
    }
    isEmpty() {
        return this.connectionMap.size === 0;
    }
    send(senderId, message) {
        this.connectionMap.forEach((ws, id) => {
            if (id !== senderId)
                ws.send(message);
        });
    }
    isDefault() {
        return this.poolId === Pool.DEFAULT_POOL_ID;
    }
}
exports.Pool = Pool;
Pool.DEFAULT_POOL_ID = "default";
