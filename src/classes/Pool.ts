import { WebSocket } from "ws";

export type PoolData = { [key: string]: string };

export class Pool {
  static DEFAULT_POOL_ID = "default";
  poolId: string;
  connectionMap: Map<string, WebSocket>;

  constructor(id: string) {
    this.poolId = id;
    this.connectionMap = new Map<string, WebSocket>();
  }

  addConnection(id: string, ws: WebSocket) {
    return this.connectionMap.set(id, ws);
  }
  hasConnecion(id: string) {
    return this.connectionMap.has(id);
  }
  removeConnection(id: string) {
    return this.connectionMap.delete(id);
  }

  isEmpty() {
    return this.connectionMap.size === 0;
  }

  send(senderId: string, message: string) {
    this.connectionMap.forEach((ws, id) => {
      if (id !== senderId) ws.send(message);
    });
  }

  isDefault(): boolean {
    return this.poolId === Pool.DEFAULT_POOL_ID;
  }
}
