"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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
} from "lucide-react";

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

export default function NPCDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [npc, setNpc] = useState<NPC | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchNPCDetails();
    }
  }, [id]);

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
        </div>
      </div>
    </Layout>
  );
}
