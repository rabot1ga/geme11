import React from 'react';
import { PlayerStats, SeasonInfo, UserProfile } from '../types';

interface DashboardProps {
  stats: PlayerStats | null;
  season: SeasonInfo | null;
  user: UserProfile | null;
  onGoClaim: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, season, user, onGoClaim }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Season Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-900/40 p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none text-9xl">
          🪙
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
            <span>● Активный сезон</span>
            <span>·</span>
            <span>Длительность: {season?.durationDays ?? 60} дней</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            {season?.title ?? 'Сезон 1: Рождение Легенды'}
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Все жизни, карьеры и решения в Telegram Mini App суммируются в Season Score.
            По итогам сезона топ-20% активных разработчиков получают распределение из призового пула
            в <span className="text-emerald-400 font-bold">10 000 000 $ITSIM</span>.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onGoClaim}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-950/60 transition"
            >
              Проверить награду сезона →
            </button>
            <div className="text-xs text-slate-400">
              Однотокенная модель Solana · Аудированный Metaplex смарт-контракт
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="text-xs font-medium text-slate-400 mb-1">Твой Season Score</div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {stats?.seasonScore.toLocaleString() ?? 0}
          </div>
          <div className="text-xs text-slate-500 mt-2">Сумма очков всех жизней в сезоне</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="text-xs font-medium text-slate-400 mb-1">Рейтинг Open Leaderboard</div>
          <div className="text-3xl font-extrabold text-white">
            #{stats?.openRank ?? 1}
            <span className="text-xs text-slate-500 font-normal ml-2">
              из {stats?.totalPlayers ?? 1}
            </span>
          </div>
          <div className="text-xs text-emerald-400/80 mt-2">
            {stats?.eligible ? '✓ Входит в топ-20% (квалифицирован)' : 'Копите очки для входа в топ-20%'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="text-xs font-medium text-slate-400 mb-1">Honest Leaderboard</div>
          <div className="text-3xl font-extrabold text-cyan-400">
            #{stats?.honestRank ?? 1}
          </div>
          <div className="text-xs text-slate-500 mt-2">Без учёта NFT-бонусов (чистый скилл)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="text-xs font-medium text-slate-400 mb-1">Пройдено жизней (NG+)</div>
          <div className="text-3xl font-extrabold text-purple-400">
            {stats?.lifeCount ?? 1}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Модификатор: {stats?.currentModifier ?? 'Стандартный'}
          </div>
        </div>
      </div>

      {/* Season Tokenomics & Allocation Section (§18) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>🪙</span>
          <span>Токеномика $ITSIM (Total Supply: 1 000 000 000)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="font-semibold text-emerald-400 text-sm mb-1">Season Rewards (20%)</div>
            <div className="text-slate-300">200 000 000 токенов</div>
            <p className="text-slate-400 mt-2 leading-relaxed">
              Пул текущего сезона — 10 000 000 $ITSIM. Распределяется нелинейно по крутой кривой среди топ-20% игроков.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="font-semibold text-cyan-400 text-sm mb-1">Ликвидность DEX (15%)</div>
            <div className="text-slate-300">150 000 000 токенов</div>
            <p className="text-slate-400 mt-2 leading-relaxed">
              40% от каждого открытого лутбокса в Vault автоматически направляется на пополнение пула ликвидности на DEX.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="font-semibold text-rose-400 text-sm mb-1">Механизм сжигания (Burn)</div>
            <div className="text-slate-300">Дефляционный цикл</div>
            <p className="text-slate-400 mt-2 leading-relaxed">
              60% токенов за открытие каждого лутбокса физически сжигаются на блокчейне Solana, сокращая циркулирующее предложение.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
