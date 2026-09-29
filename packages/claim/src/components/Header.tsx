import React, { useState } from 'react';
import { useWallet } from '../services/wallet';
import { WalletModal } from './WalletModal';
import { UserProfile, SeasonInfo } from '../types';

interface HeaderProps {
  user?: UserProfile | null;
  season?: SeasonInfo | null;
}

export const Header: React.FC<HeaderProps> = ({ user, season }) => {
  const { connected, publicKey, disconnect } = useWallet();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-950/40 text-xl font-bold text-slate-950">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-lg tracking-tight">IT Life Simulator</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Claim &amp; Solana
              </span>
            </div>
            <div className="text-xs text-slate-400">
              {season ? season.title : 'Сезон 1: Play-to-Earn'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-slate-200">{user.name}</span>
              <span className="text-xs text-slate-500">ID: {user.id}</span>
            </div>
          )}

          {connected ? (
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono text-emerald-300">
                {publicKey?.slice(0, 4)}...{publicKey?.slice(-4)}
              </span>
              <button
                onClick={disconnect}
                className="text-xs text-slate-400 hover:text-rose-400 ml-1 transition"
                title="Отключить кошелёк"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-4 py-2 rounded-xl transition shadow-md shadow-emerald-900/30 flex items-center gap-2"
            >
              <span>Подключить кошелёк</span>
            </button>
          )}
        </div>
      </div>

      <WalletModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </header>
  );
};
