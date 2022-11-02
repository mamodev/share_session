import { WebSocket } from "ws";
import { Pool } from "./Pool";

export type Connection = { pools: Pool[]; ws: WebSocket };
export class ConnectionPool {
  #defaultPool: Pool;
  #pools: Map<string, Pool>;
  #connections: Map<string, Connection>;

  constructor() {
    this.#defaultPool = new Pool(Pool.DEFAULT_POOL_ID);
    this.#pools = new Map<string, Pool>();
    this.#pools.set(Pool.DEFAULT_POOL_ID, this.#defaultPool);
    this.#connections = new Map<string, Connection>();
  }

  joinPool(poolID: string, connectionID: string): Pool {
    let pool;
    if (this.#pools.has(poolID)) {
      pool = this.#pools.get(poolID) as Pool;
    } else {
      pool = new Pool(poolID);
      this.#pools.set(poolID, pool);
    }

    if (!this.#connections.has(connectionID)) throw new Error("Connection not found");
    const connection = this.#connections.get(connectionID) as Connection;
    pool.addConnection(connectionID, connection.ws);

    connection.pools = [pool, ...connection.pools];

    return pool;
  }

  leavePool(poolID: string, connectionID: string) {
    if (!this.#pools.has(poolID)) throw new Error("Pool not found");
    if (!this.#connections.has(connectionID)) throw new Error("Connection not found");

    const connection = this.#connections.get(connectionID) as Connection;
    connection.pools = connection.pools.filter((pool) => pool.poolId !== poolID);

    const pool = this.#pools.get(poolID) as Pool;
    pool.removeConnection(connectionID);

    if (pool.isEmpty() && !pool.isDefault()) {
      this.#pools.delete(pool.poolId);
    }
  }

  getConnectionPools(id: string) {
    if (!this.#connections.has(id)) throw new Error("Connection not found");
    const connection = this.#connections.get(id) as Connection;
    return connection.pools;
  }

  addConnection(ws: WebSocket, id: string) {
    this.#defaultPool.addConnection(id, ws);
    this.#connections.set(id, { ws, pools: [this.#defaultPool] });
  }

  removeConnection(id: string) {
    if (this.#connections.has(id)) {
      const connection = this.#connections.get(id) as Connection;

      connection.pools.forEach((pool) => {
        pool.removeConnection(id);
        if (pool.isEmpty() && !pool.isDefault()) {
          this.#pools.delete(pool.poolId);
        }
      });

      this.#connections.delete(id);
    }
  }

  hasPool(id: string) {
    return this.#pools.has(id);
  }

  addPool(id: string, pool: Pool) {
    return this.#pools.set(id, pool);
  }

  getPool(id: string): Pool | undefined {
    return this.#pools.get(id);
  }
}
