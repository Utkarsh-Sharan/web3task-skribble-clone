import { rooms } from "../utils/constants.js";

function clearRoomTimer(room) {
    if(room.timerInterval) {
        clearInterval(room.timerInterval);
        room.timerInterval = null;
    }
}

export const startNextTurn = (io, roomId) => {
    const room = rooms.get(roomId);
    if(!room || room.players.length === 0) return;

    clearRoomTimer(room);

    if(room.currentDrawerIndex >= room.players.length) {
        room.currentDrawerIndex = 0;
        ++room.currentRound;
    }

    if(room.currentRound > room.totalRounds) {
        room.status = "game_over";
        io.to(roomId).emit("game_state", {status: "game_over"});
        io.to(roomId).emit("system_message", "Game over! Thanks for playing!");
        return;
    }

    const drawer = room.players[room.currentDrawerIndex];
    room.currentWord = "banana";

    io.to(roomId).emit("turn_start", {
        drawerId: drawer.id,
        drawerName: drawer.name,
        round: room.currentRound,
        totalRounds: room.totalRounds,
    });

    io.to(roomId).emit("your_turn", {word: room.currentWord});
    io.to(roomId).emit("system_message", `Round ${room.currentRound}: It's ${drawer.name}'s turn to draw!`);

    room.timeLeft = 60;

    room.timerInterval = setInterval(() => {
        room.timeLeft--;

        io.to(roomId).emit("timer_update", room.timeLeft);

        if(room.timeLeft <= 0) {
            clearRoomTimer(room);

            io.to(roomId).emit("system_message", `Time's up! The word was: ${room.currentWord}`);

            ++room.currentDrawerIndex;
            startNextTurn(io, roomId);
        }
    }, 1000);
}