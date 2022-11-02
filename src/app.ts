import { createServer } from "http";
import leavePage from "./actions/leavePage";
import loadPage from "./actions/loadPage";
import DataPool from "./classes/DataPool";
import { Pool } from "./classes/Pool";
import { SocketServer } from "./classes/Server";
import { TokenValidator } from "./classes/TokenValidator";
import test from "./test";

// const httpsServer = createServer({
//   cert: readFileSync("cert/cert.pem"),
//   key: readFileSync("cert/key.pem"),
// });

const tokenValidator = new TokenValidator("123a567w901a34567a90x2j4567j90w2", (token) => {
  if (typeof token !== "string") {
    return token.utente;
  }
  return null;
});

const httpServer = createServer();
const server = new SocketServer(httpServer, tokenValidator);

server.action("loadPage", loadPage);
server.action("leavePage", leavePage);

export type PageData = { users: string[] };

server.entity("page", (id) => {
  return new DataPool<PageData>(id, { users: [] });
});

httpServer.listen(8080);

// test();
