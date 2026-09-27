import React, { useState } from 'react';
import { PlayerState } from '@itsim/shared';
import { useGameStore } from '../../store/gameStore';
import { haptic } from '../../lib/telegram';

interface OptionItem {
  id: string;
  name: string;
  icon: string;
  requiredItem?: string;
  minHousing?: number;
  previewFile?: string;
}

const CHAIR_OPTIONS: OptionItem[] = [
  { id: 'chair_stool', name: 'Табурет', icon: '🪵' },
  { id: 'chair_office', name: 'Офисное кресло', icon: '🪑', requiredItem: 'office_chair' },
  { id: 'chair_leather', name: 'Кожаное кресло', icon: '🛋️' },
  { id: 'chair_gaming', name: 'Геймерское ковш', icon: '🏎️', requiredItem: 'gaming_chair' },
  { id: 'chair_herman_miller', name: 'Herman Miller Aeron', icon: '👑', requiredItem: 'herman_miller' },
];

const SETUP_OPTIONS: OptionItem[] = [
  { id: 'setup_laptop', name: 'Ноутбук', icon: '💻' },
  { id: 'setup_monitor', name: 'Монитор 24"', icon: '🖥️', requiredItem: 'cheap_pc' },
  { id: 'setup_dual', name: 'Двойной сетап', icon: '📊', requiredItem: 'gaming_pc' },
  { id: 'setup_ultrawide', name: 'Ultrawide 49" Curved', icon: '🌌', minHousing: 2 },
  { id: 'setup_macbook', name: 'MacBook Pro + Studio', icon: '🍎', requiredItem: 'macbook' },
];

const WINDOW_OPTIONS: OptionItem[] = [
  { id: 'default', name: 'Ночной город (дефолт)', icon: '🌃' },
  { id: 'window_day', name: 'Ясный день', icon: '☀️' },
  { id: 'window_sunset', name: 'Золотой закат', icon: '🌇' },
  { id: 'window_cyber', name: 'Киберпанк дождь', icon: '🌧️' },
];

const PET_OPTIONS: OptionItem[] = [
  { id: 'pet_none', name: 'Без питомца', icon: '🚫' },
  { id: 'pet_cat', name: 'Котик', icon: '🐱', requiredItem: 'pet_cat' },
  { id: 'pet_dog', name: 'Корги', icon: '🐶', requiredItem: 'pet_dog' },
  { id: 'pet_bulldog', name: 'Бульдог', icon: '🐕', requiredItem: 'pet_bulldog' },
  { id: 'pet_robo', name: 'Робопес', icon: '🤖', requiredItem: 'pet_robo' },
  { id: 'pet_parrot', name: 'Попугай', icon: '🦜', requiredItem: 'pet_parrot' },
  { id: 'pet_hamster', name: 'Хомяк', icon: '🐹', requiredItem: 'pet_hamster' },
  { id: 'pet_cactus', name: 'Кактус в горшке', icon: '🌵', requiredItem: 'pet_cactus' },
];

const DECOR_TOGGLES = [
  { id: 'whiteboard', name: 'Вайтборд с задачами', icon: '📋' },
  { id: 'neon_code', name: 'Неон «</> CODE»', icon: '💡' },
  { id: 'poster_python', name: 'Постер Python', icon: '🐍' },
  { id: 'poster_js', name: 'Постер JavaScript', icon: '📜' },
  { id: 'plant_monstera', name: 'Монстера в кадке', icon: '🌿', requiredItem: 'desk_plant' },
  { id: 'coffee_maker', name: 'Эспрессо-кофемашина', icon: '☕', requiredItem: 'coffee_maker' },
  { id: 'garland', name: 'Праздничная гирлянда', icon: '✨' },
];

const WALL_COLORS = [
  { id: '', name: 'Оригинал', color: 'transparent' },
  { id: '#382b26', name: 'Тёплый орех', color: '#382b26' },
  { id: '#1e293b', name: 'Скандинавский графит', color: '#1e293b' },
  { id: '#2e1065', name: 'Неоновый индиго', color: '#2e1065' },
  { id: '#064e3b', name: 'Хвойный зелёный', color: '#064e3b' },
];

export const FlatRoomEditor: React.FC<{ player: PlayerState }> = ({ player }) => {
  const [activeTab, setActiveTab] = useState<'chair' | 'setup' | 'window' | 'pet' | 'decor' | 'character' | 'walls'>('chair');
  const updateRoom = useGameStore((s) => s.updateRoom);
  const performAction = useGameStore((s) => s.performAction);

  const items = player.items ?? [];
  const roomSlots = (player.room?.slots as Record<string, string>) ?? {};
  const housingLevel = player.housingLevel ?? 0;

  const currentChair = roomSlots.chair ?? 'chair_leather';
  const currentSetup = roomSlots.setup ?? 'setup_laptop';
  const currentWindow = roomSlots.window ?? 'default';
  const currentPet = roomSlots.pet ?? 'pet_none';
  const showCharacter = roomSlots.showCharacter !== 'false';
  const activeDecor = new Set(roomSlots.decor ? roomSlots.decor.split(',') : ['neon_code']);

  const saveSlot = (key: string, value: string) => {
    haptic('tap');
    const newSlots = { ...roomSlots, [key]: value };
    updateRoom({ slots: newSlots });
    performAction('customize_room', { slot: key, entryId: value }).catch(() => {});
  };

  const toggleDecor = (decorId: string) => {
    haptic('tap');
    const set = new Set(activeDecor);
    if (set.has(decorId)) {
      set.delete(decorId);
    } else {
      set.add(decorId);
    }
    const listStr = Array.from(set).join(',');
    saveSlot('decor', listStr);
  };

  const isUnlocked = (opt: OptionItem) => {
    if (opt.requiredItem && !items.includes(opt.requiredItem)) {
      return false;
    }
    if (opt.minHousing && housingLevel < opt.minHousing) {
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-3">
      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'chair', label: 'Кресло', icon: '🪑' },
          { id: 'setup', label: 'Компьютер', icon: '💻' },
          { id: 'window', label: 'Окно', icon: '🪟' },
          { id: 'pet', label: 'Питомец', icon: '🐾' },
          { id: 'decor', label: 'Декор', icon: '🖼️' },
          { id: 'walls', label: 'Стены', icon: '🎨' },
          { id: 'character', label: 'Персонаж', icon: '👤' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              haptic('selection');
              setActiveTab(t.id as any);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1.5 transition-all ${
              activeTab === t.id
                ? 'bg-ink-100 text-ink-950 shadow-sm'
                : 'bg-ink-800 text-ink-300 hover:bg-ink-700'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Chair Tab */}
      {activeTab === 'chair' && (
        <div className="grid grid-cols-2 gap-2">
          {CHAIR_OPTIONS.map((c) => {
            const unlocked = isUnlocked(c);
            const isSelected = currentChair === c.id;
            return (
              <button
                key={c.id}
                onClick={() => unlocked && saveSlot('chair', c.id)}
                disabled={!unlocked}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-sky-400 bg-sky-950/40 text-white'
                    : unlocked
                    ? 'border-ink-700 bg-ink-800/80 text-ink-200 hover:border-ink-600'
                    : 'border-ink-800 bg-ink-900/60 text-ink-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{c.icon}</span>
                  {isSelected && <span className="text-xs text-sky-400 font-bold">✓ Выбрано</span>}
                  {!unlocked && <span className="text-2xs text-ochre-400">🔒 В магазине</span>}
                </div>
                <p className="text-xs font-medium leading-tight">{c.name}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Setup Tab */}
      {activeTab === 'setup' && (
        <div className="grid grid-cols-2 gap-2">
          {SETUP_OPTIONS.map((s) => {
            const unlocked = isUnlocked(s);
            const isSelected = currentSetup === s.id;
            return (
              <button
                key={s.id}
                onClick={() => unlocked && saveSlot('setup', s.id)}
                disabled={!unlocked}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-sky-400 bg-sky-950/40 text-white'
                    : unlocked
                    ? 'border-ink-700 bg-ink-800/80 text-ink-200 hover:border-ink-600'
                    : 'border-ink-800 bg-ink-900/60 text-ink-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{s.icon}</span>
                  {isSelected && <span className="text-xs text-sky-400 font-bold">✓ Выбрано</span>}
                  {!unlocked && <span className="text-2xs text-ochre-400">🔒 В магазине</span>}
                </div>
                <p className="text-xs font-medium leading-tight">{s.name}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Window Tab */}
      {activeTab === 'window' && (
        <div className="grid grid-cols-2 gap-2">
          {WINDOW_OPTIONS.map((w) => {
            const isSelected = currentWindow === w.id;
            return (
              <button
                key={w.id}
                onClick={() => saveSlot('window', w.id)}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-sky-400 bg-sky-950/40 text-white'
                    : 'border-ink-700 bg-ink-800/80 text-ink-200 hover:border-ink-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{w.icon}</span>
                  {isSelected && <span className="text-xs text-sky-400 font-bold">✓ Выбрано</span>}
                </div>
                <p className="text-xs font-medium leading-tight">{w.name}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Pet Tab */}
      {activeTab === 'pet' && (
        <div className="grid grid-cols-2 gap-2">
          {PET_OPTIONS.map((p) => {
            const unlocked = p.id === 'pet_none' || isUnlocked(p);
            const isSelected = currentPet === p.id;
            return (
              <button
                key={p.id}
                onClick={() => unlocked && saveSlot('pet', p.id)}
                disabled={!unlocked}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-sky-400 bg-sky-950/40 text-white'
                    : unlocked
                    ? 'border-ink-700 bg-ink-800/80 text-ink-200 hover:border-ink-600'
                    : 'border-ink-800 bg-ink-900/60 text-ink-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{p.icon}</span>
                  {isSelected && <span className="text-xs text-sky-400 font-bold">✓ Выбрано</span>}
                  {!unlocked && <span className="text-2xs text-ochre-400">🔒 В магазине</span>}
                </div>
                <p className="text-xs font-medium leading-tight">{p.name}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Decor Tab */}
      {activeTab === 'decor' && (
        <div className="space-y-1.5">
          {DECOR_TOGGLES.map((d) => {
            const unlocked = !d.requiredItem || items.includes(d.requiredItem);
            const enabled = activeDecor.has(d.id);
            return (
              <button
                key={d.id}
                onClick={() => unlocked && toggleDecor(d.id)}
                disabled={!unlocked}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  enabled
                    ? 'border-sky-400/80 bg-sky-950/30 text-white'
                    : unlocked
                    ? 'border-ink-700 bg-ink-800/70 text-ink-300 hover:border-ink-600'
                    : 'border-ink-800 bg-ink-900/40 text-ink-600 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{d.icon}</span>
                  <div>
                    <p className="text-xs font-medium leading-tight">{d.name}</p>
                    {!unlocked && <p className="text-2xs text-ochre-400">Требуется предмет из магазина</p>}
                  </div>
                </div>
                <span className={`text-xs font-bold ${enabled ? 'text-sky-300' : 'text-ink-500'}`}>
                  {enabled ? 'Включено' : 'Выкл'}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Walls Tab */}
      {activeTab === 'walls' && (
        <div className="grid grid-cols-2 gap-2">
          {WALL_COLORS.map((w) => {
            const isSelected = (player.room?.wallColor ?? '') === w.id;
            return (
              <button
                key={w.id}
                onClick={() => {
                  haptic('tap');
                  updateRoom({ wallColor: w.id || undefined });
                  performAction('customize_room', { slot: 'wallColor', entryId: w.id || '' }).catch(() => {});
                }}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  isSelected ? 'border-sky-400 bg-sky-950/40 text-white' : 'border-ink-700 bg-ink-800/80 text-ink-200'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full border border-ink-600 shrink-0"
                  style={{ backgroundColor: w.color === 'transparent' ? '#6b7280' : w.color }}
                />
                <span className="text-xs font-medium">{w.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Character Tab */}
      {activeTab === 'character' && (
        <div className="card space-y-3">
          <p className="text-xs text-ink-300">
            Отображение твоего пиксельного персонажа за рабочим местом в комнате:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => saveSlot('showCharacter', 'true')}
              className={`p-3 rounded-xl border text-center font-medium text-xs transition-all ${
                showCharacter ? 'border-sky-400 bg-sky-950/40 text-white' : 'border-ink-700 bg-ink-800 text-ink-400'
              }`}
            >
              🧑‍💻 Персонаж за столом
            </button>
            <button
              onClick={() => saveSlot('showCharacter', 'false')}
              className={`p-3 rounded-xl border text-center font-medium text-xs transition-all ${
                !showCharacter ? 'border-sky-400 bg-sky-950/40 text-white' : 'border-ink-700 bg-ink-800 text-ink-400'
              }`}
            >
              🛋️ Только интерьер
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
