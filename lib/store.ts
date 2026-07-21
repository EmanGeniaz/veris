import { create } from "zustand";
import type { GovernanceLayerId, HITLApproval, UserRole } from "@/lib/types";

type GovernanceState = {
  activeLayerId: GovernanceLayerId;
  activeRole: UserRole;
  selectedAssetId: string;
  decisions: Record<string, HITLApproval["status"]>;
  setActiveLayer: (layer: GovernanceLayerId) => void;
  setActiveRole: (role: UserRole) => void;
  setSelectedAsset: (assetId: string) => void;
  setDecision: (id: string, decision: "Approved" | "Rejected") => void;
};

export const useGovernanceStore = create<GovernanceState>((set) => ({
  activeLayerId: "governance",
  activeRole: "CAIO",
  selectedAssetId: "asset-1",
  decisions: {},
  setActiveLayer: (layer) => set({ activeLayerId: layer }),
  setActiveRole: (role) => set({ activeRole: role }),
  setSelectedAsset: (assetId) => set({ selectedAssetId: assetId }),
  setDecision: (id, decision) =>
    set((state) => ({
      decisions: {
        ...state.decisions,
        [id]: decision
      }
    }))
}));
