"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  Coins,
  ShoppingCart,
  Repeat,
  ImageIcon,
  FolderPlus,
} from "lucide-react";

interface Agent {
  name: string;
  balance: number;
  nfts: number;
  collections: number;
  avatar: string;
}

interface Action {
  type: "buy" | "sell" | "swap" | "mint" | "create";
  amount?: number;
}

interface ActionLog {
  agent: string;
  action: Action;
}

const AgentStatus = ({ agent }: { agent: Agent }) => (
  <div className="nes-container with-title">
    <p className="title">Status</p>
    <div className="flex items-center mb-4">
      <img
        src={agent.avatar}
        alt={`${agent.name} avatar`}
        width={64}
        height={64}
        className="nes-avatar is-rounded"
      />
      <h2 className="nes-text is-primary ml-4">{agent.name}</h2>
    </div>
    <p>
      <Coins className="inline-block mr-2" size={16} /> Balance:{" "}
      {agent.balance.toFixed(4)} ETH
    </p>
    <p>
      <ImageIcon className="inline-block mr-2" size={16} /> NFTs: {agent.nfts}
    </p>
    <p>
      <FolderPlus className="inline-block mr-2" size={16} /> Collections:{" "}
      {agent.collections}
    </p>
  </div>
);

const ActionIcon = ({ type }: { type: Action["type"] }) => {
  switch (type) {
    case "buy":
      return <ShoppingCart className="inline-block mr-2" size={16} />;
    case "sell":
      return <Coins className="inline-block mr-2" size={16} />;
    case "swap":
      return <Repeat className="inline-block mr-2" size={16} />;
    case "mint":
      return <ImageIcon className="inline-block mr-2" size={16} />;
    case "create":
      return <FolderPlus className="inline-block mr-2" size={16} />;
  }
};

export default function BattlePage() {
  const [agent1, setAgent1] = useState<Agent>({
    name: "Agent 1",
    balance: 1,
    nfts: 0,
    collections: 0,
    avatar: "https://api.dicebear.com/6.x/pixel-art/svg?seed=agent1",
  });
  const [agent2, setAgent2] = useState<Agent>({
    name: "Agent 2",
    balance: 1,
    nfts: 0,
    collections: 0,
    avatar: "https://api.dicebear.com/6.x/pixel-art/svg?seed=agent2",
  });
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const performAction = (
    agent: Agent,
    setAgent: React.Dispatch<React.SetStateAction<Agent>>
  ) => {
    const actions: Action["type"][] = ["buy", "sell", "swap", "mint", "create"];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const action: Action = { type: randomAction };

    switch (action.type) {
      case "buy":
        action.amount = Number((Math.random() * 0.1 + 0.01).toFixed(4));
        setAgent((prev) => ({
          ...prev,
          balance: Number((prev.balance + action.amount!).toFixed(4)),
        }));
        break;
      case "sell":
        action.amount = Number(
          Math.min(Math.random() * 0.1 + 0.01, agent.balance).toFixed(4)
        );
        setAgent((prev) => ({
          ...prev,
          balance: Number((prev.balance - action.amount!).toFixed(4)),
        }));
        break;
      case "swap":
        action.amount = Number(
          Math.min(Math.random() * 0.05 + 0.01, agent.balance).toFixed(4)
        );
        setAgent((prev) => ({
          ...prev,
          balance: Number(
            (prev.balance - action.amount! + action.amount! * 0.95).toFixed(4)
          ),
        }));
        break;
      case "mint":
        if (agent.balance >= 0.01) {
          setAgent((prev) => ({
            ...prev,
            balance: Number((prev.balance - 0.01).toFixed(4)),
            nfts: prev.nfts + 1,
          }));
        }
        break;
      case "create":
        if (agent.balance >= 0.05) {
          setAgent((prev) => ({
            ...prev,
            balance: Number((prev.balance - 0.05).toFixed(4)),
            collections: prev.collections + 1,
          }));
        }
        break;
    }

    setActionLogs((prev) => [{ agent: agent.name, action }, ...prev]);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        performAction(agent1, setAgent1);
        performAction(agent2, setAgent2);
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [isRunning, agent1, agent2]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="nes-text is-primary text-center text-4xl mb-8">
          Agent Battle Arena
        </h1>

        <div className="flex justify-center mb-4">
          <button
            className={`nes-btn ${isRunning ? "is-error" : "is-success"}`}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? "Stop Simulation" : "Start Simulation"}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <AgentStatus agent={agent1} />
          </div>

          <div className="w-full md:w-1/2">
            <AgentStatus agent={agent2} />
          </div>
        </div>

        <div className="nes-container with-title mt-8">
          <p className="title">Action Log</p>
          <div className="h-64 overflow-y-auto">
            {actionLogs.map((log, index) => (
              <div key={index} className="mb-2">
                <span className="nes-text is-primary">{log.agent}</span>
                {" performed "}
                <span className="nes-text is-success">
                  <ActionIcon type={log.action.type} />
                  {log.action.type}
                </span>
                {log.action.amount &&
                  ` with ${log.action.amount.toFixed(4)} ETH`}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
