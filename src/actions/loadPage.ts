import { WebSocket } from "ws";
import { PageData } from "../app";
import { ConnectionPool } from "../classes/ConnectionPool";
import DataPool from "../classes/DataPool";
import RequestError, { requestError } from "../classes/RequestError";
import { ActionEvent, Message } from "../classes/Server";

export default function loadPage(event: ActionEvent, connectionPool: ConnectionPool) {
  const page = event.msg.data.url;
  if (!page) throw new RequestError("loadPage", "Invalid data format");

  if (!connectionPool.hasPool(`page$${page}`))
    throw new RequestError("loadPage", "The entity doesnt't exist");

  const pagePool = connectionPool.getPool(`page$${page}`) as DataPool<PageData>;

  pagePool.updateData(event.id, (data) => {
    if (data.users.some((user) => user === event.id)) return data;
    return { users: [...data.users, event.id] };
  });
}
