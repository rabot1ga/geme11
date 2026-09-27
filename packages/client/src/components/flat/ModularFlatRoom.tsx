import React from 'react';
import { PlayerState } from '@itsim/shared';
import { buildFlatRoomComposition, FlatRoomComposition, HOUSING_NAMES } from './flatRoomComposition';

export interface ModularFlatRoomProps {
  player: PlayerState;
  customComposition?: FlatRoomComposition;
  onClick?: () => void;
  className?: string;
}

function petAccessory(wear?: string[]): string | null {
  if (!wear || wear.length === 0) return null;
  if (wear.includes('pet_crown')) return '👑';
  if (wear.includes('pet_glasses')) return '🕶️';
  if (wear.includes('pet_bow')) return '🎀';
  return null;
}

export const ModularFlatRoom: React.FC<ModularFlatRoomProps> = ({
  player,
  customComposition,
  onClick,
  className = '',
}) => {
  const composition = customComposition || buildFlatRoomComposition(player);
  const housingLevel = Math.min(4, Math.max(0, player.housingLevel ?? 0));
  const petAcc = petAccessory(player.items);

  // Background file
  const bgFile = `/art/room/bg/${composition.bg}.webp`;

  return (
    <div
      onClick={onClick}
      className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-ink-800 bg-[#1e1410] shadow-2xl select-none group ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* 1. Base Room Background (4:3 Flat Pixel Art) */}
      <img
        src={bgFile}
        onError={(e) => {
          // Fallback to primary room art
          (e.currentTarget as HTMLImageElement).src = '/art/story-v1/room.webp';
        }}
        alt="Комната разработчика"
        className="absolute inset-0 w-full h-full object-cover select-none"
        draggable={false}
      />

      {/* 2. Custom Wall Color Overlay Tint */}
      {composition.wallColor && composition.wallColor !== 'transparent' && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-color opacity-45"
          style={{ backgroundColor: composition.wallColor }}
        />
      )}

      {/* 3. Dynamic Window Atmosphere / View Overlay */}
      {composition.window === 'window_sunset' && (
        <div
          className="absolute right-[3%] top-[8%] w-[19%] h-[55%] pointer-events-none mix-blend-screen opacity-60 rounded-sm"
          style={{
            background: 'linear-gradient(180deg, rgba(255,100,50,0.6) 0%, rgba(200,50,120,0.4) 60%, rgba(50,20,80,0.7) 100%)',
          }}
        />
      )}
      {composition.window === 'window_day' && (
        <div
          className="absolute right-[3%] top-[8%] w-[19%] h-[55%] pointer-events-none mix-blend-overlay opacity-60 rounded-sm"
          style={{
            background: 'linear-gradient(180deg, #70b4ff 0%, #bde0fe 60%, #e0f2fe 100%)',
          }}
        />
      )}
      {composition.window === 'window_rain' && (
        <div
          className="absolute right-[3%] top-[8%] w-[19%] h-[55%] pointer-events-none mix-blend-screen opacity-50 rounded-sm overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(20,40,70,0.8) 0%, rgba(10,80,120,0.6) 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:6px_12px] animate-pulse" />
        </div>
      )}

      {/* 4. Wall Decor (Neon Sign / Whiteboard) */}
      {composition.decor === 'decor_neon' && (
        <div className="absolute left-[38%] top-[18%] px-2.5 py-1 rounded bg-black/60 border border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.8)] flex items-center gap-1.5 animate-pulse">
          <span className="font-mono font-bold text-xs text-emerald-300 tracking-wider">&lt;/&gt; CODE</span>
        </div>
      )}
      {composition.decor === 'decor_whiteboard' && (
        <div className="absolute left-[34%] top-[16%] w-[14%] h-[16%] bg-[#f3f4f6] rounded-[2px] border border-amber-950/60 shadow-md p-1 flex flex-col justify-between">
          <div className="flex gap-0.5">
            <span className="w-1.5 h-1.5 bg-yellow-400 rounded-2xs" />
            <span className="w-1.5 h-1.5 bg-pink-400 rounded-2xs" />
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-2xs" />
          </div>
          <div className="space-y-0.5">
            <div className="h-0.5 bg-ink-600 rounded-full w-full" />
            <div className="h-0.5 bg-ink-400 rounded-full w-4/5" />
          </div>
        </div>
      )}
      {composition.decor === 'decor_garland' && (
        <div className="absolute left-[5%] top-[10%] right-[25%] flex justify-between pointer-events-none">
          {['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#eab308'].map((col, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full shadow-[0_0_6px_currentColor] animate-ping"
              style={{ backgroundColor: col, color: col, animationDuration: `${1.2 + (i % 3) * 0.4}s` }}
            />
          ))}
        </div>
      )}

      {/* 5. Chair Style Variant (when customized or high grade) */}
      {composition.chair === 'chair_gaming' && !composition.showCharacter && (
        <div className="absolute left-[34%] bottom-[16%] w-[22%] pointer-events-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]">
          <img
            src="/iso/chair_gaming.png"
            alt="Геймерское кресло"
            className="w-full h-auto object-contain scale-[2.2] origin-bottom"
          />
        </div>
      )}
      {composition.chair === 'chair_herman_miller' && !composition.showCharacter && (
        <div className="absolute left-[36%] bottom-[18%] px-2 py-0.5 rounded bg-black/60 border border-sky-400 text-[10px] text-sky-200 font-mono shadow-md">
          Aeron Mesh
        </div>
      )}
      {composition.chair === 'chair_throne' && !composition.showCharacter && (
        <div className="absolute left-[36%] bottom-[18%] px-2 py-0.5 rounded bg-amber-900/80 border border-amber-300 text-[10px] text-amber-200 font-mono shadow-lg flex items-center gap-1">
          <span>👑</span> CTO Throne
        </div>
      )}

      {/* 6. Hardware & Monitor Setup Variant Overlays */}
      {composition.setup === 'setup_ultrawide' && (
        <div className="absolute left-[13%] top-[34%] w-[21%] h-[15%] rounded-[2px] bg-sky-950/90 border border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.7)] p-1 flex flex-col justify-between pointer-events-none">
          <div className="text-[7px] font-mono text-sky-300 leading-none overflow-hidden space-y-0.5">
            <div className="text-emerald-400">const server = fastify();</div>
            <div className="text-cyan-300">await server.listen();</div>
          </div>
          <div className="flex justify-between items-center text-[6px] text-sky-400 border-t border-sky-800/80 pt-0.5">
            <span>34" CURVED</span>
            <span className="text-emerald-400">144Hz</span>
          </div>
        </div>
      )}
      {composition.setup === 'setup_macbook' && (
        <div className="absolute left-[32%] top-[41%] w-[9%] h-[8%] rounded-[1px] bg-slate-900 border border-slate-400 shadow-md p-0.5 flex flex-col justify-center items-center pointer-events-none">
          <span className="text-[6px] text-slate-300 font-mono"> M3 Max</span>
        </div>
      )}

      {/* 7. Developer Character ("Персонаж в комнате") */}
      {composition.showCharacter && (
        <div className="absolute left-[29%] bottom-[12%] w-[26%] pointer-events-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)] z-10 transition-transform">
          <img
            src="/art/room/character/char_dev_sitting.webp"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/art/room/character/char_dev_sitting.png';
            }}
            alt="Персонаж за работой"
            className="w-full h-auto object-contain animate-fade-in"
            draggable={false}
          />
        </div>
      )}

      {/* 8. Pet In The Room */}
      {composition.pet && (
        <div className="absolute right-[22%] bottom-[12%] w-[15%] z-20 pointer-events-none animate-pet-bob">
          <div className="relative">
            {/* Pet Sprite */}
            {composition.pet === 'pet_cat' ? (
              <img
                src="/art/room/pets/pet_cat.webp"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/iso/pet_cat.png';
                }}
                alt="Кот"
                className="w-full h-auto object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]"
                draggable={false}
              />
            ) : (
              <img
                src={`/iso/${composition.pet}.png`}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/iso/pet_cat.png';
                }}
                alt="Питомец"
                className="w-full h-auto object-contain scale-[1.7] origin-bottom drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]"
                draggable={false}
              />
            )}

            {/* Pet Cosmetic Accessory (Crown / Glasses / Bow) */}
            {petAcc && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-base select-none filter drop-shadow">
                {petAcc}
              </span>
            )}

            {/* Happy Pet Fed Today Bubble */}
            {(player as any).petFedToday && (
              <span
                title="Питомец сыт и счастлив"
                className="absolute -top-1 -right-1 text-xs select-none animate-bounce"
              >
                ❤️
              </span>
            )}
          </div>
        </div>
      )}

      {/* 9. Room Info & Housing Badge */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-2 z-30">
        <div className="px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-medium text-amber-300 shadow-md flex items-center gap-1.5">
          <span>🏠</span>
          <span>{HOUSING_NAMES[housingLevel] ?? `Жильё ${housingLevel}/4`}</span>
        </div>
      </div>

      {/* 10. Click hint if interactive */}
      {onClick && (
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-[10px] text-ink-300 opacity-80 group-hover:opacity-100 transition-opacity">
          ⚙ Настроить
        </div>
      )}
    </div>
  );
};
