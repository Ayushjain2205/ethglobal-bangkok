"use client";

import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

export default function Agent() {
  const [messages, setMessages] = useState<
    Array<{ type: string; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [ensAddress, setEnsAddress] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // WebSocket connection
    wsRef.current = new WebSocket("ws://localhost:8000/ws");
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    // Create Sepolia client
    const sepoliaClient = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    const resolveEns = async () => {
      try {
        const address = await sepoliaClient.getEnsAddress({
          name: "npc.eth",
        });

        if (address) {
          // Get the balance on Sepolia
          const balance = await sepoliaClient.getBalance({
            address: address,
          });

          setEnsAddress(`${address} (Balance: ${balance.toString()} wei)`);
          console.log("ENS Address:", address);
          console.log("Sepolia Balance:", balance.toString());
        } else {
          setEnsAddress("No address found");
        }
      } catch (error) {
        console.error("Error:", error);
        setEnsAddress(
          "Error resolving address. Make sure the ENS name is registered on Sepolia."
        );
      }
    };

    resolveEns();

    return () => wsRef.current?.close();
  }, []);

  const sendMessage = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN && input.trim()) {
      wsRef.current.send(JSON.stringify({ message: input }));
      setInput("");
    }
  };

  // Add function to resolve any ENS name input by user
  const resolveCustomEns = async (ensName: string) => {
    try {
      const sepoliaClient = createPublicClient({
        chain: sepolia,
        transport: http(),
      });

      const address = await sepoliaClient.getEnsAddress({
        name: ensName,
      });

      if (address) {
        const balance = await sepoliaClient.getBalance({
          address: address,
        });
        return `${address} (Balance: ${balance.toString()} wei)`;
      }
      return "No address found";
    } catch (error) {
      console.error("Error:", error);
      return "Error resolving address";
    }
  };

  const handleInput = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (input.endsWith(".eth")) {
        const resolvedAddress = await resolveCustomEns(input);
        setMessages((prev) => [
          ...prev,
          { type: "ENS Resolution", content: `${input} → ${resolvedAddress}` },
        ]);
      }
      sendMessage();
    }
  };

  return (
    <Layout>
      <div className="p-4">
        {/* Network Information */}
        <div className="mb-4 p-2 bg-blue-100 rounded">
          <p className="text-sm text-blue-800">
            Network: Sepolia Testnet
            <br />
            Note: ENS names must be registered on Sepolia to resolve
          </p>
        </div>

        {/* Display ENS address */}
        {/* {ensAddress && (
          <div className="mb-4 p-2 bg-gray-100 rounded">
            <span className="font-bold">Resolved Address: </span>
            {ensAddress}
          </div>
        )} */}

        <div className="mb-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleInput}
            className="mr-2 p-2 border"
            placeholder="Enter ENS name or message..."
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
    </Layout>
  );
}
