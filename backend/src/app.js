import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import {Server} from "socket.io";
import cors from "cors";
import {rooms} from "./utils/constants.js";
import { startNextTurn } from "./services/startNextTurn.js";

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

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join_room", ({roomId, playerName, totalRounds}) => {
        socket.join(roomId);

        if(!rooms.has(roomId)) rooms.set(roomId, {
            players: [], 
            currentWord: "",
            status: "waiting",
            totalRounds: parseInt(totalRounds) || 3,
            currentRound: 1,
            currentDrawerIndex: 0,
            hostId: socket.id,
        });

        const room = rooms.get(roomId);
        const newPlayer = {id: socket.id, name: playerName, score: 0};
        room.players.push(newPlayer);

        socket.emit("game_state", {
            status: room.status,
            isHost: room.hostId === socket.id,
        });

        io.to(roomId).emit("update_players", room.players);
        io.to(roomId).emit("system_message", `${playerName} joined the room!`);
    });

    socket.on("start_game", (roomId) => {
        const room = rooms.get(roomId);

        if(room && room.hostId === socket.id && room.status === "waiting") {
            room.status = "playing";
            io.to(roomId).emit("game_state", {status: "playing"});
            startNextTurn(io, roomId);
        }
    })

    socket.on("draw_data", ({roomId, strokeData}) => {
        socket.to(roomId).emit("draw_data", strokeData);
    });

    socket.on("send_chat", ({roomId, playerName, text}) => {
        const room = rooms.get(roomId);
        if(!room) return;

        if(text.toLowerCase() === room.currentWord.toLowerCase()) {
            io.to(roomId).emit("system_message", `${playerName} guessed the word!`);

            const player = room.players.find(p => p.id === socket.id);
            if(player)
                player.score += 10;

            startNextTurn(io, roomId);
        }
        io.to(roomId).emit("update_players", room.players);
        io.to(roomId).emit("receive_chat", {playerName, text});
    })

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);

        rooms.forEach((room, roomId) => {
            const playerIndex = room.players.findIndex(p => p.id === socket.id);

            if(playerIndex !== -1) {
                const playerName = room.players[playerIndex].name;
                room.players.splice(playerIndex, 1);

                io.to(roomId).emit("update_players", room.players);
                io.to(roomId).emit("system_message", `${playerName} left the room!`);

                if(room.players.length === 0)
                    rooms.delete(roomId);
            }
        })
    });
});

export default server;