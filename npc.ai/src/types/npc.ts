export interface WalletInfo {
  wallet_address: string;
  wallet_id: string;
  transaction_hash?: string;
  network: string;
  balance?: string;
  status: "active" | "pending" | "inactive";
}

export interface NPC {
  id?: string;
  created_at?: string;
  updated_at?: string;
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
  wallet: WalletInfo;
  avatar: string;
}
