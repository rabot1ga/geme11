import { FastifyInstance } from 'fastify';
import { telegramAuthHook } from '../middleware/telegramAuth.js';
import { getVaultInfo, openLootbox } from '../services/vaultService.js';
import { getBurnAndLiquidityAudit } from '../services/tokenomicsService.js';

export async function vaultRoutes(app: FastifyInstance) {
  app.addHook('preHandler', telegramAuthHook);

  /**
   * GET /api/vault/info
   * Current price, odds, pity counter, limits
   */
  app.get('/info', async (request, reply) => {
    const user = (request as any).telegramUser;
    const userId = user ? String(user.id) : 'dev';
    const info = getVaultInfo(userId);
    return info;
  });

  /**
   * POST /api/vault/purchase
   * Open lootbox for $ITSIM token (with burn/liquidity split & pity-timer)
   */
  app.post('/purchase', async (request, reply) => {
    const user = (request as any).telegramUser;
    const userId = user ? String(user.id) : 'dev';

    const { result, error } = openLootbox(userId);
    if (error) {
      return reply.status(400).send({ error });
    }

    return {
      success: true,
      ...result,
      message: `🎉 Открыт предмет: ${result!.item.name} (${result!.rarity.toUpperCase()})! ${result!.burnAmount} $ITSIM сожжено, ${result!.liquidityAmount} $ITSIM добавлено в ликвидность DEX.`,
    };
  });

  /**
   * GET /api/vault/audit
   * Public audit of burn & liquidity splits
   */
  app.get('/audit', async () => {
    return getBurnAndLiquidityAudit();
  });
}
