import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface BurnLiquidityRecord {
  id?: string;
  playerId: string;
  price: number;
  burned: number;
  liquidity: number;
  itemId: string;
  itemName: string;
  rarity: string;
  timestamp: number;
  txHash?: string;
}

const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), 'data');
const LEDGER_FILE = join(DATA_DIR, 'vault_burn_liquidity_ledger.json');
const CLAIMS_FILE = join(DATA_DIR, 'season_claims_ledger.json');

const inMemoryLedger: BurnLiquidityRecord[] = [];
const inMemoryClaims = new Map<string, { amount: number; claimedAt: number; wallet: string }>();

function persistLedger() {
  try {
    if (!existsSync(DATA_DIR)) return;
    writeFileSync(LEDGER_FILE, JSON.stringify(inMemoryLedger, null, 2), 'utf-8');
  } catch {
    // Ignore in tests / transient environments
  }
}

function persistClaims() {
  try {
    if (!existsSync(DATA_DIR)) return;
    const obj: Record<string, any> = {};
    for (const [k, v] of inMemoryClaims.entries()) obj[k] = v;
    writeFileSync(CLAIMS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch {
    // Ignore
  }
}

/**
 * Log a transaction's burn and liquidity split (§12.3, §18.5)
 */
export function logBurnAndLiquidity(record: BurnLiquidityRecord): void {
  const fullRecord: BurnLiquidityRecord = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ...record,
  };
  inMemoryLedger.push(fullRecord);
  persistLedger();
}

/**
 * Get audit report of all burn and liquidity actions
 */
export function getBurnAndLiquidityAudit() {
  const totalBurned = inMemoryLedger.reduce((sum, r) => sum + r.burned, 0);
  const totalLiquidity = inMemoryLedger.reduce((sum, r) => sum + r.liquidity, 0);
  const totalVolume = inMemoryLedger.reduce((sum, r) => sum + r.price, 0);

  return {
    totalVolume,
    totalBurned,
    totalLiquidity,
    burnRate: totalVolume > 0 ? (totalBurned / totalVolume) * 100 : 60,
    liquidityRate: totalVolume > 0 ? (totalLiquidity / totalVolume) * 100 : 40,
    transactionCount: inMemoryLedger.length,
    recentTransactions: inMemoryLedger.slice(-50).reverse(),
  };
}

/**
 * Calculate seasonal token rewards for players (§18.4)
 *
 * Pool of 10,000,000 $ITSIM distributed among the top 20% of active players.
 * Uses a non-linear steep curve where higher ranks receive exponentially more tokens.
 */
export function calculateSeasonRewards(
  players: Array<{ userId: string; seasonScore: number }>,
  pool = 10_000_000,
  topPercent = 20
): Array<{ userId: string; rank: number; reward: number; eligible: boolean }> {
  // Sort descending by season score
  const sorted = [...players].sort((a, b) => b.seasonScore - a.seasonScore);
  const totalPlayers = sorted.length;
  const eligibleCount = Math.max(1, Math.floor((totalPlayers * topPercent) / 100));

  // Weights along a steep power curve (rank ^ -0.6)
  const weights: number[] = [];
  let totalWeight = 0;
  for (let i = 0; i < eligibleCount; i++) {
    const w = 1 / Math.pow(i + 1, 0.6);
    weights.push(w);
    totalWeight += w;
  }

  return sorted.map((p, index) => {
    const rank = index + 1;
    const eligible = rank <= eligibleCount && p.seasonScore > 0;
    let reward = 0;
    if (eligible && totalWeight > 0) {
      reward = Math.round((weights[index] / totalWeight) * pool);
    }
    return {
      userId: p.userId,
      rank,
      reward,
      eligible,
    };
  });
}

/**
 * Record a successful season reward claim
 */
export function recordClaim(
  userId: string,
  seasonId: string,
  wallet: string,
  amount: number
): boolean {
  const key = `${userId}:${seasonId}`;
  if (inMemoryClaims.has(key)) {
    return false; // Already claimed
  }
  inMemoryClaims.set(key, { amount, claimedAt: Date.now(), wallet });
  persistClaims();
  return true;
}

/**
 * Check if a player has claimed reward for a season
 */
export function isSeasonClaimed(userId: string, seasonId: string): boolean {
  return inMemoryClaims.has(`${userId}:${seasonId}`);
}

export function getClaimInfo(userId: string, seasonId: string) {
  return inMemoryClaims.get(`${userId}:${seasonId}`) ?? null;
}
