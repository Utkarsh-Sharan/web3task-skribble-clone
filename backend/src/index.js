import dotenv from "dotenv";
dotenv.config({
    path: "./.env",
});

import server from "./app.js";

const port = process.env.PORT;

server.listen(port, () => {
    console.log(`Websocket server listening on port: ${port}`);
});