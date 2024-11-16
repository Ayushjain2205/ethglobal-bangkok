"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/Layout";
import {
  ArrowRightLeft,
  ArrowUpDown,
  Brain,
  Coins,
  FileCode,
  ImageIcon,
  Palette,
  PlusCircle,
} from "lucide-react";

interface NPC {
  id: string;
  name: string;
  avatar: string;
}

interface Activity {
  id: string;
  npc_id: string;
  type: "transaction" | "thought" | "thinking";
  content: string;
  timestamp: string;
}

const ActivityIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "send":
      return <ArrowUpDown className="text-red-500" size={16} />;
    case "receive":
      return <ArrowRightLeft className="text-green-500" size={16} />;
    case "mintNFT":
      return <Palette className="text-purple-500" size={16} />;
    case "mintToken":
      return <Coins className="text-yellow-500" size={16} />;
    case "smartContract":
      return <FileCode className="text-blue-500" size={16} />;
    case "createToken":
      return <PlusCircle className="text-green-500" size={16} />;
    case "createNFT":
      return <ImageIcon className="text-pink-500" size={16} />;
    case "thought":
      return <Brain className="text-cyan-500" size={16} />;
    case "thinking":
      return <Brain className="text-green-500" size={16} />;
    default:
      return null;
  }
};

export default function GlobalTerminal() {
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNPCs();
  }, []);

  useEffect(() => {
    if (npcs.length > 0) {
      generateActivities();
      const interval = setInterval(generateActivities, 30000); // Generate new activities every 30 seconds
      return () => clearInterval(interval);
    }
  }, [npcs]);

  const fetchNPCs = async () => {
    try {
      const { data, error } = await supabase
        .from("npcs")
        .select("id, name, avatar");
      if (error) throw error;
      setNpcs(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching NPCs:", error);
      setLoading(false);
    }
  };

  const generateActivities = () => {
    const newActivities: Activity[] = [];
    const activityTypes = [
      "send",
      "receive",
      "mintNFT",
      "mintToken",
      "smartContract",
      "createToken",
      "createNFT",
      "thought",
      "thinking",
    ];
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
    const randomThoughts = [
      "What if blockchain was made of actual blocks? 🤔",
      "Do NFTs dream of electric sheep?",
      "Is mining crypto just teaching rocks to think?",
      "What if we could stake emotions instead of tokens?",
      "Are smart contracts smarter than me?",
      "If I hodl long enough, will I become one with the blockchain?",
      "What's the gas fee on sending a virtual hug?",
      "Is the metaverse just a fancy way of saying 'very online'?",
      "Do decentralized networks have a center of gravity?",
      "If I fork a blockchain, does it become a spoon?",
    ];

    for (let i = 0; i < 50; i++) {
      const npc = npcs[Math.floor(Math.random() * npcs.length)];
      const type =
        activityTypes[Math.floor(Math.random() * activityTypes.length)];
      let content = "";

      if (type === "thought") {
        content = thoughts[Math.floor(Math.random() * thoughts.length)];
      } else if (type === "thinking") {
        content =
          randomThoughts[Math.floor(Math.random() * randomThoughts.length)];
      } else if (["send", "receive"].includes(type)) {
        content = `${type} ${(Math.random() * 10).toFixed(3)} ETH`;
      } else if (type === "mintNFT") {
        content = `Minted NFT #${Math.floor(Math.random() * 10000)}`;
      } else if (type === "mintToken") {
        content = `Minted ${Math.floor(Math.random() * 1000)} tokens`;
      } else if (type === "smartContract") {
        content = `Interacted with smart contract`;
      } else if (type === "createToken") {
        content = `Created new token $${
          ["BTC", "ETH", "DOGE", "SHIB"][Math.floor(Math.random() * 4)]
        }`;
      } else if (type === "createNFT") {
        content = `Created new NFT collection`;
      }

      newActivities.push({
        id: `activity-${Date.now()}-${i}`,
        npc_id: npc.id,
        type:
          type === "thinking"
            ? "thinking"
            : type === "thought"
            ? "thought"
            : "transaction",
        content,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Random time within the last hour
      });
    }

    newActivities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setActivities(newActivities);
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInSeconds = Math.floor(
      (now.getTime() - activityTime.getTime()) / 1000
    );

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <p className="nes-text is-primary">Loading global terminal...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="nes-container with-title is-dark">
          <p className="title">Global NPC Terminal</p>
          <div
            className="overflow-y-auto"
            style={{ height: "calc(100vh - 200px)" }}
          >
            {activities.map((activity) => {
              const npc = npcs.find((n) => n.id === activity.npc_id);
              return (
                <div key={activity.id} className="mb-4 flex items-start">
                  <img
                    src={npc?.avatar || "/placeholder.svg?height=32&width=32"}
                    alt={npc?.name || "NPC"}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center mb-1">
                      <span className="nes-text is-primary mr-2">
                        {npc?.name || "Unknown NPC"}
                      </span>
                      <ActivityIcon
                        type={
                          activity.type === "transaction"
                            ? activity.content.split(" ")[0]
                            : activity.type
                        }
                      />
                      <span className="text-xs text-gray-500 ml-2">
                        {getRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${
                        activity.type === "thinking" ? "text-green-400" : ""
                      }`}
                    >
                      {activity.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
