import React from 'react';
import { useWallet } from '../services/wallet';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const { connect } = useWallet();

  if (!isOpen) return null;

  const handleSelect = async (name: 'phantom' | 'solflare' | 'mock') => {
    await connect(name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          ✕
        </button>

        <h3 className="text-lg font-bold text-white mb-2">Подключить Solana-кошелёк</h3>
        <p className="text-xs text-slate-400 mb-6">
          Выберите кошелёк для получения сезонных токенов $ITSIM и владения NFT.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => handleSelect('phantom')}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">👻</span>
              <div>
                <div className="font-semibold text-sm text-white group-hover:text-emerald-400 transition">
                  Phantom
                </div>
                <div className="text-xs text-slate-400">Популярный кошелёк для Solana</div>
              </div>
            </div>
            <span className="text-slate-500 group-hover:text-slate-300">→</span>
          </button>

          <button
            onClick={() => handleSelect('solflare')}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔆</span>
              <div>
                <div className="font-semibold text-sm text-white group-hover:text-emerald-400 transition">
                  Solflare
                </div>
                <div className="text-xs text-slate-400">Надёжный некастодиальный кошелёк</div>
              </div>
            </div>
            <span className="text-slate-500 group-hover:text-slate-300">→</span>
          </button>

          <button
            onClick={() => handleSelect('mock')}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/40 transition group text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧪</span>
              <div>
                <div className="font-semibold text-sm text-emerald-300">
                  Dev/Preview Wallet
                </div>
                <div className="text-xs text-emerald-500/80">Тестовый адрес без расширений</div>
              </div>
            </div>
            <span className="text-emerald-400">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
