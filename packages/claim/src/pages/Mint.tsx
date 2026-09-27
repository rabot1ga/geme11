import React, { useState } from 'react';
import { ItemDefinition } from '@itsim/shared';
import { useWallet } from '../services/wallet';
import { mintItem } from '../services/api';

interface MintProps {
  items: ItemDefinition[];
  nftInventory: string[];
  token: string | null;
  onRefresh: () => void;
  selectedItemId?: string | null;
}

export const Mint: React.FC<MintProps> = ({
  items,
  nftInventory,
  token,
  onRefresh,
  selectedItemId,
}) => {
  const { connected, publicKey, connect } = useWallet();
  const [selectedId, setSelectedId] = useState<string>(
    selectedItemId || (items.find((it) => it.nftEligible && !nftInventory.includes(it.id))?.id ?? '')
  );
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const eligibleItems = items.filter((it) => it.nftEligible && !nftInventory.includes(it.id));
  const activeItem = items.find((it) => it.id === selectedId);

  const handleMint = async () => {
    if (!token || !publicKey || !selectedId) return;
    setLoading(true);
    setErrorMsg(null);
    setResultMsg(null);

    try {
      const resp = await mintItem(token, selectedId, publicKey);
      setResultMsg(resp.message);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка минта предмета');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-white">Минт NFT-предмета</h2>
        <p className="text-xs text-slate-400">
          Превратите игровой артефакт в подлинный NFT на блокчейне Solana через стандарт Metaplex Token Metadata.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Item selection & details */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Выберите предмет для минта:
            </label>

            {eligibleItems.length === 0 ? (
              <div className="text-sm text-slate-400 bg-slate-950/60 p-4 rounded-xl border border-slate-800 mb-4">
                У вас нет предметов, доступных для минта. Открывайте лутбоксы в Vault или покупайте редкие предметы в игре!
              </div>
            ) : (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white mb-6 focus:outline-none focus:border-emerald-500"
              >
                {eligibleItems.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.name} ({it.rarity?.toUpperCase() ?? 'COMMON'})
                  </option>
                ))}
              </select>
            )}

            {activeItem && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {activeItem.rarity}
                  </span>
                  <span className="text-xs text-slate-400">Слот: {activeItem.slot || 'предмет'}</span>
                </div>
                <div className="text-lg font-bold text-white">{activeItem.name}</div>
                <p className="text-xs text-slate-400">{activeItem.description}</p>

                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2 text-[11px]">
                  {activeItem.effects.energyBonus && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300">
                      +{activeItem.effects.energyBonus} к энергии
                    </span>
                  )}
                  {activeItem.effects.reputationBonus && (
                    <span className="px-2 py-0.5 rounded bg-amber-950/50 text-amber-300">
                      +{activeItem.effects.reputationBonus} к репутации
                    </span>
                  )}
                  {activeItem.effects.motivationBonus && (
                    <span className="px-2 py-0.5 rounded bg-blue-950/50 text-blue-300">
                      +{activeItem.effects.motivationBonus} к мотивации
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 text-xs text-slate-500">
            После минта предмет сохраняет визуальный слой на аватаре и может быть выставлен на продажу на Auction House.
          </div>
        </div>

        {/* Right: Network info & Action */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>⚡</span>
              <span>Параметры транзакции Solana</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Стандарт NFT:</span>
                <span className="font-semibold text-slate-200">Metaplex Token Metadata</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Сеть:</span>
                <span className="font-semibold text-emerald-400">Solana Mainnet-Beta</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Комиссия сети (Rent):</span>
                <span className="font-semibold text-slate-200">~0.015 SOL</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Получатель:</span>
                <span className="font-mono text-slate-300 truncate max-w-[180px]">
                  {connected ? publicKey : 'Не подключён'}
                </span>
              </div>
            </div>

            {resultMsg && (
              <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-3 text-xs text-emerald-300">
                {resultMsg}
              </div>
            )}
            {errorMsg && (
              <div className="bg-rose-950/40 border border-rose-800/50 rounded-xl p-3 text-xs text-rose-300">
                {errorMsg}
              </div>
            )}
          </div>

          <div className="mt-6">
            {!connected ? (
              <button
                onClick={() => connect('phantom')}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition"
              >
                Подключить кошелёк
              </button>
            ) : (
              <button
                onClick={handleMint}
                disabled={!activeItem || loading}
                className={`w-full font-bold py-3 rounded-xl transition ${
                  !activeItem || loading
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/50'
                }`}
              >
                {loading ? 'Минт в Metaplex...' : 'Сминтить NFT'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
