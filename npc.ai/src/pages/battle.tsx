"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Dna, Coins, ImageIcon, FolderPlus } from "lucide-react";
import Confetti from "react-confetti";

interface Agent {
  name: string;
  balance: number;
  nfts: number;
  collections: number;
  avatar: string;
  coreValues: string[];
  primaryAims: string[];
  wallet: string;
  background: string;
  appearance: string;
  personality: {
    riskTolerance: number;
    rationality: number;
    autonomy: number;
  };
}

const AgentDisplay = ({ agent }: { agent: Agent }) => (
  <div className="nes-container with-title">
    <p className="title">{agent.name}</p>
    <div className="flex items-center mb-4">
      <img
        src={agent.avatar}
        alt={`${agent.name} avatar`}
        width="100"
        height="100"
        className="nes-avatar is-large is-rounded"
      />
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
    <div className="mb-4">
      <h3 className="nes-text is-primary">Core Values</h3>
      <p>{agent.coreValues.join(", ")}</p>
    </div>
    <div className="mb-4">
      <h3 className="nes-text is-primary">Primary Aims</h3>
      <p>{agent.primaryAims.join(", ")}</p>
    </div>
    <div className="mb-4">
      <h3 className="nes-text is-primary">Wallet</h3>
      <p className="break-all">{agent.wallet}</p>
    </div>
    <div className="mb-4">
      <h3 className="nes-text is-primary">Background</h3>
      <p>{agent.background.substring(0, 100)}...</p>
    </div>
    <div className="mb-4">
      <h3 className="nes-text is-primary">Appearance</h3>
      <p>{agent.appearance.substring(0, 100)}...</p>
    </div>
    <div className="mb-4">
      <h3 className="nes-text is-primary">Personality</h3>
      <p>Risk Tolerance: {agent.personality.riskTolerance}</p>
      <p>Rationality: {agent.personality.rationality}</p>
      <p>Autonomy: {agent.personality.autonomy}</p>
    </div>
  </div>
);

export default function AgentBreeder() {
  const [agent1, setAgent1] = useState<Agent>({
    name: "Agent 1",
    balance: 1,
    nfts: 0,
    collections: 0,
    avatar: "https://api.dicebear.com/6.x/pixel-art/svg?seed=agent1",
    coreValues: ["Honesty", "Innovation"],
    primaryAims: ["Maximize profit", "Expand network"],
    wallet: "0x1234567890123456789012345678901234567890",
    background: "A tech-savvy entrepreneur with a passion for blockchain.",
    appearance:
      "Sleek and modern, always dressed in cutting-edge smart clothing.",
    personality: {
      riskTolerance: 70,
      rationality: 80,
      autonomy: 60,
    },
  });
  const [agent2, setAgent2] = useState<Agent>({
    name: "Agent 2",
    balance: 1,
    nfts: 0,
    collections: 0,
    avatar: "https://api.dicebear.com/6.x/pixel-art/svg?seed=agent2",
    coreValues: ["Efficiency", "Collaboration"],
    primaryAims: ["Sustainable growth", "Market leadership"],
    wallet: "0x0987654321098765432109876543210987654321",
    background:
      "A visionary artist exploring the intersection of art and technology.",
    appearance: "Eccentric and colorful, with augmented reality accessories.",
    personality: {
      riskTolerance: 50,
      rationality: 60,
      autonomy: 90,
    },
  });
  const [hybridAgent, setHybridAgent] = useState<Agent | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const generateWallet = () => {
    return (
      "0x" +
      Array(40)
        .fill(0)
        .map(() => Math.random().toString(16)[2])
        .join("")
    );
  };

  const breedAgents = () => {
    const newAgent: Agent = {
      name: "hybrid.12.npc.eth",
      balance: (agent1.balance + agent2.balance) / 2,
      nfts: Math.floor((agent1.nfts + agent2.nfts) / 2),
      collections: Math.floor((agent1.collections + agent2.collections) / 2),
      avatar: `https://api.dicebear.com/6.x/pixel-art/svg?seed=${Math.random()}`,
      coreValues: [
        ...new Set([...agent1.coreValues, ...agent2.coreValues]),
      ].slice(0, 3),
      primaryAims: [
        ...new Set([...agent1.primaryAims, ...agent2.primaryAims]),
      ].slice(0, 3),
      wallet: generateWallet(),
      background: `A unique blend of ${agent1.name} and ${agent2.name}, combining their diverse backgrounds.`,
      appearance: `An intriguing mix of ${agent1.name}'s and ${agent2.name}'s appearances, creating a truly distinctive look.`,
      personality: {
        riskTolerance: Math.round(
          (agent1.personality.riskTolerance +
            agent2.personality.riskTolerance) /
            2
        ),
        rationality: Math.round(
          (agent1.personality.rationality + agent2.personality.rationality) / 2
        ),
        autonomy: Math.round(
          (agent1.personality.autonomy + agent2.personality.autonomy) / 2
        ),
      },
    };
    setHybridAgent(newAgent);
    setShowConfetti(true);
  };

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="nes-text is-primary text-center text-4xl mb-8">
          Agent Breeder
        </h1>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="w-full md:w-1/2">
            <AgentDisplay agent={agent1} />
          </div>
          <div className="w-full md:w-1/2">
            <AgentDisplay agent={agent2} />
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <button className="nes-btn is-primary" onClick={breedAgents}>
            <Dna className="inline-block mr-2" /> Breed Agents
          </button>
        </div>

        {hybridAgent && (
          <div className="nes-container with-title">
            <p className="title">Hybrid Agent</p>
            <AgentDisplay agent={hybridAgent} />
          </div>
        )}

        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={200}
            gravity={0.1}
          />
        )}
      </div>
    </Layout>
  );
}
