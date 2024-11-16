"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import {
  Dna,
  Coins,
  ImageIcon,
  FolderPlus,
  Zap,
  Brain,
  BotIcon as Robot,
  Dumbbell,
} from "lucide-react";
import Confetti from "react-confetti";
import { supabase } from "@/lib/supabase";
import type { NPC } from "@/types/npc";

interface ExtendedNPC extends NPC {
  personality: {
    riskTolerance: number;
    rationality: number;
    autonomy: number;
  };
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

const NPCDisplay = ({ npc }: { npc: ExtendedNPC }) => (
  <div className="nes-container with-title is-dark">
    <p className="title">{npc.name}.npc.eth</p>
    <div className="flex justify-center mb-4">
      <img
        src={npc.avatar || "/placeholder.png"}
        alt={`${npc.name} avatar`}
        width="100"
        height="100"
        className="nes-avatar is-large is-rounded"
      />
    </div>
    <div className="grid grid-cols-2 gap-4 mb-4">
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
      <h3 className="nes-text is-primary mb-2">Personality</h3>
      <PersonalityTrait
        value={npc.personality.riskTolerance}
        icon={<Dumbbell size={16} />}
        label="Risk Tolerance"
      />
      <PersonalityTrait
        value={npc.personality.rationality}
        icon={<Brain size={16} />}
        label="Rationality"
      />
      <PersonalityTrait
        value={npc.personality.autonomy}
        icon={<Robot size={16} />}
        label="Autonomy"
      />
    </div>
    <div className="mb-4">
      <h3 className="nes-text is-success mb-2">Core Values</h3>
      <div className="flex flex-wrap gap-2">
        {npc.core_values?.map((value, index) => (
          <span key={index} className="nes-badge">
            <span className="is-primary">{value}</span>
          </span>
        ))}
      </div>
    </div>
    <div className="mb-4">
      <h3 className="nes-text is-warning mb-2">Primary Aims</h3>
      <div className="flex flex-wrap gap-2">
        {npc.primary_aims?.map((aim, index) => (
          <span key={index} className="nes-badge">
            <span className="is-warning">{aim}</span>
          </span>
        ))}
      </div>
    </div>
    <div className="mb-4">
      <h3 className="nes-text is-error mb-2">Wallet</h3>
      <p className="break-all text-xs">
        {npc.wallet_address || "No wallet address"}
      </p>
    </div>
    <div className="mb-4">
      <h3 className="nes-text is-primary mb-2">Background</h3>
      <p className="text-sm">{npc.background || "No background information"}</p>
    </div>
    <div className="mb-4">
      <h3 className="nes-text is-primary mb-2">Appearance</h3>
      <p className="text-sm">{npc.appearance || "No appearance description"}</p>
    </div>
  </div>
);

const NPCCard = ({
  npc,
  onClick,
  isSelected,
}: {
  npc: NPC;
  onClick: () => void;
  isSelected: boolean;
}) => {
  const truncateName = (name: string, maxLength: number) => {
    if (!name) return "";
    const baseName = name.replace(".npc.eth", "");
    return baseName.length > maxLength
      ? baseName.substring(0, maxLength - 3) + "..."
      : baseName;
  };

  return (
    <div
      className={`nes-container is-rounded ${
        isSelected ? "is-primary" : ""
      } cursor-pointer transition-all duration-300 transform ${
        isSelected ? "scale-105" : "hover:scale-105"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-4">
        <img
          src={npc.avatar || "/placeholder.png"}
          alt={npc.name}
          className="w-16 h-16 rounded-full flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h3
            className={`nes-text ${
              isSelected ? "is-success" : "is-primary"
            } truncate`}
          >
            {truncateName(npc.name, 12)}
          </h3>
          <p className="text-sm truncate">
            {truncateName(npc.name, 12)}.npc.eth
          </p>
        </div>
      </div>
    </div>
  );
};

export default function NPCBreeder() {
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [selectedNPCs, setSelectedNPCs] = useState<NPC[]>([]);
  const [hybridNPC, setHybridNPC] = useState<ExtendedNPC | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isBreeding, setIsBreeding] = useState(false);
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

  const handleNPCSelect = (npc: NPC) => {
    setSelectedNPCs((prev) => {
      if (prev.find((p) => p.id === npc.id)) {
        return prev.filter((p) => p.id !== npc.id);
      }
      if (prev.length < 2) {
        return [...prev, npc];
      }
      return [prev[1], npc];
    });
  };

  const generateWallet = () => {
    return (
      "0x" +
      Array(40)
        .fill(0)
        .map(() => Math.random().toString(16)[2])
        .join("")
    );
  };

  const breedNPCs = () => {
    if (selectedNPCs.length !== 2) return;

    setIsBreeding(true);
    setTimeout(() => {
      const [npc1, npc2] = selectedNPCs;
      const newNPC: ExtendedNPC = {
        ...npc1,
        id: `${npc1.id}-${npc2.id}`,
        name: `hybrid-${Date.now().toString().slice(-4)}.npc.eth`,
        balance:
          typeof npc1.balance === "number" && typeof npc2.balance === "number"
            ? (npc1.balance + npc2.balance) / 2
            : 0,
        nfts: Math.floor(((npc1.nfts || 0) + (npc2.nfts || 0)) / 2),
        collections: Math.floor(
          ((npc1.collections || 0) + (npc2.collections || 0)) / 2
        ),
        avatar: `https://api.dicebear.com/6.x/pixel-art/svg?seed=${Math.random()}`,
        core_values: [
          ...new Set([
            ...(npc1.core_values || []),
            ...(npc2.core_values || []),
          ]),
        ].slice(0, 3),
        primary_aims: [
          ...new Set([
            ...(npc1.primary_aims || []),
            ...(npc2.primary_aims || []),
          ]),
        ].slice(0, 3),
        wallet_address: generateWallet(),
        background: `A unique blend of ${npc1.name} and ${npc2.name}, combining their diverse backgrounds.`,
        appearance: `An intriguing mix of ${npc1.name}'s and ${npc2.name}'s appearances, creating a truly distinctive look.`,
        personality: {
          riskTolerance: Math.round(
            ((npc1.personality?.riskTolerance || 50) +
              (npc2.personality?.riskTolerance || 50)) /
              2
          ),
          rationality: Math.round(
            ((npc1.personality?.rationality || 50) +
              (npc2.personality?.rationality || 50)) /
              2
          ),
          autonomy: Math.round(
            ((npc1.personality?.autonomy || 50) +
              (npc2.personality?.autonomy || 50)) /
              2
          ),
        },
      };
      setHybridNPC(newNPC);
      setShowConfetti(true);
      setIsBreeding(false);
    }, 3000);
  };

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

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
          NPC Breeder
        </h1>

        {selectedNPCs.length === 2 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {selectedNPCs.map((npc) => (
                <NPCDisplay key={npc.id} npc={npc as ExtendedNPC} />
              ))}
            </div>

            <div className="flex justify-center mb-8">
              <button
                className={`nes-btn is-primary ${
                  isBreeding ? "is-disabled" : ""
                }`}
                onClick={breedNPCs}
                disabled={isBreeding}
              >
                <Dna className="inline-block mr-2" />
                {isBreeding ? "Breeding..." : "Breed NPCs"}
              </button>
            </div>

            {isBreeding && (
              <div className="nes-container is-rounded is-dark mb-8">
                <div className="flex items-center justify-center">
                  <Dna className="animate-spin mr-2" />
                  <span>Creating hybrid NPC...</span>
                </div>
              </div>
            )}

            {hybridNPC && (
              <div className="nes-container is-rounded is-dark with-title">
                <p className="title">Hybrid NPC</p>
                <NPCDisplay npc={hybridNPC} />
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {npcs.map((npc) => (
              <NPCCard
                key={npc.id}
                npc={npc}
                onClick={() => handleNPCSelect(npc)}
                isSelected={selectedNPCs.some((p) => p.id === npc.id)}
              />
            ))}
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
