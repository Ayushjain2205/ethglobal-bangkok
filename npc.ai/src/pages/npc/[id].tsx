"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabase";
import type { NPC } from "@/types/npc";
import {
  Coins,
  ImageIcon,
  FolderPlus,
  Zap,
  Brain,
  BotIcon as Robot,
  Dumbbell,
  ArrowRightLeft,
  ArrowUpDown,
  PlusCircle,
  FileCode,
  Palette,
} from "lucide-react";

interface Transaction {
  id: string;
  type:
    | "send"
    | "receive"
    | "mintNFT"
    | "mintToken"
    | "smartContract"
    | "createToken"
    | "createNFT";
  amount?: number;
  details: string;
  timestamp: string;
}

const PersonalityTrait = ({
  value,
  icon,
  label,
}: {
  value: number;
  icon: React.ReactNode;
  label: string;
}) => (
  <div className="flex items-center mb-2">
    {icon}
    <div className="ml-2 flex-grow">
      <div className="flex justify-between text-xs mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  </div>
);

const OnChainActivity = ({ transactions }: { transactions: Transaction[] }) => {
  const getIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "send":
        return (
          <ArrowUpDown className="inline-block mr-2 text-red-500" size={16} />
        );
      case "receive":
        return (
          <ArrowRightLeft
            className="inline-block mr-2 text-green-500"
            size={16}
          />
        );
      case "mintNFT":
        return (
          <Palette className="inline-block mr-2 text-purple-500" size={16} />
        );
      case "mintToken":
        return (
          <Coins className="inline-block mr-2 text-yellow-500" size={16} />
        );
      case "smartContract":
        return (
          <FileCode className="inline-block mr-2 text-blue-500" size={16} />
        );
      case "createToken":
        return (
          <PlusCircle className="inline-block mr-2 text-green-500" size={16} />
        );
      case "createNFT":
        return (
          <ImageIcon className="inline-block mr-2 text-pink-500" size={16} />
        );
      default:
        return null;
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const txDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - txDate.getTime()) / 1000);

    if (diffInSeconds < 180) return "Few mins ago";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  };

  return (
    <div className="nes-container is-dark with-title">
      <p className="title">On-Chain Activity</p>
      <div
        className="overflow-y-auto border border-gray-700"
        style={{ maxHeight: "300px" }}
      >
        <table className="nes-table is-bordered is-dark w-full">
          <thead>
            <tr>
              <th>Type</th>
              <th>Details</th>
              <th>Amount</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>
                  {getIcon(tx.type)}
                  {tx.type}
                </td>
                <td>{tx.details}</td>
                <td>
                  {tx.amount !== undefined
                    ? `${tx.amount.toFixed(4)} ETH`
                    : "-"}
                </td>
                <td>{getRelativeTime(tx.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function NPCDetail() {
  const params = useParams();
  const { id } = params;
  const [npc, setNpc] = useState<NPC | null>(null);
  const [loading, setLoading] = useState(true);
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (id) {
      fetchNPCDetails();
      fetchOnChainActivity();
    }
  }, [id]);

  useEffect(() => {
    const initialThoughts = generateInitialThoughts();
    setThoughts(initialThoughts);

    const interval = setInterval(() => {
      const newThought = generateRandomThought();
      const timestamp = new Date().toLocaleTimeString();
      setThoughts((prevThoughts) => [
        ...prevThoughts,
        `[${timestamp}] ${newThought}`,
      ]);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchNPCDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("npcs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setNpc(data);
    } catch (error) {
      console.error("Error fetching NPC details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOnChainActivity = async () => {
    // This is a mock function. In a real application, you would fetch this data from a blockchain explorer API
    const mockTransactions: Transaction[] = [
      {
        id: "1",
        type: "send",
        amount: 0.1,
        details: "Sent to 0x1234...5678",
        timestamp: "2024-11-17T10:30:00Z",
      },
      {
        id: "2",
        type: "receive",
        amount: 0.05,
        details: "Received from 0x8765...4321",
        timestamp: "2024-11-17T15:45:00Z",
      },
      {
        id: "3",
        type: "mintNFT",
        details: "Minted NFT #1234",
        timestamp: "2024-11-16T09:20:00Z",
      },
      {
        id: "4",
        type: "smartContract",
        details: "Interacted with DEX contract",
        timestamp: "2024-11-16T18:00:00Z",
      },
      {
        id: "5",
        type: "createToken",
        details: "Created ERC20 token $EXAMPLE",
        timestamp: "2024-11-16T11:10:00Z",
      },
      {
        id: "6",
        type: "mintToken",
        amount: 1000,
        details: "Minted 1000 $EXAMPLE tokens",
        timestamp: "2024-11-16T14:30:00Z",
      },
      {
        id: "7",
        type: "createNFT",
        details: "Created new NFT collection",
        timestamp: "2024-11-16T16:45:00Z",
      },
      {
        id: "8",
        type: "send",
        amount: 0.2,
        details: "Sent to 0xABCD...EFGH",
        timestamp: "2024-11-17T08:15:00Z",
      },
      {
        id: "9",
        type: "receive",
        amount: 0.15,
        details: "Received from 0xIJKL...MNOP",
        timestamp: "2024-11-17T12:00:00Z",
      },
      {
        id: "10",
        type: "smartContract",
        details: "Interacted with Lending protocol",
        timestamp: "2024-11-16T20:30:00Z",
      },
      {
        id: "11",
        type: "mintNFT",
        details: "Minted NFT #5678",
        timestamp: "2024-11-17T07:45:00Z",
      },
      {
        id: "12",
        type: "createToken",
        details: "Created ERC20 token $SAMPLE",
        timestamp: "2024-11-16T13:20:00Z",
      },
      {
        id: "13",
        type: "mintToken",
        amount: 500,
        details: "Minted 500 $SAMPLE tokens",
        timestamp: "2024-11-16T17:10:00Z",
      },
      {
        id: "14",
        type: "send",
        amount: 0.03,
        details: "Sent to 0xQRST...UVWX",
        timestamp: "2024-11-17T09:50:00Z",
      },
      {
        id: "15",
        type: "receive",
        amount: 0.08,
        details: "Received from 0xYZAB...CDEF",
        timestamp: "2024-11-17T14:25:00Z",
      },
    ];
    // Sort transactions chronologically, most recent first
    mockTransactions.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setTransactions(mockTransactions);
  };

  const generateRandomThought = () => {
    const thoughts = [
      "Analyzing market trends...",
      "Calculating optimal trade routes...",
      "Evaluating potential partnerships...",
      "Updating blockchain knowledge...",
      "Simulating economic scenarios...",
      "Optimizing resource allocation...",
      "Predicting future technology trends...",
      "Assessing risk factors...",
      "Exploring new investment opportunities...",
      "Reviewing smart contract security...",
    ];
    return thoughts[Math.floor(Math.random() * thoughts.length)];
  };

  const generateInitialThoughts = () => {
    const initialThoughts = [];
    const now = new Date();
    for (let i = 120; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60000);
      const thought = generateRandomThought();
      initialThoughts.push(`[${timestamp.toLocaleTimeString()}] ${thought}`);
    }
    return initialThoughts;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <p className="nes-text is-primary">Loading NPC details...</p>
        </div>
      </Layout>
    );
  }

  if (!npc) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <p className="nes-text is-error">NPC not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="nes-container with-title is-dark">
          <p className="title">{npc.name}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              <div className="flex justify-center mb-8">
                <img
                  src={npc.avatar || "/placeholder.png"}
                  alt={`${npc.name} avatar`}
                  className="w-48 h-48 rounded-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Coins className="mr-2" size={16} />
                  <span>{npc.balance?.toFixed(2) || "0.00"} ETH</span>
                </div>
                <div className="flex items-center">
                  <ImageIcon className="mr-2" size={16} />
                  <span>{npc.nfts || 0} NFTs</span>
                </div>
                <div className="flex items-center">
                  <FolderPlus className="mr-2" size={16} />
                  <span>{npc.collections || 0} Collections</span>
                </div>
                <div className="flex items-center">
                  <Zap className="mr-2" size={16} />
                  <span>{npc.core_values?.length || 0} Core Values</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="nes-text is-primary mb-4">Personality Traits</h3>
                <PersonalityTrait
                  value={npc.personality?.riskTolerance || 50}
                  icon={<Dumbbell size={16} />}
                  label="Risk Tolerance"
                />
                <PersonalityTrait
                  value={npc.personality?.rationality || 50}
                  icon={<Brain size={16} />}
                  label="Rationality"
                />
                <PersonalityTrait
                  value={npc.personality?.autonomy || 50}
                  icon={<Robot size={16} />}
                  label="Autonomy"
                />
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="mb-6">
                <h3 className="nes-text is-success mb-2">Core Values</h3>
                <div className="flex flex-wrap gap-2">
                  {npc.core_values?.map((value, index) => (
                    <span key={index} className="nes-badge">
                      <span className="is-primary">{value}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="nes-text is-warning mb-2">Primary Aims</h3>
                <div className="flex flex-wrap gap-2">
                  {npc.primary_aims?.map((aim, index) => (
                    <span key={index} className="nes-badge">
                      <span className="is-warning">{aim}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="nes-text is-error mb-2">Wallet Address</h3>
                <p className="break-all text-xs">
                  {npc.wallet_address || "No wallet address"}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="nes-text is-primary mb-2">Background</h3>
                <p className="text-sm">
                  {npc.background || "No background information"}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="nes-text is-primary mb-2">Appearance</h3>
                <p className="text-sm">
                  {npc.appearance || "No appearance description"}
                </p>
              </div>
            </div>
          </div>

          {/* On-Chain Activity Section */}
          <div className="mt-8">
            <OnChainActivity transactions={transactions} />
          </div>

          {/* Terminal Section */}
          <div className="mt-8">
            <h3 className="nes-text is-error mb-2">NPC Terminal</h3>
            <div
              className="nes-container is-dark with-title is-rounded"
              style={{
                height: "400px",
                overflowY: "auto",
                backgroundColor: "#000",
              }}
            >
              <p className="title">Thoughts</p>
              {thoughts.map((thought, index) => (
                <p
                  key={index}
                  className="text-xs mb-1"
                  style={{ color: "#00ff00" }}
                >
                  {thought}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
