"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabase";
import type { NPC } from "@/types/npc";
import Link from "next/link";
import { Coins, ImageIcon, FolderPlus, Zap } from "lucide-react";

const NPCCard = ({ npc }: { npc: NPC }) => {
  const truncateName = (name: string, maxLength: number) => {
    if (!name) return "";
    const baseName = name.replace(".npc.eth", "");
    return baseName.length > maxLength
      ? baseName.substring(0, maxLength - 3) + "..."
      : baseName;
  };

  return (
    <div className="nes-container is-rounded is-dark">
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
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="flex items-center">
          <Coins className="mr-2" size={16} />
          <span>
            {typeof npc.balance === "number" ? npc.balance.toFixed(2) : "0.00"}{" "}
            ETH
          </span>
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
      <div className="mb-4">
        <h4 className="nes-text is-success mb-2">Core Values</h4>
        <div className="flex flex-wrap gap-2">
          {npc.core_values?.slice(0, 3).map((value, index) => (
            <span key={index} className="nes-badge">
              <span className="is-primary">{value}</span>
            </span>
          ))}
        </div>
      </div>
      <Link href={`/npc/${npc.id}`} className="nes-btn is-primary w-full">
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
