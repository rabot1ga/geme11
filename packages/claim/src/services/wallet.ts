import { create } from 'zustand';

export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  walletName: 'phantom' | 'solflare' | 'mock' | null;
  connect: (walletName: 'phantom' | 'solflare' | 'mock') => Promise<void>;
  disconnect: () => void;
}

export const useWallet = create<WalletState>((set) => ({
  connected: false,
  publicKey: null,
  walletName: null,

  connect: async (walletName) => {
    if (walletName === 'phantom') {
      const sol = (window as any).solana;
      if (sol && sol.isPhantom) {
        try {
          const resp = await sol.connect();
          set({
            connected: true,
            publicKey: resp.publicKey.toString(),
            walletName: 'phantom',
          });
          return;
        } catch (e) {
          console.warn('Phantom connect rejected:', e);
        }
      }
    } else if (walletName === 'solflare') {
      const sol = (window as any).solflare;
      if (sol) {
        try {
          await sol.connect();
          set({
            connected: true,
            publicKey: sol.publicKey.toString(),
            walletName: 'solflare',
          });
          return;
        } catch (e) {
          console.warn('Solflare connect rejected:', e);
        }
      }
    }

    // Dev/Sandbox Mock Wallet fallback for frictionless browser usage
    const mockAddr =
      localStorage.getItem('itsim_mock_wallet') ||
      `So1${Math.random().toString(36).slice(2, 9)}...${Math.random().toString(36).slice(2, 6)}`;
    localStorage.setItem('itsim_mock_wallet', mockAddr);

    set({
      connected: true,
      publicKey: mockAddr,
      walletName: 'mock',
    });
  },

  disconnect: () => {
    set({
      connected: false,
      publicKey: null,
      walletName: null,
    });
  },
}));
