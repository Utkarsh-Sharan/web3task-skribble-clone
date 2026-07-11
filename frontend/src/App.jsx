import { useState, useEffect, useRef } from "react"
import * as fabric from "fabric";
import { io } from "socket.io-client";
import LandingPage from "./pages/LandingPage.jsx";
import ChatSection from "./components/ChatSection.jsx";
import GameHeader from "./components/GameHeader.jsx";
import { useGameStore } from "./store/useGameStore.js";
import useCanvas from "./hooks/useCanvas.jsx";

const socket = io("http://localhost:3000");

function App() {
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const [players, setPlayers] = useState([]);
  const [totalRounds, setTotalRounds] = useState(3);

  const canvasRef = useRef(null);
  const fabricCanvasInstance = useRef(null);

  const { currentDrawer, gameState, wordChoices, setWordChoices } = useGameStore();

  const joinRoom = () => {
    if (roomId !== "" && playerName !== "") {
      socket.emit("join_room", { roomId, playerName });
      setInRoom(true);
    }
  }

  const selectWord = (word) => {
    socket.emit("word_chosen", { roomId, word });
    setWordChoices([]);
  }

  useEffect(() => {
    socket.on("update_players", (updatedPlayerList) => setPlayers(updatedPlayerList));

    return () => {
      socket.off("update_players");
    }
  }, []);

  useEffect(() => {
    if (fabricCanvasInstance.current)
      fabricCanvasInstance.current.isDrawingMode = (socket.id === currentDrawer && gameState === "playing");
  }, [currentDrawer, gameState]);

  useCanvas({ inRoom, roomId, fabricCanvasInstance, canvasRef, socket });

  if (!inRoom)
    return <LandingPage joinRoom={joinRoom} setRoomId={setRoomId} setPlayerName={setPlayerName} totalRounds={totalRounds} setTotalRounds={setTotalRounds} />

  return (
    <section className="flex flex-col h-screen items-center justify-center bg-gray-100 gap-4 p-4">
      <GameHeader 
        roomId={roomId} 
        socket={socket} 
        fabricCanvasInstance={fabricCanvasInstance}
        setInRoom={setInRoom}
      />

      <div className="flex w-full max-w-5xl gap-4">

        <div className="w-64 bg-white p-4 rounded-lg shadow-md flex flex-col">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Players</h3>
          <ul className="flex flex-col gap-2">
            {players.length > 0 && players.map((player) => (
              <li key={player.id} className={`flex justify-between items-center p-2 rounded border ${player.id === currentDrawer ? 'bg-yellow-100 border-yellow-400' : 'bg-gray-50'}`}>
                <span className="font-medium">
                  {player.name} {player.id === socket.id ? "(You)" : ""} {player.id === currentDrawer && "✏️"}
                </span>
                <span className="text-sm font-bold text-blue-600">{player.score}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`relative border-4 shadow-xl rounded-lg overflow-hidden bg-white flex-1 ${socket.id === currentDrawer ? 'border-blue-400' : 'border-gray-300'}`}>
          <canvas ref={canvasRef} />

          {gameState === 'choosing' && socket.id === currentDrawer && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
              <h2 className="text-3xl font-black text-gray-800">Pick a Word</h2>
              <div className="flex gap-4">
                {wordChoices.map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectWord(word)}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xl font-bold py-3 px-6 rounded-lg shadow-lg transition transform hover:scale-105"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameState === 'choosing' && socket.id !== currentDrawer && (
            <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm flex items-center justify-center">
              <h2 className="text-2xl font-bold text-gray-600 animate-pulse">Waiting for drawer to choose...</h2>
            </div>
          )}
        </div>

        <ChatSection socket={socket} roomId={roomId} playerName={playerName} />
      </div>
    </section>
  )
}

export default App
