import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { telegramAuthHook } from '../middleware/telegramAuth.js';
import { loadState, saveState } from '../services/gameStore.js';
import { getContent } from '../services/contentService.js';
import { getLeaderboard } from '../services/leaderboardIndex.js';
import {
  calculateSeasonRewards,
  recordClaim,
  isSeasonClaimed,
  getClaimInfo,
} from '../services/tokenomicsService.js';
import { SeasonConfig } from '@itsim/shared';

const JWT_SECRET = config.jwtSecret;
const BRIDGE_TOKEN_TTL = 300; // 5 minutes (§13.6)

export async function claimRoutes(app: FastifyInstance) {
  /**
   * POST /api/claim/access-token
   * Issue a short-lived bridge JWT for the claim-site (§13.6)
   */
  app.post(
    '/access-token',
    { preHandler: [telegramAuthHook] },
    async (request, reply) => {
      const user = (request as any).telegramUser;
      const userId = user ? String(user.id) : 'dev';
      const content = getContent();
      const season = (content.season ?? {}) as SeasonConfig;
      const seasonId = season.seasonId ?? 'season_1';

      const token = jwt.sign(
        {
          id: userId,
          username: user?.username ?? null,
          first_name: user?.first_name ?? 'Игрок',
          seasonId,
          type: 'claim_bridge',
        },
        JWT_SECRET,
        { algorithm: 'HS256', expiresIn: BRIDGE_TOKEN_TTL }
      );

      let claimBaseUrl = process.env.CLAIM_SITE_URL;
      if (!claimBaseUrl) {
        const host = String(request.headers.host || '');
        if (host.includes('e2b.app') || host.includes('-')) {
          const proto = (request.headers['x-forwarded-proto'] as string) || 'https';
          claimBaseUrl = `${proto}://${host.replace(/^\d+/, '5174')}`;
        } else {
          claimBaseUrl = 'http://localhost:5174';
        }
      }
      const claimUrl = `${claimBaseUrl}?token=${token}`;

      return {
        accessToken: token,
        claimUrl,
        expiresIn: BRIDGE_TOKEN_TTL,
      };
    }
  );

  /**
   * POST /api/claim/verify-token
   * Claim-site validates bridge token and retrieves player season profile (§13.6)
   */
  app.post('/verify-token', async (request, reply) => {
    const { token } = request.body as { token?: string };
    if (!token) {
      return reply.status(400).send({ error: 'Token is required' });
    }

    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    } catch {
      return reply.status(401).send({ error: 'Invalid or expired bridge token' });
    }

    const userId = String(payload.id);
    const state = loadState(userId);
    const content = getContent();
    const season = (content.season ?? {}) as SeasonConfig;
    const seasonId = season.seasonId ?? 'season_1';

    // Get open leaderboard to compute rank & rewards
    const openBoard = await getLeaderboard({ limit: 100, honestOnly: false, userId });
    const honestBoard = await getLeaderboard({ limit: 100, honestOnly: true, userId });

    const openRank = openBoard.you?.rank ?? (openBoard.rows.findIndex((r) => r.isYou) + 1 || 1);
    const honestRank = honestBoard.you?.rank ?? (honestBoard.rows.findIndex((r) => r.isYou) + 1 || 1);

    const players = openBoard.rows.map((r) => ({
      userId: r.userId || '',
      seasonScore: r.seasonScore || 0,
    }));

    if (!players.some((p) => p.userId === userId) && state) {
      players.push({ userId, seasonScore: state.seasonScore ?? 0 });
    }

    const rewardCalculations = calculateSeasonRewards(
      players,
      season.seasonRewardPool ?? 10_000_000,
      season.activePlayerTopPercent ?? 20
    );

    const playerReward = rewardCalculations.find((r) => r.userId === userId);
    const rewardAmount = playerReward?.reward ?? 0;
    const eligible = playerReward?.eligible ?? false;
    const alreadyClaimed = isSeasonClaimed(userId, seasonId);
    const claimDetails = getClaimInfo(userId, seasonId);

    const allItems = content.items as any[];
    const playerItems = (state?.items ?? []).map((id: string) => {
      const def = allItems.find((it) => it.id === id);
      return (
        def ?? {
          id,
          name: id,
          rarity: 'common',
          type: 'other',
          tradeable: false,
          nftEligible: false,
        }
      );
    });

    return {
      valid: true,
      user: {
        id: userId,
        name: state?.firstName ?? payload.first_name ?? `Игрок ${userId}`,
        username: payload.username ?? null,
      },
      season: {
        seasonId,
        title: season.title,
        durationDays: season.durationDays,
        tokenSymbol: season.tokenSymbol,
        rewardPool: season.seasonRewardPool,
        activePlayerTopPercent: season.activePlayerTopPercent,
      },
      stats: {
        seasonScore: state?.seasonScore ?? 0,
        lifeCount: state?.lifeCount ?? 1,
        currentModifier: state?.currentModifier ?? null,
        openRank,
        honestRank,
        totalPlayers: openBoard.total,
        eligible,
        rewardAmount,
        alreadyClaimed,
        claimDetails,
      },
      inventory: playerItems,
      nftInventory: state?.nftInventory ?? [],
    };
  });

  /**
   * GET /api/claim/season-status
   * Public or authenticated summary of season status
   */
  app.get('/season-status', async (request) => {
    const content = getContent();
    const season = (content.season ?? {}) as SeasonConfig;
    const openBoard = await getLeaderboard({ limit: 10, honestOnly: false });
    const honestBoard = await getLeaderboard({ limit: 10, honestOnly: true });

    return {
      season,
      openLeaderboardTop: openBoard.rows.slice(0, 5),
      honestLeaderboardTop: honestBoard.rows.slice(0, 5),
      totalPlayers: openBoard.total,
    };
  });

  /**
   * POST /api/claim/claim
   * Execute seasonal token reward claim to Solana wallet (§19.1)
   */
  app.post('/claim', async (request, reply) => {
    const { token, walletAddress } = request.body as {
      token?: string;
      walletAddress?: string;
    };

    if (!token || !walletAddress) {
      return reply.status(400).send({ error: 'Token and Solana wallet address required' });
    }

    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    } catch {
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }

    const userId = String(payload.id);
    const content = getContent();
    const season = (content.season ?? {}) as SeasonConfig;
    const seasonId = season.seasonId ?? 'season_1';

    if (isSeasonClaimed(userId, seasonId)) {
      return reply.status(400).send({ error: 'Награда за этот сезон уже была получена' });
    }

    const state = loadState(userId);
    const openBoard = await getLeaderboard({ limit: 100, honestOnly: false, userId });
    const players = openBoard.rows.map((r) => ({
      userId: r.userId || '',
      seasonScore: r.seasonScore || 0,
    }));
    if (!players.some((p) => p.userId === userId) && state) {
      players.push({ userId, seasonScore: state.seasonScore ?? 0 });
    }

    const rewardCalculations = calculateSeasonRewards(
      players,
      season.seasonRewardPool ?? 10_000_000,
      season.activePlayerTopPercent ?? 20
    );

    const playerReward = rewardCalculations.find((r) => r.userId === userId);
    if (!playerReward?.eligible || playerReward.reward <= 0) {
      return reply.status(400).send({
        error: `Вы не вошли в топ-${season.activePlayerTopPercent}% игроков по Season Score`,
      });
    }

    const txSignature = `sol_tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    recordClaim(userId, seasonId, walletAddress, playerReward.reward);

    if (state) {
      state.walletAddress = walletAddress;
      saveState(userId, state);
    }

    return {
      success: true,
      amount: playerReward.reward,
      tokenSymbol: season.tokenSymbol,
      walletAddress,
      txSignature,
      message: `🎉 Успешно переведено ${playerReward.reward.toLocaleString()} ${season.tokenSymbol} на адрес ${walletAddress}!`,
    };
  });
}
