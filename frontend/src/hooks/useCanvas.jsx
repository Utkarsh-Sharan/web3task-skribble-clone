import * as fabric from "fabric";
import { useEffect } from "react";

function useCanvas({ inRoom, roomId, fabricCanvasInstance, canvasRef, socket }) {
    useEffect(() => {
        if (!inRoom) return;
        if (fabricCanvasInstance.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            isDrawingMode: false,
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
}

export default useCanvas;