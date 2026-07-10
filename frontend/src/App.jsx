import { useEffect, useRef } from "react"
import * as fabric from "fabric";
import {io} from "socket.io-client";

const socket = io("http://localhost:3000");

function App() {
  const canvasRef = useRef(null);
  const fabricCanvasInstance = useRef(null);

  useEffect(() => {
    if (fabricCanvasInstance.current) {
      return;
    }

    const canvas = new fabric.Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: 800,
      height: 600,
      backgroundColor: '#f3f4f6'
    });

    const brush = new fabric.PencilBrush(canvas);
    brush.color = '#000000';
    brush.width = 5;
    canvas.freeDrawingBrush = brush;

    fabricCanvasInstance.current = canvas;

    canvas.on('path:created', (e) => {
      const strokeData = e.path.toJSON();
      socket.emit('draw_data', strokeData);
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
  }, []);
  

  return (
    <section className="flex justify-center mt-5">
      <div className="border-2 border-black">
        <canvas ref={canvasRef} />
      </div>
    </section>
  )
}

export default App
