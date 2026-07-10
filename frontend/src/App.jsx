import { useState, useEffect, useRef } from "react"
import * as fabric from "fabric";
import {io} from "socket.io-client";
import LandingPage from "./pages/LandingPage.jsx";

const socket = io("http://localhost:3000");

function App() {
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const [players, setPlayers] = useState([]);

  const canvasRef = useRef(null);
  const fabricCanvasInstance = useRef(null);

  const joinRoom = () => {
    if(roomId !== "" && playerName !== "") {
      socket.emit("join_room", {roomId, playerName});
      setInRoom(true);
    }
  }

  useEffect(() => {
    const handleUpdatedPlayers = (updatedPlayerList) => {
      setPlayers(updatedPlayerList);
    }

    socket.on("update_players", handleUpdatedPlayers);
  
    return () => {
      socket.off("update_players", handleUpdatedPlayers);
    }
  }, []);
  

  useEffect(() => {
    if (!inRoom) return;
    if (fabricCanvasInstance.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: 800,
      height: 600,
      backgroundColor: '#ffffff'
    });

    const brush = new fabric.PencilBrush(canvas);
    brush.color = '#000000';
    brush.width = 5;
    canvas.freeDrawingBrush = brush;

    fabricCanvasInstance.current = canvas;

    canvas.on('path:created', (e) => {
      const strokeData = e.path.toJSON();
      socket.emit('draw_data', { roomId, strokeData });
    });

    const handleIncomingDraw = (strokeData) => {
      if (fabricCanvasInstance.current) {
        fabric.Path.fromObject(strokeData).then((path) => {
          path.set({ selectable: false }); 
          fabricCanvasInstance.current.add(path);
          fabricCanvasInstance.current.renderAll();
        });
      }
    };

    socket.on('draw_data', handleIncomingDraw);

    return () => {
      socket.off('draw_data', handleIncomingDraw);
      if (fabricCanvasInstance.current) {
        fabricCanvasInstance.current.dispose();
        fabricCanvasInstance.current = null;
      }
    };
  }, [inRoom, roomId]);
  
  if(!inRoom) 
    return <LandingPage joinRoom={joinRoom} setRoomId={setRoomId} setPlayerName={setPlayerName} />

  return (
    <section className="flex flex-col h-screen items-center justify-center bg-gray-100 gap-4 p-4">
      <div className="flex justify-between w-full max-w-5xl bg-white p-4 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-gray-700">Room: {roomId}</h2>
        <span className="text-sm bg-green-100 text-green-700 py-1 px-3 rounded-full font-medium">Connected as {playerName}</span>
      </div>
      
      <div className="flex w-full max-w-5xl gap-4">
        
        <div className="w-64 bg-white p-4 rounded-lg shadow-md flex flex-col">
          <h3 className="font-bold text-lg mb-4 border-b pb-2">Players</h3>
          <ul className="flex flex-col gap-2">
            {players.length > 0 && players.map((player) => (
              <li key={player.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border">
                <span className="font-medium">{player.name} {player.id === socket.id ? "(You)" : ""}</span>
                <span className="text-sm font-bold text-blue-600">{player.score}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-4 border-gray-300 shadow-xl rounded-lg overflow-hidden bg-white flex-1">
          <canvas ref={canvasRef} />
        </div>

      </div>
    </section>
  )
}

export default App
