import React, { useState } from 'react';
import { PlayerState } from '@itsim/shared';
import { useGameStore } from '../../store/gameStore';
import { haptic } from '../../lib/telegram';
import {
  buildFlatRoomComposition,
  FlatRoomComposition,
  HOUSING_NAMES,
  WINDOW_OPTIONS,
  CHAIR_OPTIONS,
  SETUP_OPTIONS,
  ATMO_OPTIONS,
  DECOR_OPTIONS,
  PET_OPTIONS,
  WALL_COLORS,
  SlotOption,
} from './flatRoomComposition';

export const ModularRoomEditor: React.FC<{ player: PlayerState }> = ({ player }) => {
  const performAction = useGameStore((s) => s.performAction);
  const currentComposition = buildFlatRoomComposition(player);

  const [activeTab, setActiveTab] = useState<
    'housing' | 'window' | 'chair' | 'setup' | 'atmo' | 'decor' | 'pet' | 'character'
  >('housing');

  const maxHousing = Math.min(4, Math.max(0, player.housingLevel ?? 0));
  const ownedItems = player.items ?? [];

  const handleSelectSlot = async (slot: string, entryId: string | null) => {
    haptic('selection');
    await performAction('customize_room', { slot, entryId });
  };

  const handleSelectWallColor = async (colorHex: string) => {
    haptic('selection');
    await performAction('customize_room', {
      slot: 'wallColor',
      entryId: colorHex === 'transparent' ? null : colorHex,
    });
  };

  const TABS = [
    { id: 'housing', name: 'Стены', emoji: '🏠' },
    { id: 'window', name: 'Окно', emoji: '🪟' },
    { id: 'chair', name: 'Кресло', emoji: '💺' },
    { id: 'setup', name: 'Сетап', emoji: '💻' },
    { id: 'atmo', name: 'Уют', emoji: '🌿' },
    { id: 'decor', name: 'Декор', emoji: '🖼️' },
    { id: 'pet', name: 'Питомец', emoji: '🐾' },
    { id: 'character', name: 'Персонаж', emoji: '🧑‍💻' },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Category selector pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar touch-target">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              haptic('tap');
              setActiveTab(t.id);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === t.id
                ? 'bg-amber-400 text-amber-950 shadow-md font-bold'
                : 'bg-ink-800 text-ink-300 hover:bg-ink-700'
            }`}
          >
            <span>{t.emoji}</span>
            <span>{t.name}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Housing Level & Wall Colors */}
      {activeTab === 'housing' && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-2">
              Планировка квартиры (открыто {maxHousing + 1}/5)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[0, 1, 2, 3, 4].map((level) => {
                const unlocked = level <= maxHousing;
                const active = currentComposition.bg === `bg_${level}`;
                return (
                  <button
                    key={level}
                    disabled={!unlocked}
                    onClick={() => handleSelectSlot('bg', `bg_${level}`)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      active
                        ? 'border-amber-400 bg-amber-400/10 text-white'
                        : unlocked
                        ? 'border-ink-700 bg-ink-800/80 hover:border-ink-600 text-ink-200'
                        : 'border-ink-800/50 bg-ink-900/40 opacity-50 cursor-not-allowed text-ink-500'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold flex items-center gap-1.5">
                        <span>{level === 4 ? '👑' : level === 3 ? '🏢' : '🏠'}</span>
                        <span>{HOUSING_NAMES[level]}</span>
                      </p>
                      <p className="text-2xs text-ink-400 mt-0.5">
                        {unlocked ? (active ? '✓ Выбрано' : 'Доступно') : 'Улучши жильё в магазине'}
                      </p>
                    </div>
                    {active && <span className="text-amber-400 font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-2">Оттенок стен</p>
            <div className="flex flex-wrap gap-2">
              {WALL_COLORS.map((col) => {
                const isSelected =
                  col.hex === 'transparent'
                    ? !currentComposition.wallColor || currentComposition.wallColor === 'transparent'
                    : currentComposition.wallColor === col.hex;
                return (
                  <button
                    key={col.id}
                    onClick={() => handleSelectWallColor(col.hex)}
                    className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/20 text-white'
                        : 'border-ink-700 bg-ink-800 text-ink-300 hover:border-ink-600'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: col.hex === 'transparent' ? '#372822' : col.hex }}
                    />
                    <span>{col.name}</span>
                    {isSelected && <span className="text-amber-400">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Window View */}
      {activeTab === 'window' && (
        <OptionGrid
          options={WINDOW_OPTIONS}
          activeId={currentComposition.window}
          onSelect={(id) => handleSelectSlot('window', id)}
        />
      )}

      {/* Tab 3: Chair */}
      {activeTab === 'chair' && (
        <OptionGrid
          options={CHAIR_OPTIONS}
          activeId={currentComposition.chair}
          onSelect={(id) => handleSelectSlot('chair', id)}
          isUnlocked={(id) => {
            if (id === 'chair_herman_miller') return ownedItems.includes('herman_miller');
            if (id === 'chair_gaming') return ownedItems.includes('gaming_chair');
            if (id === 'chair_throne') return player.grade === 'cto' || player.grade === 'teamlead';
            return true;
          }}
          unlockHint={(id) => {
            if (id === 'chair_herman_miller') return 'Купи Herman Miller в магазине';
            if (id === 'chair_gaming') return 'Купи геймерское кресло';
            if (id === 'chair_throne') return 'Достигни грейда Teamlead/CTO';
            return '';
          }}
        />
      )}

      {/* Tab 4: Computer Setup */}
      {activeTab === 'setup' && (
        <OptionGrid
          options={SETUP_OPTIONS}
          activeId={currentComposition.setup}
          onSelect={(id) => handleSelectSlot('setup', id)}
          isUnlocked={(id) => {
            if (id === 'setup_macbook') return ownedItems.includes('macbook');
            if (id === 'setup_gaming') return ownedItems.includes('gaming_pc');
            return true;
          }}
          unlockHint={(id) => {
            if (id === 'setup_macbook') return 'Купи MacBook в магазине';
            if (id === 'setup_gaming') return 'Купи игровой ПК в магазине';
            return '';
          }}
        />
      )}

      {/* Tab 5: Atmosphere & Props */}
      {activeTab === 'atmo' && (
        <OptionGrid
          options={ATMO_OPTIONS}
          activeId={currentComposition.atmosphere}
          onSelect={(id) => handleSelectSlot('atmosphere', id)}
          isUnlocked={(id) => {
            if (id === 'atmo_plant') return ownedItems.includes('desk_plant') || maxHousing >= 1;
            if (id === 'atmo_coffee') return ownedItems.includes('coffee_maker');
            return true;
          }}
          unlockHint={(id) => {
            if (id === 'atmo_plant') return 'Купи растение в магазине';
            if (id === 'atmo_coffee') return 'Купи кофемашину в магазине';
            return '';
          }}
        />
      )}

      {/* Tab 6: Decor */}
      {activeTab === 'decor' && (
        <OptionGrid
          options={DECOR_OPTIONS}
          activeId={currentComposition.decor}
          onSelect={(id) => handleSelectSlot('decor', id)}
        />
      )}

      {/* Tab 7: Pet */}
      {activeTab === 'pet' && (
        <OptionGrid
          options={PET_OPTIONS}
          activeId={currentComposition.pet ?? 'pet_none'}
          onSelect={(id) => handleSelectSlot('pet', id)}
          isUnlocked={(id) => {
            if (id === 'pet_none') return true;
            return ownedItems.includes(id);
          }}
          unlockHint={() => 'Купи питомца в магазине 🐾'}
        />
      )}

      {/* Tab 8: Character in Room */}
      {activeTab === 'character' && (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-ink-400">
            Отображение персонажа в комнате
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSelectSlot('character', 'sitting')}
              className={`p-3 rounded-xl border text-left transition-all ${
                currentComposition.showCharacter
                  ? 'border-amber-400 bg-amber-400/15 text-white'
                  : 'border-ink-700 bg-ink-800 text-ink-300 hover:border-ink-600'
              }`}
            >
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <span>🧑‍💻</span>
                <span>За работой</span>
              </p>
              <p className="text-2xs text-ink-400 mt-1">Сидит в кресле и кодит</p>
            </button>

            <button
              onClick={() => handleSelectSlot('character', 'hidden')}
              className={`p-3 rounded-xl border text-left transition-all ${
                !currentComposition.showCharacter
                  ? 'border-amber-400 bg-amber-400/15 text-white'
                  : 'border-ink-700 bg-ink-800 text-ink-300 hover:border-ink-600'
              }`}
            >
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <span>🛋</span>
                <span>Только интерьер</span>
              </p>
              <p className="text-2xs text-ink-400 mt-1">Комната без персонажа</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const OptionGrid: React.FC<{
  options: SlotOption[];
  activeId: string;
  onSelect: (id: string) => void;
  isUnlocked?: (id: string) => boolean;
  unlockHint?: (id: string) => string;
}> = ({ options, activeId, onSelect, isUnlocked = () => true, unlockHint = () => '' }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((opt) => {
        const unlocked = isUnlocked(opt.id);
        const active = activeId === opt.id;
        const hint = !unlocked ? unlockHint(opt.id) : '';
        return (
          <button
            key={opt.id}
            disabled={!unlocked}
            onClick={() => onSelect(opt.id)}
            className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
              active
                ? 'border-amber-400 bg-amber-400/10 text-white shadow-sm'
                : unlocked
                ? 'border-ink-700 bg-ink-800/80 hover:border-ink-600 text-ink-200'
                : 'border-ink-800/50 bg-ink-900/40 opacity-50 cursor-not-allowed text-ink-500'
            }`}
          >
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-sm font-semibold flex items-center gap-1.5 truncate">
                <span className="shrink-0">{opt.emoji}</span>
                <span className="truncate">{opt.name}</span>
              </p>
              <p className="text-2xs text-ink-400 mt-0.5 truncate">
                {unlocked ? (active ? '✓ Активно' : 'Выбрать') : hint || 'Заблокировано'}
              </p>
            </div>
            {active && <span className="text-amber-400 font-bold shrink-0">✓</span>}
            {!unlocked && <span className="text-ink-600 text-xs shrink-0">🔒</span>}
          </button>
        );
      })}
    </div>
  );
};
