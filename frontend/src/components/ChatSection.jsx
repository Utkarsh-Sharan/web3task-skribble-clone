import { useEffect, useRef, useState } from "react"

function ChatSection({ socket, roomId, playerName }) {
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState("");
    const chatEndRef = useRef(null);

    const sendMessage = () => {
        if (currentMessage.trim() !== "") {
            socket.emit("send_chat", { roomId, playerName: playerName, text: currentMessage });
            setCurrentMessage("");
        }
    }

    useEffect(() => {
        socket.on("receive_chat", (data) => {
            setMessages((prev) => [...prev, { type: "chat", ...data }]);
        });

        socket.on("system_message", (text) => {
            setMessages((prev) => [...prev, { type: "system", text }]);
        })

        return () => {
            socket.off("receive_chat");
            socket.off("system_message");
        }
    }, [])

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="w-72 bg-white flex flex-col rounded-lg shadow-md border overflow-hidden">
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2 bg-gray-50">
                {messages.map((msg, index) => (
                    <div key={index} className={`text-sm ${msg.type === 'system' ? 'text-green-600 font-bold text-center italic' : 'text-gray-800'}`}>
                        {msg.type === 'chat' && <span className="font-bold">{msg.playerName}: </span>}
                        {msg.text}
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            <article className="flex border-t p-2 bg-white">
                <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Type your guess..."
                    className="flex-1 p-2 outline-none"
                />
                <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">
                    Send
                </button>
            </article>
        </div>
    )
}

export default ChatSection