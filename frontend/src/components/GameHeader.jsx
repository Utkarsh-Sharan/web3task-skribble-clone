import { useState, useEffect } from "react";
import { useGameStore } from "../store/useGameStore.js";

function GameHeader({roomId, socket, fabricCanvasInstance}) {
  const [players, setPlayers] = useState([]); 
  const [gameState, setGameState] = useState('waiting');
  const [isHost, setIsHost] = useState(false);
  const [secretWord, setSecretWord] = useState("");
  const [roundInfo, setRoundInfo] = useState({ current: 0, total: 0 });
  const {currentDrawer, setCurrentDrawer} = useGameStore();

  const handleStart = () => socket.emit("start_game", roomId);

  useEffect(() => {
    socket.on("game_state", (data) => {
        setGameState(data.status);
        if(data.isHost) setIsHost(data.isHost);
    })

    socket.on("turn_start", (data) => {
        setCurrentDrawer(data.drawerId);
        setRoundInfo({current: data.round, total: data.totalRounds});
        setSecretWord("");

        if(fabricCanvasInstance.current) {
            fabricCanvasInstance.current.clear();
            fabricCanvasInstance.current.backGroundColor = "#ffffff";
            fabricCanvasInstance.current.renderAll();
        }
    });

    socket.on("your_turn", (data) => setSecretWord(data.word));
  
    return () => {
      socket.off("game_state");
      socket.off("turn_start");
      socket.off("your_turn");
    }
  }, []);
  

  return (
    <section className="flex justify-between items-center w-full max-w-6xl bg-white p-4 rounded-xl shadow-md">
        <article>
            <h2 className="text-xl font-bold text-gray-700">Room: {roomId}</h2>

            {gameState === "playing" && 
            <p className="text-sm font-semibold text-gray-500">Round {roundInfo.current} / {roundInfo.total}</p>}
        </article>

        {gameState === "waiting" && isHost && (
            <button onClick={handleStart} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow-md transition">
                Start Game
            </button>
        )}

        {gameState === "waiting" && !isHost && (
            <span className="text-gray-500 font-medium animate-pulse">Waiting for host to start...</span>
        )}

        {gameState === "playing" && (
            <div className="text-center">
                {socket.id === currentDrawer ?
                <p className="text-xl font-black text-blue-600 tracking-widest uppercase">DRAW: {secretWord}</p> :
                <p className="text-lg font-bold text-gray-600">Guess the word!</p>}
            </div>
        )}
    </section>
  )
}

export default GameHeader