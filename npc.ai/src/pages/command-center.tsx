"use client";

import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { User, Bot } from "lucide-react";

export default function CommandCenter() {
  const [messages, setMessages] = useState<
    Array<{ type: string; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const connectWebSocket = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return; // Already connected
      }

      wsRef.current = new WebSocket("ws://localhost:8000/ws");

      wsRef.current.onopen = () => {
        console.log("WebSocket Connected");
        setIsConnected(true);
        setMessages((prev) => [
          ...prev,
          {
            type: "agent",
            content: "Connected to NPC Agent. How can I help you today?",
          },
        ]);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received message:", data);

          if (data.type && data.content?.trim()) {
            setMessages((prev) => [
              ...prev,
              {
                type: data.type === "user" ? "user" : "agent",
                content: data.content,
              },
            ]);
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket Error:", error);
        setIsConnected(false);
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket Disconnected");
        setIsConnected(false);
      };
    };

    connectWebSocket();

    // Cleanup function
    return () => {
      if (wsRef.current) {
        const ws = wsRef.current;
        ws.onclose = null; // Remove onclose handler to prevent reconnection
        ws.close(1000, "Component unmounting"); // Normal closure
      }
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        // Add the message to the UI immediately
        setMessages((prev) => [...prev, { type: "user", content: input }]);

        // Send the message
        wsRef.current.send(
          JSON.stringify({
            message: input,
            timestamp: new Date().toISOString(),
          })
        );

        // Clear input
        setInput("");

        // Log the send
        console.log("Message sent:", input);
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prev) => [
          ...prev,
          {
            type: "agent",
            content: "Error sending message. Please try again.",
          },
        ]);

        // Try to reconnect
        connectWebSocket();
      }
    } else {
      console.log("WebSocket not connected, attempting to reconnect...");
      setMessages((prev) => [
        ...prev,
        {
          type: "agent",
          content: "Connection lost. Attempting to reconnect...",
        },
      ]);

      // Try to reconnect
      connectWebSocket();
    }
  };

  const handleInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const formatMessage = (content: string) => {
    if (content.includes("Transaction Details") || content.includes("0x")) {
      const lines = content.split("\n");
      return (
        <div className="nes-container is-dark with-title">
          <p className="title">Transaction Details</p>
          {lines.map((line, index) => (
            <p key={index} className="mb-2 break-all">
              {line}
            </p>
          ))}
        </div>
      );
    }
    return <p>{content}</p>;
  };

  return (
    <Layout>
      <div className="w-full px-4 py-6">
        <div className="nes-container with-title h-[calc(100vh-120px)] flex flex-col">
          <p className="title">Command Center {isConnected ? "🟢" : "🔴"}</p>
          <div
            ref={chatContainerRef}
            className="message-list flex-grow overflow-y-auto mb-4"
          >
            {messages
              .filter((msg) => msg.content?.trim())
              .map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-end mb-4 ${
                    msg.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.type !== "user" && (
                    <div className="nes-bcrikko mr-2 flex-shrink-0 mb-1">
                      <Bot size={32} />
                    </div>
                  )}
                  <div
                    className={`nes-balloon ${
                      msg.type === "user" ? "from-right" : "from-left"
                    } max-w-[70%]`}
                  >
                    {formatMessage(msg.content)}
                  </div>
                  {msg.type === "user" && (
                    <div className="nes-bcrikko ml-2 flex-shrink-0 mb-1">
                      <User size={32} />
                    </div>
                  )}
                </div>
              ))}
          </div>
          <div className="mt-auto">
            <div className="flex">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleInput}
                className="nes-input flex-grow"
                placeholder="Enter your command..."
                disabled={!isConnected}
              />
              <button
                onClick={sendMessage}
                className={`nes-btn ${
                  isConnected ? "is-primary" : "is-disabled"
                } ml-2`}
                disabled={!isConnected}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
