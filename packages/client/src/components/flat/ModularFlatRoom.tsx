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

      {/* 3. Dynamic Window Atmosphere / View */}
      {/* 3.1 Window glass pane texture */}
      <div className="absolute right-[2.5%] top-[16.2%] w-[15.5%] h-[43.1%] overflow-hidden pointer-events-none rounded-[1px] z-[5]">
        <img
          src={`/art/room/windows/${composition.window}.webp`}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = `/art/room-modular/windows/${composition.window}.png`;
          }}
          alt="Вид из окна"
          className="w-full h-full object-cover"
          style={{ imageRendering: 'pixelated' }}
          draggable={false}
        />
      </div>

      {/* 3.2 Dynamic Ambient Light Beam cast from window across the room */}
      {composition.window === 'window_sunset' && (
        <div
          className="absolute right-0 top-0 w-2/3 h-full pointer-events-none mix-blend-color-dodge opacity-35 z-[6]"
          style={{
            background: 'linear-gradient(225deg, rgba(249,115,22,0.85) 0%, rgba(217,119,6,0.3) 40%, transparent 70%)',
          }}
        />
      )}
      {composition.window === 'window_day' && (
        <div
          className="absolute right-0 top-0 w-2/3 h-full pointer-events-none mix-blend-screen opacity-25 z-[6]"
          style={{
            background: 'linear-gradient(225deg, rgba(254,240,138,0.8) 0%, rgba(253,224,71,0.2) 40%, transparent 70%)',
          }}
        />
      )}
      {composition.window === 'window_rain' && (
        <div
          className="absolute right-0 top-0 w-2/3 h-full pointer-events-none mix-blend-overlay opacity-30 z-[6]"
          style={{
            background: 'linear-gradient(225deg, rgba(168,85,247,0.7) 0%, rgba(6,182,212,0.25) 40%, transparent 70%)',
          }}
        />
      )}
      {composition.window === 'window_blinds' && (
        <div
          className="absolute right-0 top-0 w-2/3 h-full pointer-events-none mix-blend-soft-light opacity-30 z-[6]"
          style={{
            background: 'repeating-linear-gradient(180deg, transparent 0px, transparent 8px, rgba(0,0,0,0.6) 8px, rgba(0,0,0,0.6) 12px)',
          }}
        />
      )}
      {composition.window === 'window_night' && (
        <div
          className="absolute right-0 top-0 w-2/3 h-full pointer-events-none mix-blend-screen opacity-20 z-[6]"
          style={{
            background: 'linear-gradient(225deg, rgba(56,189,248,0.5) 0%, rgba(37,99,235,0.15) 40%, transparent 70%)',
          }}
        />
      )}

      {/* 4. Wall Decor (Neon Sign / Whiteboard / Bookshelf / Garland) */}
      {composition.decor === 'decor_neon' && (
        <div className="absolute left-[33%] top-[14%] z-[7] px-2.5 py-1 rounded bg-black/75 border border-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.9),inset_0_0_8px_rgba(34,211,238,0.4)] flex items-center gap-1.5 animate-pulse">
          <span className="font-mono font-bold text-xs text-cyan-300 tracking-widest drop-shadow-[0_0_8px_rgba(34,211,238,1)]">&lt;/&gt; CODE</span>
        </div>
      )}
      {composition.decor === 'decor_whiteboard' && (
        <div className="absolute left-[30%] top-[12%] w-[16%] h-[18%] bg-[#f8fafc] rounded-[2px] border-2 border-[#78350f] shadow-lg p-1 flex flex-col justify-between z-[7] select-none">
          <div className="flex justify-between items-center border-b border-ink-300 pb-0.5">
            <span className="text-[6px] font-bold font-mono text-ink-800">KANBAN #42</span>
            <span className="text-[5px] text-emerald-600 font-bold">● SPRINT</span>
          </div>
          <div className="grid grid-cols-3 gap-0.5 flex-1 pt-0.5">
            <div className="bg-amber-100 rounded-[1px] p-0.5 space-y-0.5">
              <div className="h-0.5 bg-amber-400 rounded-2xs w-full" />
              <div className="h-0.5 bg-amber-300 rounded-2xs w-3/4" />
            </div>
            <div className="bg-blue-100 rounded-[1px] p-0.5 space-y-0.5">
              <div className="h-0.5 bg-blue-400 rounded-2xs w-full" />
              <div className="h-0.5 bg-blue-300 rounded-2xs w-2/3" />
            </div>
            <div className="bg-emerald-100 rounded-[1px] p-0.5 space-y-0.5">
              <div className="h-0.5 bg-emerald-400 rounded-2xs w-full" />
              <div className="h-0.5 bg-emerald-300 rounded-2xs w-full" />
            </div>
          </div>
          <div className="text-[5px] text-ink-500 font-mono text-right">Done: 100%</div>
        </div>
      )}
      {composition.decor === 'decor_garland' && (
        <div className="absolute left-[4%] top-[6%] right-[22%] flex justify-between pointer-events-none z-[8]">
          {['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#eab308', '#06b6d4', '#f97316'].map((col, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-[1px] h-1.5 bg-ink-600/80" />
              <span
                className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] animate-pulse"
                style={{ backgroundColor: col, color: col, animationDuration: `${0.8 + (i % 4) * 0.3}s` }}
              />
            </div>
          ))}
        </div>
      )}
      {composition.decor === 'decor_bookshelf' && (
        <div className="absolute left-[54%] top-[14%] px-2 py-1 rounded bg-black/80 border border-emerald-500/70 shadow-[0_0_12px_rgba(16,185,129,0.5)] flex items-center gap-1.5 z-[7]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-ping" />
          <span className="font-mono text-[9px] text-emerald-300">NODE : LIVE</span>
        </div>
      )}

      {/* 5. Chair Style Variant (when room is empty / character stepped away) */}
      {composition.chair === 'chair_gaming' && !composition.showCharacter && (
        <div className="absolute left-[34%] bottom-[16%] w-[22%] pointer-events-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)] z-[8]">
          <img
            src="/iso/chair_gaming.png"
            alt="Геймерское кресло"
            className="w-full h-auto object-contain scale-[2.2] origin-bottom"
          />
        </div>
      )}
      {composition.chair === 'chair_herman_miller' && !composition.showCharacter && (
        <div className="absolute left-[36%] bottom-[18%] px-2 py-0.5 rounded bg-black/60 border border-sky-400 text-[10px] text-sky-200 font-mono shadow-md z-[8]">
          Aeron Mesh
        </div>
      )}
      {composition.chair === 'chair_throne' && !composition.showCharacter && (
        <div className="absolute left-[36%] bottom-[18%] px-2 py-0.5 rounded bg-amber-900/80 border border-amber-300 text-[10px] text-amber-200 font-mono shadow-lg flex items-center gap-1 z-[8]">
          <span>👑</span> CTO Throne
        </div>
      )}

      {/* 6. Hardware & Monitor Setup Variant Overlays */}
      {composition.setup === 'setup_ultrawide' && (
        <div className="absolute left-[13%] top-[34%] w-[21%] h-[15%] rounded-[2px] bg-sky-950/90 border border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.7)] p-1 flex flex-col justify-between pointer-events-none z-[9]">
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
        <div className="absolute left-[32%] top-[41%] w-[9%] h-[8%] rounded-[1px] bg-slate-900 border border-slate-400 shadow-md p-0.5 flex flex-col justify-center items-center pointer-events-none z-[9]">
          <span className="text-[6px] text-slate-300 font-mono"> M3 Max</span>
        </div>
      )}

      {/* 7. Developer Character at Workstation ("Персонаж в комнате") */}
      {composition.showCharacter && (
        <img
          src="/art/room/character/char_sitting_full.webp"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/art/room-modular/character/char_sitting_full.webp';
          }}
          alt="Персонаж за работой"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10 select-none animate-fade-in"
          style={{ imageRendering: 'pixelated' }}
          draggable={false}
        />
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
