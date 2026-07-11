import { useState, useEffect, useRef } from "react"
import * as fabric from "fabric";
import {io} from "socket.io-client";
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
  
  const {currentDrawer} = useGameStore();
  
  const joinRoom = () => {
    if(roomId !== "" && playerName !== "") {
      socket.emit("join_room", {roomId, playerName});
      setInRoom(true);
    }
  }
  
  useEffect(() => {
    socket.on("update_players", (updatedPlayerList) => setPlayers(updatedPlayerList));
    
    return () => {
      socket.off("update_players");
    }
  }, []);
  
  useEffect(() => {
    if(fabricCanvasInstance.current)
      fabricCanvasInstance.current.isDrawingMode = socket.id === currentDrawer;
  }, [currentDrawer]);
  
  useCanvas({inRoom, roomId, fabricCanvasInstance, canvasRef, socket});
  
  if(!inRoom) 
    return <LandingPage joinRoom={joinRoom} setRoomId={setRoomId} setPlayerName={setPlayerName} totalRounds={totalRounds} setTotalRounds={setTotalRounds} />

  return (
    <section className="flex flex-col h-screen items-center justify-center bg-gray-100 gap-4 p-4">
      <GameHeader roomId={roomId} socket={socket} fabricCanvasInstance={fabricCanvasInstance} />
      
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

        <div className="border-4 border-gray-300 shadow-xl rounded-lg overflow-hidden bg-white flex-1">
          <canvas ref={canvasRef} />
        </div>

        <ChatSection socket={socket} roomId={roomId} playerName={playerName} />
      </div>
    </section>
  )
}

export default App
