"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Pool_1 = require("./Pool");
class DataPool extends Pool_1.Pool {
    constructor(id, data) {
        super(id);
        this.data = data;
    }
    addConnection(id, ws) {
        ws.send(JSON.stringify({ action: "entity", entityID: this.poolId, data: this.data }));
        return this.connectionMap.set(id, ws);
    }
    updateData(issuerID, updater) {
        this.data = updater(this.data);
        this.send(issuerID, JSON.stringify({ action: "entity", entityID: this.poolId, data: this.data }));
    }
}
exports.default = DataPool;
