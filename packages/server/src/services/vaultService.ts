import { getContent } from './contentService.js';
import { loadState, saveState } from './gameStore.js';
import { ItemDefinition, ItemRarity, SeasonConfig } from '@itsim/shared';
import { logBurnAndLiquidity } from './tokenomicsService.js';

export interface LootboxOpenResult {
  item: ItemDefinition;
  rarity: ItemRarity;
  pityCounter: number;
  openedToday: number;
  totalOpened: number;
  price: number;
  burnAmount: number;
  liquidityAmount: number;
}

export function getVaultInfo(userId: string) {
  const content = getContent();
  const season = (content.season ?? {}) as SeasonConfig;
  const state = loadState(userId);

  const currentDay = state?.currentDay ?? 1;
  const lootboxState = state?.lootboxState ?? {
    openedToday: 0,
    lastOpenDay: currentDay,
    pityCounter: 0,
    totalOpened: 0,
  };

  const openedToday =
    lootboxState.lastOpenDay === currentDay ? lootboxState.openedToday : 0;

  const price = season.baseLootboxPrice ?? 500;
  const dropRates = season.dropRates ?? { common: 0.7, rare: 0.25, legendary: 0.05 };
  const dailyLimit = season.maxLootboxesPerDay ?? 5;
  const pityLimit = season.pityTimerLimit ?? 15;

  return {
    seasonId: season.seasonId ?? 'season_1',
    tokenSymbol: season.tokenSymbol ?? '$ITSIM',
    price,
    burnPercent: season.burnPercent ?? 60,
    liquidityPercent: season.liquidityPercent ?? 40,
    dropRates,
    dailyLimit,
    openedToday,
    remainingToday: Math.max(0, dailyLimit - openedToday),
    pityCounter: lootboxState.pityCounter ?? 0,
    pityLimit,
    guaranteedNext: (lootboxState.pityCounter ?? 0) >= pityLimit - 1,
  };
}

export function openLootbox(
  userId: string,
  rng: () => number = Math.random
): { result?: LootboxOpenResult; error?: string } {
  const state = loadState(userId);
  if (!state) {
    return { error: 'Игрок не найден' };
  }

  const content = getContent();
  const season = (content.season ?? {}) as SeasonConfig;
  const currentDay = state.currentDay ?? 1;

  if (!state.lootboxState) {
    state.lootboxState = {
      openedToday: 0,
      lastOpenDay: currentDay,
      pityCounter: 0,
      totalOpened: 0,
    };
  }

  // Daily limit reset check
  if (state.lootboxState.lastOpenDay !== currentDay) {
    state.lootboxState.openedToday = 0;
    state.lootboxState.lastOpenDay = currentDay;
  }

  const dailyLimit = season.maxLootboxesPerDay ?? 5;
  if (state.lootboxState.openedToday >= dailyLimit) {
    return { error: `Достигнут дневной лимит открытия лутбоксов (${dailyLimit}/день)` };
  }

  const price = season.baseLootboxPrice ?? 500;
  const burnPercent = season.burnPercent ?? 60;
  const liquidityPercent = season.liquidityPercent ?? 40;
  const burnAmount = Math.round((price * burnPercent) / 100);
  const liquidityAmount = price - burnAmount;

  const pityLimit = season.pityTimerLimit ?? 15;
  let rolledRarity: ItemRarity = 'common';

  // Pity timer check: guaranteed rare or legendary after 15 opens without
  if (state.lootboxState.pityCounter >= pityLimit) {
    rolledRarity = rng() < 0.2 ? 'legendary' : 'rare';
  } else {
    const roll = rng();
    const commonRate = season.dropRates?.common ?? 0.70;
    const rareRate = season.dropRates?.rare ?? 0.25;

    if (roll < commonRate) {
      rolledRarity = 'common';
    } else if (roll < commonRate + rareRate) {
      rolledRarity = 'rare';
    } else {
      rolledRarity = 'legendary';
    }
  }

  // Candidate items pool
  const allItems = (content.items ?? []) as ItemDefinition[];
  const pool = allItems.filter(
    (it) => it.nftEligible && (it.rarity === rolledRarity || (!it.rarity && rolledRarity === 'common'))
  );

  // Fallback to any NFT item if specific pool is empty
  const candidatePool = pool.length > 0 ? pool : allItems.filter((it) => it.nftEligible);
  if (candidatePool.length === 0) {
    return { error: 'Пул предметов лутбокса пуст' };
  }

  const chosenItem = candidatePool[Math.floor(rng() * candidatePool.length)];

  // Update pity counter
  if (rolledRarity === 'rare' || rolledRarity === 'legendary') {
    state.lootboxState.pityCounter = 0;
  } else {
    state.lootboxState.pityCounter += 1;
  }

  state.lootboxState.openedToday += 1;
  state.lootboxState.totalOpened += 1;

  // Add item to inventory and nft inventory if not already owned
  if (!state.items.includes(chosenItem.id)) {
    state.items.push(chosenItem.id);
  }
  if (!state.nftInventory) state.nftInventory = [];
  if (!state.nftInventory.includes(chosenItem.id)) {
    state.nftInventory.push(chosenItem.id);
  }

  // Record burn / liquidity split in tokenomics ledger
  logBurnAndLiquidity({
    playerId: userId,
    price,
    burned: burnAmount,
    liquidity: liquidityAmount,
    itemId: chosenItem.id,
    itemName: chosenItem.name,
    rarity: rolledRarity,
    timestamp: Date.now(),
  });

  saveState(userId, state);

  return {
    result: {
      item: chosenItem,
      rarity: rolledRarity,
      pityCounter: state.lootboxState.pityCounter,
      openedToday: state.lootboxState.openedToday,
      totalOpened: state.lootboxState.totalOpened,
      price,
      burnAmount,
      liquidityAmount,
    },
  };
}
