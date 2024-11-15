"use client";

import { useState, useEffect, useRef } from "react";

export default function Agent() {
  const [messages, setMessages] = useState<
    Array<{ type: string; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    wsRef.current = new WebSocket("ws://localhost:8000/ws");
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };
    return () => wsRef.current?.close();
  }, []);

  const sendMessage = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN && input.trim()) {
      wsRef.current.send(JSON.stringify({ message: input }));
      setInput("");
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          className="mr-2 p-2 border"
          placeholder="Ask the agent..."
        />
        <button
          onClick={sendMessage}
          className="p-2 bg-blue-500 text-white rounded"
        >
          Send
        </button>
      </div>

      <div className="space-y-2">
        {messages.map((msg, i) => (
          <div key={i} className="p-2 border rounded">
            <span className="font-bold">{msg.type}: </span>
            {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}
