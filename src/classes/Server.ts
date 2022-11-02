import { IncomingMessage, Server, ServerResponse } from "http";
import { Server as HttpsServer } from "https";
import { EventEmitter } from "stream";
import { RawData, WebSocket, WebSocketServer } from "ws";
import { generateEntityPoolId, getSocketRemoteAddress } from "../utils";
import Authenticator, { ConnectionAcceptHandler } from "./Authenticator";
import { ConnectionPool } from "./ConnectionPool";
import { Pool } from "./Pool";
import RequestError, { requestError } from "./RequestError";
import { TokenValidator } from "./TokenValidator";

export type HttpServer =
  | Server<typeof IncomingMessage, typeof ServerResponse>
  | HttpsServer<typeof IncomingMessage, typeof ServerResponse>;

export type Message = { action: string; data: { [key: string]: any } };

export type ActionEvent = {
  id: string;
  ws: WebSocket;
  msg: Message;
  pools: Pool[];
};

export type ActionHandler = (event: ActionEvent, connectionPool: ConnectionPool) => void;

export type EntityFactory = (id: string) => Pool;

export class SocketServer {
  #ws_server: WebSocketServer;
  connectionPool: ConnectionPool;
  #actions: Map<string, ActionHandler>;
  #entity: Map<string, EntityFactory>;

  constructor(httpServer: HttpServer, tokenValidator: TokenValidator) {
    this.#ws_server = new WebSocketServer({ server: httpServer });

    const authenticator = new Authenticator(
      tokenValidator,
      (ws, id) => this.#connectionAccept(ws, id),
      (ws, error) => this.#connectionRefuse(ws, error)
    );

    this.#actions = new Map<string, ActionHandler>();
    this.#entity = new Map<string, EntityFactory>();

    this.#ws_server.addListener("connection", (ws) => authenticator.handleConnection(ws));
    this.connectionPool = new ConnectionPool();
  }

  action(name: string, handler: ActionHandler) {
    this.#actions.set(name, handler);
  }

  entity(name: string, entityFactory: EntityFactory) {
    this.#entity.set(name, entityFactory);
  }

  #connectionAccept(ws: WebSocket, id: string) {
    this.connectionPool.addConnection(ws, id);
    this.#addSocketHeartbit(ws, id);

    ws.send(JSON.stringify({ message: "Auth successfull" }));
    this.#addMessageHandler(ws, id);

    console.log(`[+] [Connection] Connection acceped from ${getSocketRemoteAddress(ws)}`);
  }

  #connectionRefuse(ws: WebSocket, error: Error) {
    console.log("error");
    ws.send(ws.send(requestError("auth", error.message, 401)));
    ws.close();
    ws.terminate();
  }

  #addSocketHeartbit(ws: WebSocket, id: string) {
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
  }

  #addMessageHandler(ws: WebSocket, id: string) {
    const connectionPool = this.connectionPool;
    const actions = this.#actions;
    const entityMap = this.#entity;

    ws.addListener("message", (message: RawData) => {
      if (message instanceof Buffer) {
        const string = message.toString();
        let request: any;
        try {
          try {
            request = JSON.parse(string);
          } catch {
            throw new Error("Invalid json format!");
          }
          if (typeof request !== "object") throw new Error("Message must be a json object!");
          if (typeof request.action !== "string") throw new Error("Action must be a string!");

          const action = request.action;

          if (action === "subscribe" || action === "unsubscribe") {
            if (!request.entityID) throw new Error("Request missing the entity props!");
            if (typeof request.entityID !== "string")
              throw new Error("Entity props type must be string!");

            const entityID = request.entityID as string;
            const [entity, resuorceId] = entityID.split("$");
            if (entity === "" || resuorceId === "") throw new Error("Invalid entityID format!");

            if (!entityMap.has(entity)) throw new Error("Not existing entity!");
            const poolID = request.entityID;

            if (action === "subscribe") {
              const factory = entityMap.get(entity) as EntityFactory;

              if (!connectionPool.hasPool(poolID)) {
                connectionPool.addPool(poolID, factory(poolID));
              }

              connectionPool.joinPool(poolID, id);
            } else connectionPool.leavePool(poolID, id);
          } else {
            if (!actions.has(action)) throw new Error("Invalid action");
            const actionHandler = actions.get(action) as ActionHandler;
            const connectionPools = connectionPool.getConnectionPools(id);
            const event = {
              id,
              ws,
              msg: { action, data: request.data ? request.data : {} },
              pools: connectionPools,
            };

            actionHandler(event, connectionPool);
          }
        } catch (error) {
          if (error instanceof RequestError) {
            ws.send(error.toString());
          } else if (error instanceof Error) {
            ws.send(requestError("fatal", error.message, 500));
          }
        }
      }
    });
  }
}
