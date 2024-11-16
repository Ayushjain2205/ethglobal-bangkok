"use client";

import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { User, Bot } from "lucide-react";

export default function CommandCenter() {
  const [messages, setMessages] = useState<
    Array<{ type: string; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setupWebSocket = () => {
      wsRef.current = new WebSocket("ws://localhost:8000/ws");

      wsRef.current.onopen = () => {
        console.log("WebSocket Connected");
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket Disconnected");
        setTimeout(setupWebSocket, 2000);
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== "tools" && data.content?.trim()) {
            setMessages((prev) => [...prev, data]);
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };
    };

    setupWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
      console.log(messages);
    }
  }, [messages]);

  const sendMessage = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN && input.trim()) {
      try {
        wsRef.current.send(JSON.stringify({ message: input }));
        setMessages((prev) => [...prev, { type: "user", content: input }]);
        setInput("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.log("WebSocket not connected or empty message");
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
          <p className="title">Command Center</p>
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
              />
              <button onClick={sendMessage} className="nes-btn is-primary ml-2">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
