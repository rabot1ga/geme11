import React from 'react';
import { PlayerState } from '@itsim/shared';

export interface ModularFlatOfficeProps {
  player: PlayerState;
  company?: {
    id: string;
    name: string;
    size: string; // 'outsource' | 'startup' | 'product' | 'enterprise'
  };
  mood?: string;
  className?: string;
}

const SIZE_LABELS: Record<string, string> = {
  enterprise: '🏢 Корпорация',
  startup: '🚀 Стартап',
  product: '💡 Продуктовая IT-компания',
  outsource: '🛠 Аутсорс / Гараж',
};

export const ModularFlatOffice: React.FC<ModularFlatOfficeProps> = ({
  player,
  company,
  mood = 'neutral',
  className = '',
}) => {
  const size = company?.size ?? 'product';

  // Map company size to the flat pixel art office background
  let bgFile = '/art/office/office_product.webp';
  if (size === 'enterprise') bgFile = '/art/office/office_enterprise.webp';
  else if (size === 'startup') bgFile = '/art/office/office_cowork.webp';
  else if (size === 'outsource') bgFile = '/art/office/office_garage.webp';

  return (
    <div
      className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-ink-800 bg-[#161922] shadow-2xl select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* 1. Base 4:3 Flat Pixel Art Office Background */}
      <img
        src={bgFile}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/art/office/office_product.webp';
        }}
        alt="Офис компании"
        className="absolute inset-0 w-full h-full object-cover select-none"
        draggable={false}
      />

      {/* 2. Mood Atmosphere Overlay */}
      {mood === 'deadline' && (
        <div className="absolute inset-0 pointer-events-none mix-blend-color-burn opacity-35 bg-red-950/60 animate-pulse" />
      )}
      {mood === 'friday' && (
        <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-25 bg-amber-500/30" />
      )}
      {mood === 'night' && (
        <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-40 bg-blue-950" />
      )}

      {/* 3. Developer Character At Their Workstation ("Персонаж за работой") */}
      <div className="absolute left-[31%] bottom-[13%] w-[23%] pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)] z-10">
        <img
          src="/art/room/character/char_dev_sitting.webp"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/art/room/character/char_dev_sitting.png';
          }}
          alt="Ты за работой"
          className="w-full h-auto object-contain animate-fade-in"
          draggable={false}
        />
      </div>

      {/* 4. Company & Grade Badges */}
      <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-20">
        <div className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-medium text-sky-300 shadow-md flex items-center gap-1.5">
          <span>{SIZE_LABELS[size] ?? '🏢 Офис'}</span>
        </div>
        {company?.name && (
          <div className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-white shadow-md">
            {company.name}
          </div>
        )}
      </div>

      {/* 5. Team Presence Indicator */}
      <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] text-ink-300 shadow-md flex items-center gap-1.5 z-20">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Команда онлайн</span>
      </div>

      {/* 6. Kanban Board Live Widget Chip */}
      <div className="absolute left-[40%] top-[22%] px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-emerald-400/50 text-[9px] font-mono text-emerald-300 shadow-sm flex items-center gap-1">
        <span>⚡</span> Sprint Active
      </div>
    </div>
  );
};
