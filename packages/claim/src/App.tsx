import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Tabs, TabType } from './components/Tabs';
import { Dashboard } from './pages/Dashboard';
import { Claim } from './pages/Claim';
import { Inventory } from './pages/Inventory';
import { Mint } from './pages/Mint';
import { Marketplace } from './pages/Marketplace';
import { Vault } from './pages/Vault';
import { verifyToken } from './services/api';
import { ItemDefinition } from '@itsim/shared';
import { PlayerStats, SeasonInfo, UserProfile } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [token, setToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [season, setSeason] = useState<SeasonInfo | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [inventory, setInventory] = useState<ItemDefinition[]>([]);
  const [nftInventory, setNftInventory] = useState<string[]>([]);
  const [selectedMintItem, setSelectedMintItem] = useState<string | null>(null);

  const loadData = async (activeToken: string) => {
    try {
      const data = await verifyToken(activeToken);
      setUser(data.user);
      setSeason(data.season);
      setStats(data.stats);
      setInventory(data.inventory);
      setNftInventory(data.nftInventory);
    } catch (err) {
      console.warn('Bridge token verification failed:', err);
      // Fallback dev state if opened directly
      setSeason({
        seasonId: 'season_1',
        title: 'Сезон 1: Рождение Легенды',
        durationDays: 60,
        tokenSymbol: '$ITSIM',
        rewardPool: 10_000_000,
        activePlayerTopPercent: 20,
      });
      setUser({ id: 'dev_user', name: 'Dev Developer' });
      setStats({
        seasonScore: 1250,
        lifeCount: 2,
        currentModifier: 'born_in_moscow',
        openRank: 8,
        honestRank: 5,
        totalPlayers: 40,
        eligible: true,
        rewardAmount: 24500,
        alreadyClaimed: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      sessionStorage.setItem('claim_token', urlToken);
      loadData(urlToken);
    } else {
      const stored = sessionStorage.getItem('claim_token');
      if (stored) {
        setToken(stored);
        loadData(stored);
      } else {
        // Dev fallback token
        const devToken = 'dev_preview_token';
        setToken(devToken);
        loadData(devToken);
      }
    }
  }, []);

  const handleMintClick = (itemId: string) => {
    setSelectedMintItem(itemId);
    setCurrentTab('mint');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 animate-spin flex items-center justify-center text-xl mb-4">
          ⚡
        </div>
        <div className="text-sm font-medium text-slate-300">
          Синхронизация с сессией Telegram Mini App...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      <Header user={user} season={season} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <Tabs
          currentTab={currentTab}
          onChange={setCurrentTab}
          claimEligible={stats?.eligible && !stats?.alreadyClaimed}
        />

        {currentTab === 'dashboard' && (
          <Dashboard
            stats={stats}
            season={season}
            user={user}
            onGoClaim={() => setCurrentTab('claim')}
          />
        )}

        {currentTab === 'claim' && (
          <Claim
            stats={stats}
            season={season}
            token={token}
            onRefresh={() => token && loadData(token)}
          />
        )}

        {currentTab === 'inventory' && (
          <Inventory
            items={inventory}
            nftInventory={nftInventory}
            onMintClick={handleMintClick}
          />
        )}

        {currentTab === 'mint' && (
          <Mint
            items={inventory}
            nftInventory={nftInventory}
            token={token}
            onRefresh={() => token && loadData(token)}
            selectedItemId={selectedMintItem}
          />
        )}

        {currentTab === 'marketplace' && (
          <Marketplace
            items={inventory}
            nftInventory={nftInventory}
            token={token}
            onRefresh={() => token && loadData(token)}
          />
        )}

        {currentTab === 'vault' && (
          <Vault onItemUnlocked={() => token && loadData(token)} />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>IT Life Simulator v3.0 · Claim &amp; Solana Marketplace</div>
          <div className="flex gap-4">
            <span className="hover:text-slate-400">Metaplex Auction House</span>
            <span className="hover:text-slate-400">Tokenomics $ITSIM</span>
            <span className="hover:text-slate-400">Security Audit</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
