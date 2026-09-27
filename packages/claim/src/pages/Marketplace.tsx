import React, { useState, useEffect } from 'react';
import { ItemDefinition } from '@itsim/shared';
import { MarketplaceItem } from '../types';
import { useWallet } from '../services/wallet';
import {
  getMarketplaceListings,
  buyMarketplaceItem,
  listMarketplaceItem,
} from '../services/api';

interface MarketplaceProps {
  items: ItemDefinition[];
  nftInventory: string[];
  token: string | null;
  onRefresh: () => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  items,
  token,
  onRefresh,
}) => {
  const { connected, publicKey, connect } = useWallet();
  const [listings, setListings] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  // Listing modal / form state
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedSellItemId, setSelectedSellItemId] = useState<string>('');
  const [sellPriceSol, setSellPriceSol] = useState<number>(1.0);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const resp = await getMarketplaceListings();
      setListings(resp.listings);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleBuy = async (listingId: string) => {
    if (!token || !publicKey) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const resp = await buyMarketplaceItem(token, listingId, publicKey);
      setFeedback({ type: 'ok', msg: resp.message });
      await fetchListings();
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'err', msg: err.message || 'Ошибка покупки' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleList = async () => {
    if (!token || !publicKey || !selectedSellItemId || sellPriceSol <= 0) return;
    setActionLoading(true);
    setFeedback(null);
    try {
      const resp = await listMarketplaceItem(token, selectedSellItemId, sellPriceSol, publicKey);
      setFeedback({ type: 'ok', msg: resp.message });
      setSellModalOpen(false);
      await fetchListings();
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'err', msg: err.message || 'Ошибка размещения листинга' });
    } finally {
      setActionLoading(false);
    }
  };

  const tradeablePlayerItems = items.filter((it) => it.tradeable);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Metaplex Auction House</h2>
          <p className="text-xs text-slate-400">
            Децентрализованный маркетплейс предметов и NFT. Сделки осуществляются напрямую в SOL.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSellModalOpen(true)}
            className="text-xs font-bold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition flex items-center gap-2"
          >
            <span>🏷️</span>
            <span>Продать предмет</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center gap-3 ${
            feedback.type === 'ok'
              ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
          }`}
        >
          <span>{feedback.type === 'ok' ? '✓' : '⚠️'}</span>
          <span>{feedback.msg}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500">Загрузка листингов Auction House...</div>
      ) : listings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          На рынке пока нет активных листингов. Будьте первым, кто выставит редкий предмет!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {listing.item.rarity || 'rare'}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">
                    {listing.priceSol} SOL
                  </span>
                </div>

                <h3 className="font-bold text-base text-white mb-1">{listing.item.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {listing.item.description}
                </p>

                <div className="text-xs text-slate-500 space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span>Продавец:</span>
                    <span className="text-slate-300">{listing.sellerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Кошелёк:</span>
                    <span className="font-mono text-slate-400">
                      {listing.sellerWallet.slice(0, 4)}...{listing.sellerWallet.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                {!connected ? (
                  <button
                    onClick={() => connect('phantom')}
                    className="w-full text-xs font-semibold py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  >
                    Подключите кошелёк для покупки
                  </button>
                ) : (
                  <button
                    onClick={() => handleBuy(listing.id)}
                    disabled={actionLoading}
                    className="w-full text-xs font-bold py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md shadow-emerald-950/50"
                  >
                    Купить за {listing.priceSol} SOL
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sell Modal */}
      {sellModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setSellModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-white mb-2">Выставить предмет на продажу</h3>
            <p className="text-xs text-slate-400 mb-6">
              Предмет будет выставлен на Metaplex Auction House с оплатой в SOL.
            </p>

            {tradeablePlayerItems.length === 0 ? (
              <div className="text-sm text-slate-400 bg-slate-950 p-4 rounded-xl mb-6 border border-slate-800">
                В вашем инвентаре нет предметов, доступных для торговли.
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Предмет:
                  </label>
                  <select
                    value={selectedSellItemId}
                    onChange={(e) => setSelectedSellItemId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Выберите предмет --</option>
                    {tradeablePlayerItems.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.name} ({it.rarity?.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Цена в SOL:
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={sellPriceSol}
                    onChange={(e) => setSellPriceSol(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setSellModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
              >
                Отмена
              </button>
              <button
                onClick={handleList}
                disabled={!selectedSellItemId || sellPriceSol <= 0 || actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition shadow-lg shadow-emerald-950/50 disabled:opacity-50"
              >
                Разместить листинг
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
