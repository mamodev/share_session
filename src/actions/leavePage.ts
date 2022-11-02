import { PageData } from "../app";
import { ConnectionPool } from "../classes/ConnectionPool";
import DataPool from "../classes/DataPool";
import RequestError from "../classes/RequestError";
import { ActionEvent, ActionHandler, Message } from "../classes/Server";

export default function leavePage(event: ActionEvent, connectionPool: ConnectionPool) {
  const page = event.msg.data.url;
  if (!page) throw new RequestError("leavePage", "Invalid data format");

  if (!connectionPool.hasPool(`page$${page}`))
    throw new RequestError("leavePage", "The entity doesnt't exist");

  const pagePool = connectionPool.getPool(`page$${page}`) as DataPool<PageData>;

  pagePool.updateData(event.id, (data) => {
    return { users: data.users.filter((user) => user !== event.id) };
  });
}
