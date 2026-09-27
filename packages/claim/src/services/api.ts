import { ItemDefinition } from '@itsim/shared';
import { MarketplaceItem, PlayerStats, SeasonInfo, UserProfile, VaultInfo } from '../types';

export async function verifyToken(token: string): Promise<{
  valid: boolean;
  user: UserProfile;
  season: SeasonInfo;
  stats: PlayerStats;
  inventory: ItemDefinition[];
  nftInventory: string[];
}> {
  const res = await fetch('/api/claim/verify-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Verification failed' }));
    throw new Error(err.error || 'Failed to verify token');
  }
  return res.json();
}

export async function claimTokens(token: string, walletAddress: string): Promise<{
  success: boolean;
  amount: number;
  tokenSymbol: string;
  txSignature: string;
  message: string;
}> {
  const res = await fetch('/api/claim/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, walletAddress }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Claim failed');
  }
  return data;
}

export async function getMarketplaceListings(): Promise<{
  listings: MarketplaceItem[];
  total: number;
}> {
  const res = await fetch('/api/marketplace/listings');
  if (!res.ok) throw new Error('Failed to load listings');
  return res.json();
}

export async function mintItem(token: string, itemId: string, walletAddress: string) {
  const res = await fetch('/api/marketplace/mint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, itemId, walletAddress }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Mint failed');
  return data;
}

export async function listMarketplaceItem(
  token: string,
  itemId: string,
  priceSol: number,
  walletAddress: string
) {
  const res = await fetch('/api/marketplace/list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, itemId, priceSol, walletAddress }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Listing failed');
  return data;
}

export async function buyMarketplaceItem(
  token: string,
  listingId: string,
  buyerWallet: string
) {
  const res = await fetch('/api/marketplace/buy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, listingId, buyerWallet }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Purchase failed');
  return data;
}

export async function getVaultInfo(): Promise<VaultInfo> {
  const res = await fetch('/api/vault/info');
  if (!res.ok) throw new Error('Failed to fetch vault info');
  return res.json();
}

export async function buyLootbox(): Promise<{
  success: boolean;
  item: ItemDefinition;
  rarity: string;
  pityCounter: number;
  openedToday: number;
  burnAmount: number;
  liquidityAmount: number;
  message: string;
}> {
  const res = await fetch('/api/vault/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Vault purchase failed');
  return data;
}
