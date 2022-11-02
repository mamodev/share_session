import { RawData, WebSocket } from "ws";
import { getSocketRemoteAddress } from "../utils";
import { TokenValidator } from "./TokenValidator";

export type ConnectionAcceptHandler = (ws: WebSocket, id: string) => void;
export type ConnectionRefuseHandler = (ws: WebSocket, error: Error) => void;

export default class Authenticator {
  #token_validator: TokenValidator;
  #connectionAcceptHandler: ConnectionAcceptHandler;
  #connectionRefuseHandler: ConnectionRefuseHandler;

  constructor(
    tokenValidator: TokenValidator,
    connectionAcceptHandler: ConnectionAcceptHandler,
    connectionRefuseHandler: ConnectionRefuseHandler
  ) {
    this.#token_validator = tokenValidator;
    this.#connectionAcceptHandler = connectionAcceptHandler;
    this.#connectionRefuseHandler = connectionRefuseHandler;
  }

  handleConnection(ws: WebSocket) {
    console.log(`[?] Connection from ${getSocketRemoteAddress(ws)}`);
    const authTimeout = setTimeout(() => {
      ws.terminate();
    }, 1000);

    const tokenValidator = this.#token_validator;

    const messageHandler = (data: RawData) => {
      try {
        if (!(data instanceof Buffer)) throw new Error("Invalid data stream format");
        const decoded = data.toString();

        const connectionId = tokenValidator.validate(decoded);
        if (!connectionId) throw new Error("Invalid token");

        // const connectionId = this.#connection_pool.addConnection(ws);
        // this.#addMessageHandler(ws, decoded);

        this.#connectionAcceptHandler(ws, connectionId);
        clearTimeout(authTimeout);
      } catch (error) {
        const err = error as Error;
        this.#connectionRefuseHandler(ws, err);
      }

      ws.removeListener("message", messageHandler);
    };

    ws.addListener("message", messageHandler);
  }
}
