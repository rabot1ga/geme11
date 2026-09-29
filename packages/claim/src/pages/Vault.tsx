import React, { useState, useEffect } from 'react';
import { VaultInfo } from '../types';
import { getVaultInfo, buyLootbox } from '../services/api';
import { ItemDefinition } from '@itsim/shared';

interface VaultProps {
  onItemUnlocked: () => void;
}

export const Vault: React.FC<VaultProps> = ({ onItemUnlocked }) => {
  const [vault, setVault] = useState<VaultInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [unboxed, setUnboxed] = useState<{
    item: ItemDefinition;
    rarity: string;
    burnAmount: number;
    liquidityAmount: number;
    message: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchInfo = async () => {
    try {
      const data = await getVaultInfo();
      setVault(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const handleOpen = async () => {
    setOpening(true);
    setErrorMsg(null);
    setUnboxed(null);

    try {
      const resp = await buyLootbox();
      setUnboxed(resp);
      await fetchInfo();
      onItemUnlocked();
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка открытия лутбокса');
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
          <span>📦</span>
          <span>Vault: Постоянный Token Sink</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Лутбоксы за токен $ITSIM
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Открывайте уникальные предметы и слои экипировки для аватара. 60% оплаты сжигается навсегда,
          а 40% пополняет пул ликвидности на DEX.
        </p>
      </div>

      {/* Main Unboxing Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Animated Lootbox Visual */}
        <div className="relative my-6 flex flex-col items-center">
          <div
            className={`w-36 h-36 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-600 flex items-center justify-center text-7xl shadow-2xl shadow-amber-950/80 border-4 border-amber-300/40 select-none transition-transform duration-500 ${
              opening ? 'animate-bounce scale-110' : 'hover:scale-105'
            }`}
          >
            🎁
          </div>
          <div className="mt-4 text-center">
            <span className="text-xl font-black text-white">
              {vault?.price ?? 500} {vault?.tokenSymbol ?? '$ITSIM'}
            </span>
            <div className="text-[11px] text-slate-500">Цена за 1 открытие</div>
          </div>
        </div>

        {/* Feedback / Result Card */}
        {unboxed && (
          <div className="w-full max-w-md bg-slate-950 border border-emerald-500/40 rounded-2xl p-6 mb-6 text-center shadow-xl animate-fade-in">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">
              🎉 Новый предмет получен!
            </div>
            <h4 className="text-xl font-bold text-white mb-2">{unboxed.item.name}</h4>
            <span className="inline-block text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-3">
              {unboxed.rarity}
            </span>
            <p className="text-xs text-slate-400 mb-4">{unboxed.item.description}</p>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 flex justify-around">
              <div>
                🔥 Сожжено: <span className="font-bold text-rose-400">{unboxed.burnAmount} $ITSIM</span>
              </div>
              <div>
                💧 В пул DEX: <span className="font-bold text-cyan-400">{unboxed.liquidityAmount} $ITSIM</span>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="w-full max-w-md bg-rose-950/40 border border-rose-800/50 rounded-xl p-3 text-xs text-rose-300 mb-6 text-center">
            {errorMsg}
          </div>
        )}

        {/* Action Button */}
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={handleOpen}
            disabled={opening || (vault ? vault.remainingToday <= 0 : false)}
            className={`w-full py-4 rounded-2xl text-base font-bold shadow-xl transition flex items-center justify-center gap-2 ${
              vault && vault.remainingToday <= 0
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : opening
                  ? 'bg-amber-600 text-white cursor-wait animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-950/60'
            }`}
          >
            <span>{opening ? 'Открытие сундука...' : 'Открыть лутбокс'}</span>
          </button>

          <div className="flex justify-between text-xs text-slate-400 px-2">
            <span>Осталось сегодня:</span>
            <span className="font-bold text-white">
              {vault?.remainingToday ?? 5} / {vault?.dailyLimit ?? 5}
            </span>
          </div>
        </div>
      </div>

      {/* Mechanics details (§12.3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pity timer card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
            <span>🛡️</span>
            <span>Pity-Timer (Гарант)</span>
          </div>
          <div className="text-2xl font-black text-cyan-400 my-2">
            {vault?.pityCounter ?? 0} / {vault?.pityLimit ?? 15}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Гарантированный редкий или легендарный предмет после 15 открытий без него. Счётчик сбрасывается при выпадении Rare+.
          </p>
        </div>

        {/* Probabilities card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
            <span>🎯</span>
            <span>Точные шансы выпадения</span>
          </div>
          <div className="space-y-2 mt-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Common:</span>
              <span className="font-bold text-slate-200">
                {((vault?.dropRates.common ?? 0.7) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyan-400">Rare:</span>
              <span className="font-bold text-cyan-300">
                {((vault?.dropRates.rare ?? 0.25) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-400">Legendary:</span>
              <span className="font-bold text-amber-300">
                {((vault?.dropRates.legendary ?? 0.05) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Burn / Liquidity split */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 text-sm font-bold text-white mb-2">
            <span>⚖️</span>
            <span>Сплит оплаты 60 / 40</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mt-2">
            <span className="text-rose-400 font-bold">60%</span> каждого платежа немедленно сжигается в Dead-кошелёк.
            <br />
            <span className="text-cyan-400 font-bold">40%</span> переводится на пополнение пула ликвидности Raydium/Orca DEX.
          </p>
        </div>
      </div>
    </div>
  );
};
