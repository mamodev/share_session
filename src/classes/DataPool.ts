import { WebSocket } from "ws";
import { Pool } from "./Pool";

export type DataPoolUpdater<T> = (data: T) => T;
export default class DataPool<T> extends Pool {
  data: T;
  constructor(id: string, data: T) {
    super(id);
    this.data = data;
  }

  addConnection(id: string, ws: WebSocket): Map<string, WebSocket> {
    ws.send(JSON.stringify({ action: "entity", entityID: this.poolId, data: this.data }));
    return this.connectionMap.set(id, ws);
  }
  updateData(issuerID: string, updater: DataPoolUpdater<T>) {
    this.data = updater(this.data);

    this.send(
      issuerID,
      JSON.stringify({ action: "entity", entityID: this.poolId, data: this.data })
    );
  }
}
