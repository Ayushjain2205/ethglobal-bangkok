import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface NPC {
  id: string;
  created_at: string;
  name: string;
  background: string;
  appearance: string;
  personality: {
    riskTolerance: number;
    rationality: number;
    autonomy: number;
  };
  coreValues: string[];
  primaryAims: string[];
  voice: {
    type: string;
    sample: string | null;
  };
  walletAddress: string;
  transactionHash: string;
}
