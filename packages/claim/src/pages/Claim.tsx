import React, { useState } from 'react';
import { PlayerStats, SeasonInfo } from '../types';
import { useWallet } from '../services/wallet';
import { claimTokens } from '../services/api';

interface ClaimProps {
  stats: PlayerStats | null;
  season: SeasonInfo | null;
  token: string | null;
  onRefresh: () => void;
}

export const Claim: React.FC<ClaimProps> = ({ stats, season, token, onRefresh }) => {
  const { connected, publicKey, connect } = useWallet();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClaim = async () => {
    if (!token || !publicKey) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const resp = await claimTokens(token, publicKey);
      setSuccessMsg(resp.message);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка клейма токенов');
    } finally {
      setLoading(false);
    }
  };

  const eligible = stats?.eligible ?? false;
  const alreadyClaimed = stats?.alreadyClaimed ?? false;
  const rewardAmount = stats?.rewardAmount ?? 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🎁</span>
          <div>
            <h2 className="text-2xl font-bold text-white">Клейм сезонной награды</h2>
            <p className="text-xs text-slate-400">
              {season?.title ?? 'Сезон 1'} · Пул распределения $ITSIM
            </p>
          </div>
        </div>

        {/* Status card */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
            <div>
              <div className="text-xs text-slate-400">Статус квалификации</div>
              <div className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
                {eligible ? (
                  <>
                    <span className="text-emerald-400">✓ Квалифицирован</span>
                    <span className="text-xs font-normal text-slate-500">
                      (ранг #{stats?.openRank} в топ-20%)
                    </span>
                  </>
                ) : (
                  <span className="text-amber-400">⏳ Не вошёл в топ-20% активных игроков</span>
                )}
              </div>
            </div>

            <div className="sm:text-right">
              <div className="text-xs text-slate-400">Доступно к получению</div>
              <div className="text-2xl font-black text-emerald-400">
                {rewardAmount.toLocaleString()} {season?.tokenSymbol ?? '$ITSIM'}
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Адрес Solana для начисления:</span>
            <span className="font-mono text-slate-300">
              {connected
                ? `${publicKey?.slice(0, 6)}...${publicKey?.slice(-6)}`
                : 'Кошелёк не подключён'}
            </span>
          </div>
        </div>

        {/* Claim status / feedback */}
        {alreadyClaimed && (
          <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-2xl p-4 text-emerald-300 text-sm mb-6 flex items-center gap-3">
            <span className="text-xl">✅</span>
            <div>
              <div className="font-semibold">Награда за этот сезон уже успешно получена!</div>
              <div className="text-xs text-emerald-400/80 mt-0.5">
                Адрес: {stats?.claimDetails?.wallet || publicKey}
              </div>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-2xl p-4 text-emerald-300 text-sm mb-6 flex items-center gap-3">
            <span className="text-xl">🎉</span>
            <div>{successMsg}</div>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-950/40 border border-rose-800/50 rounded-2xl p-4 text-rose-300 text-sm mb-6 flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>{errorMsg}</div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {!connected ? (
            <button
              onClick={() => connect('phantom')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-950/50 transition"
            >
              Подключить кошелёк для клейма
            </button>
          ) : (
            <button
              onClick={handleClaim}
              disabled={!eligible || alreadyClaimed || loading}
              className={`w-full font-bold py-3.5 rounded-xl shadow-lg transition ${
                !eligible || alreadyClaimed
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  : loading
                    ? 'bg-emerald-700 text-white cursor-wait animate-pulse'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50'
              }`}
            >
              {loading
                ? 'Отправка транзакции на Solana...'
                : alreadyClaimed
                  ? 'Награда уже зачислена'
                  : !eligible
                    ? 'Клейм недоступен (не в топ-20%)'
                    : `Получить ${rewardAmount.toLocaleString()} ${season?.tokenSymbol ?? '$ITSIM'}`}
            </button>
          )}

          <p className="text-[11px] text-center text-slate-500">
            Все транзакции подписываются на блокчейне Solana. Токены $ITSIM можно использовать в Vault для открытия лутбоксов или продавать на DEX.
          </p>
        </div>
      </div>
    </div>
  );
};
