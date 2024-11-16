"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabase";
import type { NPC } from "@/types/npc";
import Link from "next/link";

const NPCCard = ({ npc }: { npc: NPC }) => {
  const truncateName = (name: string, maxLength: number) => {
    if (!name) return "";
    const baseName = name.replace(".npc.eth", "");
    return baseName.length > maxLength
      ? baseName.substring(0, maxLength - 3) + "..."
      : baseName;
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const generateRandomEth = () => {
    return (Math.random() * (0.1 - 0.01) + 0.01).toFixed(4);
  };

  const generateRandomAddress = () => {
    return (
      "0x" +
      Array(40)
        .fill(0)
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join("")
    );
  };

  const ethValue = npc.balance || Number(generateRandomEth());
  const address = npc.wallet_address || generateRandomAddress();

  return (
    <div className="nes-container is-rounded hover:shadow-lg transition-shadow duration-300 relative">
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={npc.avatar || "/placeholder.png"}
          alt={npc.name}
          className="w-16 h-16 rounded-full flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h3 className="nes-text is-primary truncate">
            {truncateName(npc.name, 12)}
          </h3>
          <p className="text-sm truncate">
            {truncateName(npc.name, 12)}.npc.eth
          </p>
          <p className="text-xs text-gray-500">{truncateAddress(address)}</p>
        </div>
      </div>
      <div className="mb-4">
        <h4 className="nes-text is-success mb-2">Core Values</h4>
        <div className="flex flex-wrap gap-2">
          {(npc.core_values || ["Integrity", "Innovation", "Collaboration"])
            .slice(0, 3)
            .map((value, index) => (
              <span key={index} className="nes-badge">
                <span className="is-primary">{value}</span>
              </span>
            ))}
        </div>
      </div>
      <div className="mb-4">
        <h4 className="nes-text is-warning mb-2">Primary Aims</h4>
        <div className="flex flex-wrap gap-2">
          {(npc.primary_aims || ["Profit", "Growth", "Innovation"])
            .slice(0, 3)
            .map((aim, index) => (
              <span key={index} className="nes-badge">
                <span className="is-warning">{aim}</span>
              </span>
            ))}
        </div>
      </div>
      <div className="mb-4">
        <h4 className="nes-text is-error mb-2">Value Added</h4>
        <p className="text-sm">{ethValue} ETH</p>
      </div>
      <Link
        href={`/npc/${npc.id}`}
        className="nes-btn is-primary w-full opacity-0 hover:opacity-100 transition-opacity duration-300 absolute inset-0 flex items-center justify-center"
      >
        View Details
      </Link>
    </div>
  );
};

const AllNPCs = () => {
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNPCs();
  }, []);

  const fetchNPCs = async () => {
    try {
      const { data, error } = await supabase
        .from("npcs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNpcs(data || []);
    } catch (error) {
      console.error("Error fetching NPCs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <p className="nes-text is-primary">Loading NPCs...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="nes-text is-primary text-center text-4xl mb-8">
          All NPCs
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {npcs.map((npc) => (
            <NPCCard key={npc.id} npc={npc} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AllNPCs;
