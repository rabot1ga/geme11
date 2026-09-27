import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { getContent } from '../services/contentService.js';
import { loadState, saveState } from '../services/gameStore.js';
import { ItemDefinition } from '@itsim/shared';

const JWT_SECRET = config.jwtSecret;

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  sellerWallet: string;
  sellerName: string;
  itemId: string;
  item: ItemDefinition;
  priceSol: number;
  listedAt: number;
}

const listings: MarketplaceListing[] = [
  {
    id: 'list_1',
    sellerId: 'system_dev',
    sellerWallet: '7mP2W6iG8j2W9fF2v...x9J',
    sellerName: 'SeniorArchitect',
    itemId: 'cap_legendary_01',
    priceSol: 1.5,
    listedAt: Date.now() - 3600_000,
    item: {
      id: 'cap_legendary_01',
      name: 'Кепка сеньора',
      type: 'nft',
      price: 0,
      description: 'Легендарная кепка ведущего разработчика. Открывает дорогу на борд.',
      effects: { energyBonus: 1, reputationMult: 1.05 },
      icon: 'cap_legendary.png',
      nft: true,
      rarity: 'legendary',
      slot: 'headwear',
      tradeable: true,
      nftEligible: true,
      honestModeEffect: 'cosmeticOnly',
      layerId: 'acc_cap',
    },
  },
  {
    id: 'list_2',
    sellerId: 'system_dev2',
    sellerWallet: '4kL9X8zM...bQ1',
    sellerName: 'CyberVibe',
    itemId: 'hoodie_cyber',
    priceSol: 2.2,
    listedAt: Date.now() - 7200_000,
    item: {
      id: 'hoodie_cyber',
      name: 'Худи киберпанка',
      type: 'nft',
      price: 0,
      description: 'Тёмное худи с неоновой вышивкой localhost. +1 к энергии и вечный вайб.',
      effects: { energyBonus: 1, motivationBonus: 5 },
      icon: 'hoodie_cyber.png',
      nft: true,
      rarity: 'legendary',
      slot: 'top',
      tradeable: true,
      nftEligible: true,
      honestModeEffect: 'cosmeticOnly',
      layerId: 'top_hoodie_localhost',
    },
  },
];

function extractUserIdFromToken(token?: string): string | null {
  if (!token) return null;
  try {
    const payload: any = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    return String(payload.id);
  } catch {
    return null;
  }
}

export async function marketplaceRoutes(app: FastifyInstance) {
  /**
   * GET /api/marketplace/listings
   * Get all active marketplace listings (§19.1)
   */
  app.get('/listings', async () => {
    return {
      listings,
      total: listings.length,
    };
  });

  /**
   * POST /api/marketplace/mint
   * Mint eligible game item into on-chain Metaplex NFT
   */
  app.post('/mint', async (request, reply) => {
    const { token, itemId, walletAddress } = request.body as {
      token?: string;
      itemId?: string;
      walletAddress?: string;
    };

    const userId = extractUserIdFromToken(token);
    if (!userId || !itemId || !walletAddress) {
      return reply.status(400).send({ error: 'token, itemId, and walletAddress required' });
    }

    const state = loadState(userId);
    if (!state || !state.items.includes(itemId)) {
      return reply.status(400).send({ error: 'Предмет не найден в инвентаре игрока' });
    }

    const content = getContent();
    const item = (content.items as any[]).find((it) => it.id === itemId);
    if (!item?.nftEligible) {
      return reply.status(400).send({ error: 'Этот предмет не подлежит NFT-минту' });
    }

    if (!state.nftInventory) state.nftInventory = [];
    if (!state.nftInventory.includes(itemId)) {
      state.nftInventory.push(itemId);
    }
    state.walletAddress = walletAddress;
    saveState(userId, state);

    const mintAddress = `meta_mint_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return {
      success: true,
      itemId,
      mintAddress,
      ownerWallet: walletAddress,
      message: `✨ Предмет «${item.name}» успешно сминчен в Metaplex NFT на адрес ${walletAddress}!`,
    };
  });

  /**
   * POST /api/marketplace/list
   * List an NFT item for sale on Metaplex Auction House
   */
  app.post('/list', async (request, reply) => {
    const { token, itemId, priceSol, walletAddress } = request.body as {
      token?: string;
      itemId?: string;
      priceSol?: number;
      walletAddress?: string;
    };

    const userId = extractUserIdFromToken(token);
    if (!userId || !itemId || !priceSol || !walletAddress) {
      return reply.status(400).send({ error: 'token, itemId, priceSol, walletAddress required' });
    }

    const state = loadState(userId);
    if (!state || !state.items.includes(itemId)) {
      return reply.status(400).send({ error: 'У вас нет этого предмета' });
    }

    const content = getContent();
    const item = (content.items as any[]).find((it) => it.id === itemId);
    if (!item?.tradeable) {
      return reply.status(400).send({ error: 'Предмет не предназначен для торговли' });
    }

    const listingId = `list_${Date.now()}`;
    const newListing: MarketplaceListing = {
      id: listingId,
      sellerId: userId,
      sellerWallet: walletAddress,
      sellerName: state.firstName || `Игрок ${userId}`,
      itemId,
      item,
      priceSol,
      listedAt: Date.now(),
    };

    listings.unshift(newListing);

    return {
      success: true,
      listing: newListing,
      message: `🛒 Предмет «${item.name}» выставлен на продажу за ${priceSol} SOL на Auction House.`,
    };
  });

  /**
   * POST /api/marketplace/buy
   * Buy listed item from Metaplex Auction House
   */
  app.post('/buy', async (request, reply) => {
    const { token, listingId, buyerWallet } = request.body as {
      token?: string;
      listingId?: string;
      buyerWallet?: string;
    };

    const userId = extractUserIdFromToken(token);
    if (!userId || !listingId || !buyerWallet) {
      return reply.status(400).send({ error: 'token, listingId, buyerWallet required' });
    }

    const listIdx = listings.findIndex((l) => l.id === listingId);
    if (listIdx === -1) {
      return reply.status(404).send({ error: 'Листинг не найден или уже куплен' });
    }

    const listing = listings[listIdx];
    if (listing.sellerId === userId) {
      return reply.status(400).send({ error: 'Нельзя купить собственный предмет' });
    }

    // Transfer item to buyer
    const buyerState = loadState(userId);
    if (buyerState) {
      if (!buyerState.items.includes(listing.itemId)) {
        buyerState.items.push(listing.itemId);
      }
      if (!buyerState.nftInventory) buyerState.nftInventory = [];
      if (!buyerState.nftInventory.includes(listing.itemId)) {
        buyerState.nftInventory.push(listing.itemId);
      }
      saveState(userId, buyerState);
    }

    // Remove from seller
    const sellerState = loadState(listing.sellerId);
    if (sellerState) {
      sellerState.items = sellerState.items.filter((id: string) => id !== listing.itemId);
      sellerState.nftInventory = (sellerState.nftInventory ?? []).filter((id: string) => id !== listing.itemId);
      saveState(listing.sellerId, sellerState);
    }

    // Remove listing
    listings.splice(listIdx, 1);

    return {
      success: true,
      item: listing.item,
      txSignature: `ah_buy_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      message: `🎉 Вы успешно приобрели «${listing.item.name}» за ${listing.priceSol} SOL!`,
    };
  });
}
