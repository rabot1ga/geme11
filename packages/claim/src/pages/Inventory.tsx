import React from 'react';
import { ItemDefinition } from '@itsim/shared';

interface InventoryProps {
  items: ItemDefinition[];
  nftInventory: string[];
  onMintClick: (itemId: string) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ items, nftInventory, onMintClick }) => {
  const getRarityBadge = (rarity?: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'rare':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'epic':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-700/30 text-slate-400 border-slate-700/50';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Инвентарь предметов</h2>
          <p className="text-xs text-slate-400">
            Предметы, заработанные и приобретённые в симуляторе. Предметы со статусом NFT Eligible можно минтить на кошелёк.
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          Всего предметов: <span className="font-bold text-white">{items.length}</span> · Заминчено: <span className="font-bold text-emerald-400">{nftInventory.length}</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          В инвентаре пока нет предметов. Зарабатывайте деньги и покупайте предметы в магазине Mini App!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const isMinted = nftInventory.includes(item.id);
            const canMint = item.nftEligible && !isMinted;

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getRarityBadge(
                        item.rarity
                      )}`}
                    >
                      {item.rarity || 'common'}
                    </span>

                    {isMinted ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <span>✓</span> Заминчен
                      </span>
                    ) : item.nftEligible ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        NFT Eligible
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">In-game only</span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-white mb-1">{item.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.description}</p>

                  {/* Effects breakdown */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.effects.energyBonus && (
                      <span className="text-[11px] px-2 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
                        +{item.effects.energyBonus} ⚡ энергии
                      </span>
                    )}
                    {item.effects.reputationBonus && (
                      <span className="text-[11px] px-2 py-0.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300">
                        +{item.effects.reputationBonus} ⭐ репутации
                      </span>
                    )}
                    {item.effects.motivationBonus && (
                      <span className="text-[11px] px-2 py-0.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-blue-300">
                        +{item.effects.motivationBonus} 😊 мотивации
                      </span>
                    )}
                    {item.effects.xpBonus && (
                      <span className="text-[11px] px-2 py-0.5 rounded-lg bg-purple-950/40 border border-purple-800/40 text-purple-300">
                        +{(item.effects.xpBonus * 100).toFixed(0)}% XP
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">ID: {item.id}</span>
                  {canMint && (
                    <button
                      onClick={() => onMintClick(item.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
                    >
                      Сминтить в NFT →
                    </button>
                  )}
                  {isMinted && (
                    <span className="text-xs text-emerald-400 font-medium">В блокчейне</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
