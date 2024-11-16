import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabase";
import type { NPC } from "@/types/npc";
import Link from "next/link";

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
          <p>Loading NPCs...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8 nes-text is-primary">
          All NPCs
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {npcs.map((npc) => (
            <div key={npc.id} className="nes-container with-title">
              <p className="title">{npc.name}</p>
              <div className="space-y-2">
                <img
                  src={npc.avatar}
                  className="h-[100px] rounded-full"
                  alt=""
                />
                <p className="text-sm">{npc.background.substring(0, 100)}...</p>
                <div className="flex flex-wrap gap-2">
                  {npc.core_values?.map((value) => (
                    <span key={value} className="nes-badge">
                      <span className="is-primary">{value}</span>
                    </span>
                  ))}
                </div>
                <div className="mt-4">
                  <Link href={`/npc/${npc.id}`} className="nes-btn is-primary">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AllNPCs;
