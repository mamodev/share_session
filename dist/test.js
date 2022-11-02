"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
function test() {
    // // const ws2 = new WebSocket("wss://localhost:8080", { rejectUnauthorized: false });
    const ws = new ws_1.WebSocket("ws://localhost:8080");
    const ws2 = new ws_1.WebSocket("ws://localhost:8080");
    ws.on("open", () => {
        ws.send("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dGVudGUiOiJhZG1pbiIsInNlZGVfc2Vzc2lvbmUiOiJNT04iLCJyb2xlIjoiY29tbW9uX3VzZXIiLCJleHAiOjE2NjcyNjE2ODl9.jZQLTbPjV73QSAyGyWF7b388xbFgOT2bKBMQg6NMCis");
    });
    ws.once("message", () => {
        ws.send(JSON.stringify({ action: "subscribe", entityID: "page$/home" }));
    });
    ws.on("message", (data) => {
        console.log(`[admin] ${data.toString()}`);
    });
    ws.on("close", () => {
        console.log("connection closed 1");
    });
    ws2.once("message", (data) => {
        setTimeout(() => {
            ws2.send(JSON.stringify({ action: "loadPage", data: { url: "/home" } }));
            setTimeout(() => ws2.send(JSON.stringify({ action: "leavePage", data: { url: "/home" } })));
        }, 1000);
    });
    ws2.on("open", () => {
        ws2.send("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dGVudGUiOiJndmVyZGkiLCJzZWRlX3Nlc3Npb25lIjoiMDEiLCJyb2xlIjoiY29tbW9uX3VzZXIiLCJleHAiOjE2NjcyNjQyNzd9.DQlsyTOjnXaIIS56E21OKonj5ZktFb__A0XUEPUXiuU");
    });
    ws2.on("message", (data) => {
        console.log(`[gverdi] ${data.toString()}`);
    });
    ws2.on("close", () => {
        console.log("connection closed 2");
    });
}
exports.default = test;
