import React from 'react';
import { PlayerState } from '@itsim/shared';

interface FlatOfficeProps {
  player: PlayerState;
  company?: { id: string; name: string; size: string };
  mood?: string | { label: string; emoji: string };
  onTalkNpc?: (npcId: string) => void;
  className?: string;
}

const SIZE_LABELS: Record<string, string> = {
  enterprise: '🏢 Корпорация',
  startup: '🚀 Стартап',
  product: '📦 Продукт',
  outsource: '🌐 Аутсорс',
};

const MOOD_META: Record<string, { label: string; emoji: string }> = {
  night: { label: 'Ночной овертайм', emoji: '🌙' },
  deadline: { label: 'Горящий дедлайн', emoji: '🔥' },
  friday: { label: 'Пятничный чилл', emoji: '🍻' },
  retro: { label: 'Ретроспектива', emoji: '📝' },
  normal: { label: 'Рабочий день', emoji: '💼' },
};

const COLLEAGUES = [
  { id: 'teamlead', name: 'Тимлид', emoji: '🧑‍💼', role: 'Архитектура и код-ревью', left: '26%', bottom: '28%' },
  { id: 'junior_colleague', name: 'Джун', emoji: '🙋', role: 'Спрашивает про git merge', left: '52%', bottom: '26%' },
  { id: 'toxic_senior', name: 'Токсичный сеньор', emoji: '🧔', role: 'Ворчит про легаси', left: '68%', bottom: '28%' },
];

export const FlatOffice: React.FC<FlatOfficeProps> = ({
  player,
  company,
  mood,
  onTalkNpc,
  className = '',
}) => {
  const relationships = player.relationships ?? {};
  const moodObj = typeof mood === 'string' ? (MOOD_META[mood] ?? { label: mood, emoji: '💼' }) : mood;

  return (
    <div
      className={`flat-office-container relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-ink-700 bg-ink-950 shadow-lg select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* 1. Office Pixel-Art Background */}
      <img
        src="/art/office-flat/office_base.webp"
        alt="Офис компании"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />

      {/* 2. Top Status Bar Overlay */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-30">
        <span className="px-2 py-0.5 rounded bg-ink-900/85 backdrop-blur-sm border border-ink-700 text-2xs font-semibold text-white">
          {company ? (SIZE_LABELS[company.size] ?? company.size) : '🏢 Офис'}
        </span>
        {moodObj && (
          <span className="px-2 py-0.5 rounded bg-ink-900/85 backdrop-blur-sm border border-ink-700 text-2xs font-medium text-ink-200 flex items-center gap-1">
            <span>{moodObj.emoji}</span>
            <span>{moodObj.label}</span>
          </span>
        )}
      </div>

      <div className="absolute top-2.5 right-2.5 z-30">
        <span className="px-2 py-0.5 rounded bg-ink-900/85 backdrop-blur-sm border border-ink-700 text-2xs font-mono text-sky-300">
          Грейд: {player.grade ?? 'unemployed'}
        </span>
      </div>

      {/* 3. Interactive Office Hotspots */}
      {/* Whiteboard / Kanban hotspot */}
      <div
        className="absolute left-[1%] top-[14%] w-[13%] h-[36%] cursor-pointer rounded-lg hover:ring-2 hover:ring-sky-400/50 transition-all z-20"
        title="Канбан-доска спринта"
      />

      {/* Water cooler hotspot */}
      <div
        className="absolute right-[1%] bottom-[6%] w-[11%] h-[40%] cursor-pointer rounded-lg hover:ring-2 hover:ring-sky-400/50 transition-all z-20"
        title="Кулер с водой и сплетнями"
      />

      {/* Coffee machine hotspot */}
      <div
        className="absolute left-[1%] bottom-[20%] w-[12%] h-[24%] cursor-pointer rounded-lg hover:ring-2 hover:ring-sky-400/50 transition-all z-20"
        title="Офисная кофемашина"
      />

      {/* 4. Colleague Presence Indicators */}
      {COLLEAGUES.map((colleague) => {
        const val = relationships[colleague.id] ?? 0;
        const isGood = val > 15;
        const isBad = val < -15;
        return (
          <div
            key={colleague.id}
            onClick={() => onTalkNpc?.(colleague.id)}
            style={{ left: colleague.left, bottom: colleague.bottom }}
            className="absolute z-20 flex flex-col items-center cursor-pointer group"
          >
            {/* Floating Tag */}
            <div className="px-1.5 py-0.5 rounded bg-ink-900/90 border border-ink-700 shadow-sm text-[10px] font-medium text-ink-200 flex items-center gap-1 group-hover:scale-110 group-hover:border-sky-400 transition-transform">
              <span>{colleague.emoji}</span>
              <span className="font-semibold">{colleague.name}</span>
              <span className={`text-[9px] font-mono ${isGood ? 'text-moss-300' : isBad ? 'text-clay-300' : 'text-ink-400'}`}>
                {val > 0 ? `+${val}` : val}
              </span>
            </div>
          </div>
        );
      })}

      {/* 5. Player at their workstation */}
      <div className="absolute left-[30%] bottom-[4%] w-[26%] z-20 pointer-events-none">
        <span className="sr-only">Твоё рабочее место</span>
      </div>
    </div>
  );
};
