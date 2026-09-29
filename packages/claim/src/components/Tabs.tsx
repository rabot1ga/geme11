import React from 'react';

export type TabType = 'dashboard' | 'claim' | 'inventory' | 'mint' | 'marketplace' | 'vault';

interface TabsProps {
  currentTab: TabType;
  onChange: (tab: TabType) => void;
  claimEligible?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({ currentTab, onChange, claimEligible }) => {
  const tabs: Array<{ id: TabType; label: string; icon: string; badge?: string }> = [
    { id: 'dashboard', label: 'Сезон', icon: '📊' },
    {
      id: 'claim',
      label: 'Клейм $ITSIM',
      icon: '🎁',
      badge: claimEligible ? 'Доступно' : undefined,
    },
    { id: 'inventory', label: 'Инвентарь', icon: '🎒' },
    { id: 'mint', label: 'Минт NFT', icon: '💎' },
    { id: 'marketplace', label: 'Маркетплейс', icon: '🏛️' },
    { id: 'vault', label: 'Vault (Лутбокс)', icon: '📦' },
  ];

  return (
    <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl mx-auto mb-8 shadow-inner">
      {tabs.map((t) => {
        const active = currentTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap relative ${
              active
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {t.badge && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full animate-bounce">
                {t.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
