import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import {Server} from "socket.io";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
)
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ["GET", "POST"],
    }
});

const rooms = new Map();

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join_room", ({roomId, playerName}) => {
        socket.join(roomId);

        if(!rooms.has(roomId)) rooms.set(roomId, {players: []});

        const room = rooms.get(roomId);

        const newPlayer = {id: socket.id, name: playerName, score: 0};
        room.players.push(newPlayer);

        console.log(`${playerName} joined room: ${roomId}`);

        io.to(roomId).emit("update_players", room.players);
    })

    socket.on("draw_data", ({roomId, strokeData}) => {
        socket.to(roomId).emit("draw_data", strokeData);
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);

        rooms.forEach((room, roomId) => {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);

            if(playerIndex !== -1) {
                room.players.splice(playerIndex, 1);

                io.to(roomId).emit("update_players", room.players);

                if(room.players.length === 0)
                    rooms.delete(roomId);
            }
        })
    });
});

export default server;