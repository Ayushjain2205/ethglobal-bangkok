import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type NPC = {
  id: string;
  name: string;
  background: string;
  appearance: string;
  personality: {
    riskTolerance: number;
    rationality: number;
    autonomy: number;
  };
  core_values: string[];
  primary_aims: string[];
  voice: {
    type: string;
    sample: string | null;
  };
  wallet: {
    wallet_address: string;
    wallet_id: string;
    network: string;
    balance: string;
    status: "active" | "pending" | "inactive";
    transaction_hash?: string;
  };
  created_at: string;
  updated_at: string;
  avatar?: string;
};
