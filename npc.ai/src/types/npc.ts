export interface WalletInfo {
  wallet_address: string;
  wallet_id: string;
  transaction_hash?: string;
  network: string;
  balance?: string;
  status: "active" | "pending" | "inactive";
}

export interface NPC {
  id: string;
  name: string;
  avatar?: string;
  balance?: number;
  nfts?: number;
  collections?: number;
  wallet?: WalletInfo;
  core_values?: string[];
  primary_aims?: string[];
  background?: string;
  appearance?: string;
  personality?: {
    riskTolerance: number;
    rationality: number;
    autonomy: number;
  };
}
