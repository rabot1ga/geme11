import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { buildServer } from '../index.js';
import { saveState } from '../services/gameStore.js';
import { loadContent } from '../services/contentService.js';
import { createNewPlayer } from '@itsim/shared';

const DATA_DIR = mkdtempSync(join(tmpdir(), 'itsim-claim-test-'));
process.env.DATA_DIR = DATA_DIR;

afterAll(() => rmSync(DATA_DIR, { recursive: true, force: true }));

describe('Claim, Vault & Marketplace Routes (ТЗ v3.0 §12.3, §13.5, §18, §19)', () => {
  beforeEach(() => {
    rmSync(DATA_DIR, { recursive: true, force: true });
    loadContent();
    const p = createNewPlayer();
    p.items = ['cap_legendary_01'];
    saveState('1', p as any);
    saveState('dev', p as any);
  });

  it('generates a short-lived bridge access-token for claim site (§13.6)', async () => {
    const server = await buildServer();
    const resp = await server.inject({
      method: 'POST',
      url: '/api/claim/access-token',
      headers: {
        authorization: 'Bearer dev-token',
      },
    });

    expect(resp.statusCode).toBe(200);
    const body = resp.json();
    expect(body.accessToken).toBeTruthy();
    expect(body.claimUrl).toContain('token=');
    expect(body.expiresIn).toBe(300);
  });

  it('validates bridge token and returns season profile (§13.6)', async () => {
    const server = await buildServer();
    const tokenResp = await server.inject({
      method: 'POST',
      url: '/api/claim/access-token',
    });
    const { accessToken } = tokenResp.json();

    const verifyResp = await server.inject({
      method: 'POST',
      url: '/api/claim/verify-token',
      payload: { token: accessToken },
    });

    expect(verifyResp.statusCode).toBe(200);
    const body = verifyResp.json();
    expect(body.valid).toBe(true);
    expect(body.season.seasonId).toBe('season_1');
    expect(body.stats).toBeDefined();
    expect(body.stats.openRank).toBeGreaterThanOrEqual(1);
  });

  it('returns public season status summary', async () => {
    const server = await buildServer();
    const resp = await server.inject({
      method: 'GET',
      url: '/api/claim/season-status',
    });

    expect(resp.statusCode).toBe(200);
    const body = resp.json();
    expect(body.season.seasonId).toBe('season_1');
    expect(body.season.totalSupply).toBe(1_000_000_000);
    expect(body.season.seasonRewardPool).toBe(10_000_000);
  });

  it('serves vault info with price and drop rates (§12.3)', async () => {
    const server = await buildServer();
    const resp = await server.inject({
      method: 'GET',
      url: '/api/vault/info',
    });

    expect(resp.statusCode).toBe(200);
    const body = resp.json();
    expect(body.price).toBe(500);
    expect(body.tokenSymbol).toBe('$ITSIM');
    expect(body.dropRates.common).toBe(0.7);
    expect(body.dropRates.rare).toBe(0.25);
    expect(body.dropRates.legendary).toBe(0.05);
    expect(body.burnPercent).toBe(60);
    expect(body.liquidityPercent).toBe(40);
  });

  it('opens a lootbox with exact 60% burn / 40% liquidity split (§12.3)', async () => {
    const server = await buildServer();
    const resp = await server.inject({
      method: 'POST',
      url: '/api/vault/purchase',
    });

    expect(resp.statusCode).toBe(200);
    const body = resp.json();
    expect(body.success).toBe(true);
    expect(body.item).toBeDefined();
    expect(body.rarity).toBeDefined();
    expect(body.burnAmount).toBe(300); // 60% of 500
    expect(body.liquidityAmount).toBe(200); // 40% of 500
    expect(body.burnAmount + body.liquidityAmount).toBe(500);
  });

  it('records split in the public audit ledger', async () => {
    const server = await buildServer();
    await server.inject({ method: 'POST', url: '/api/vault/purchase' });

    const auditResp = await server.inject({ method: 'GET', url: '/api/vault/audit' });
    expect(auditResp.statusCode).toBe(200);
    const audit = auditResp.json();
    expect(audit.transactionCount).toBeGreaterThan(0);
    expect(audit.totalBurned).toBeGreaterThanOrEqual(300);
    expect(audit.totalLiquidity).toBeGreaterThanOrEqual(200);
  });

  it('serves marketplace listings (§19.1)', async () => {
    const server = await buildServer();
    const resp = await server.inject({
      method: 'GET',
      url: '/api/marketplace/listings',
    });

    expect(resp.statusCode).toBe(200);
    const body = resp.json();
    expect(body.listings).toBeInstanceOf(Array);
    expect(body.total).toBeGreaterThan(0);
  });

  it('mints an eligible NFT item to Solana wallet (§19.1)', async () => {
    const server = await buildServer();

    // Prepare player with NFT item in inventory
    const p = createNewPlayer();
    p.items = ['cap_legendary_01'];
    saveState('dev', p as any);

    const tokenResp = await server.inject({ method: 'POST', url: '/api/claim/access-token' });
    const { accessToken } = tokenResp.json();

    const mintResp = await server.inject({
      method: 'POST',
      url: '/api/marketplace/mint',
      payload: {
        token: accessToken,
        itemId: 'cap_legendary_01',
        walletAddress: 'So11111111111111111111111111111111111111112',
      },
    });

    expect(mintResp.statusCode).toBe(200);
    const body = mintResp.json();
    expect(body.success).toBe(true);
    expect(body.mintAddress).toBeTruthy();
  });
});
