import { useState, useEffect } from "react";
import { useGameStore } from "../store/useGameStore.js";

function GameHeader({ roomId, socket, fabricCanvasInstance, setInRoom }) {
    const [players, setPlayers] = useState([]);
    const [isHost, setIsHost] = useState(false);
    const [secretWord, setSecretWord] = useState("");
    const [roundInfo, setRoundInfo] = useState({ current: 0, total: 0 });
    const [timeLeft, setTimeLeft] = useState(0);
    const [winner, setWinner] = useState("");
    const {
        currentDrawer, setCurrentDrawer, gameState, setGameState, wordChoices, setWordChoices
    } = useGameStore();

    const handleStart = () => socket.emit("start_game", roomId);

    const backToMenu = () => {
        window.location.reload(true);
    }

    useEffect(() => {
        socket.on("game_state", (data) => {
            setGameState(data.status);
            setWinner(data.winner);
            if (data.isHost) setIsHost(data.isHost);
        })

        socket.on("turn_start", (data) => {
            setGameState(data.status);
            setCurrentDrawer(data.drawerId);
            setRoundInfo({ current: data.round, total: data.totalRounds });
            setSecretWord("");

            if (fabricCanvasInstance.current) {
                fabricCanvasInstance.current.clear();
                fabricCanvasInstance.current.backGroundColor = "#ffffff";
                fabricCanvasInstance.current.renderAll();
            }
        });

        socket.on("choose_word", (choices) => setWordChoices(choices));
        socket.on("your_turn", (data) => setSecretWord(data.word));
        socket.on("timer_update", (time) => setTimeLeft(time));

        return () => {
            socket.off("choose_word");
            socket.off("timer_update");
            socket.off("game_state");
            socket.off("turn_start");
            socket.off("your_turn");
        }
    }, []);

    return (
        <section className="flex justify-between items-center w-full max-w-6xl bg-white p-4 rounded-xl shadow-md">
            <article>
                <h2 className="text-xl font-bold text-gray-700">Room: {roomId}</h2>

                {(gameState === "playing" || gameState === "choosing") &&
                    <p className="text-sm font-semibold text-gray-500">Round {roundInfo.current} / {roundInfo.total}</p>}
            </article>

            {gameState === "playing" && (
                <div className={`text-3xl font-black ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
                    ⏱ {timeLeft}s
                </div>
            )}

            {gameState === "waiting" && isHost && (
                <button onClick={handleStart} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow-md transition">
                    Start Game
                </button>
            )}

            {gameState === "waiting" && !isHost && (
                <span className="text-gray-500 font-medium animate-pulse">Waiting for host to start...</span>
            )}

            {(gameState === "choosing" || gameState === "playing") && (
                <div className="text-center w-64">
                    {gameState === 'choosing' && socket.id === currentDrawer && (
                        <p className="text-lg font-bold text-orange-600 animate-pulse">Choose a word!</p>
                    )}
                    {gameState === 'choosing' && socket.id !== currentDrawer && (
                        <p className="text-lg font-bold text-gray-600">Drawer is picking a word...</p>
                    )}
                    {gameState === 'playing' && socket.id === currentDrawer && (
                        <p className="text-xl font-black text-blue-600 tracking-widest uppercase">{secretWord}</p>
                    )}
                    {gameState === 'playing' && socket.id !== currentDrawer && (
                        <p className="text-lg font-bold text-gray-600">Guess the word!</p>
                    )}
                </div>
            )}

            {gameState === 'game_over' && (
                <>
                    <p className="text-lg font-bold text-orange-600 animate-pulse">{winner} is the winner!</p>
                    <button onClick={backToMenu} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow-md transition">
                        Back to menu
                    </button>
                </>
            )}
        </section>
    )
}

export default GameHeader