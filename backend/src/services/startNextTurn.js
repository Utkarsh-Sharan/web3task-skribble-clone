import { getRandomWords, rooms } from "../utils/constants.js";

export const clearRoomTimer = (room) => {
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
        const highScorePlayer = room.players.reduce((max, player) => 
            player.score > max.score ? player : max
        );

        room.status = "game_over";
        io.to(roomId).emit("game_state", {status: "game_over", winner: highScorePlayer.name});
        io.to(roomId).emit("system_message", "Game over! Thanks for playing!");
        return;
    }

    const drawer = room.players[room.currentDrawerIndex];

    room.status = "choosing";
    room.currentWord = "";

    io.to(roomId).emit("turn_start", {
        drawerId: drawer.id,
        drawerName: drawer.name,
        round: room.currentRound,
        totalRounds: room.totalRounds,
        status: "choosing",
    });

    const choices = getRandomWords(3);
    io.to(drawer.id).emit("choose_word", choices);
    io.to(roomId).emit("system_message", `Waiting for ${drawer.name} to choose a word...`);
}