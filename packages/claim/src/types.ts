import { ItemDefinition, ItemRarity } from '@itsim/shared';

export interface UserProfile {
  id: string;
  name: string;
  username?: string | null;
}

export interface SeasonInfo {
  seasonId: string;
  title: string;
  durationDays: number;
  tokenSymbol: string;
  rewardPool: number;
  activePlayerTopPercent: number;
}

export interface PlayerStats {
  seasonScore: number;
  lifeCount: number;
  currentModifier?: string | null;
  openRank: number;
  honestRank: number;
  totalPlayers: number;
  eligible: boolean;
  rewardAmount: number;
  alreadyClaimed: boolean;
  claimDetails?: { amount: number; claimedAt: number; wallet: string } | null;
}

export interface MarketplaceItem {
  id: string;
  sellerId: string;
  sellerWallet: string;
  sellerName: string;
  itemId: string;
  item: ItemDefinition;
  priceSol: number;
  listedAt: number;
}

export interface VaultInfo {
  seasonId: string;
  tokenSymbol: string;
  price: number;
  burnPercent: number;
  liquidityPercent: number;
  dropRates: { common: number; rare: number; legendary: number };
  dailyLimit: number;
  openedToday: number;
  remainingToday: number;
  pityCounter: number;
  pityLimit: number;
  guaranteedNext: boolean;
}
