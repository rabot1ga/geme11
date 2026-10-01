import React from 'react';
import { PlayerState } from '@itsim/shared';
import { HOUSING_NAMES, FlatRoomComposition } from './flatRoomComposition';
import { ROOM_V2_LAYOUT, roomAnchorStyle } from './roomV2Layout';

interface RoomV2StageProps {
  player: PlayerState;
  composition: FlatRoomComposition;
  onClick?: () => void;
  className?: string;
}

const ART = '/art/room-v2';

/** Independent 4:3 layered room composition. All positions are normalized to this stage. */
export const RoomV2Stage: React.FC<RoomV2StageProps> = ({ player, composition, onClick, className = '' }) => {
  const housingLevel = Math.min(4, Math.max(0, player.housingLevel ?? 0));
  const showMonitor = !['setup_laptop', 'setup_macbook'].includes(composition.setup);
  const showPlant = composition.atmosphere === 'atmo_plant';
  const showPoster = composition.decor === 'decor_posters';

  return (
    <div
      onClick={onClick}
      className={`relative isolate w-full aspect-[4/3] overflow-hidden rounded-2xl border border-ink-800 bg-[#281812] shadow-2xl select-none group ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      <img src={`${ART}/base-room.png`} alt="Пустая комната с окном" className="absolute inset-0 h-full w-full object-fill" draggable={false} />
      {composition.wallColor && composition.wallColor !== 'transparent' && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 mix-blend-color opacity-45" style={{ backgroundColor: composition.wallColor }} />
      )}
      {/* Two panes match the actual glass openings; the sill, muntin, frame and blinds remain visible. */}
      {composition.window !== 'window_blinds' && (
        <>
          <img src={`/art/room/windows/${composition.window}.webp`} alt="Вид из верхней части окна" className="absolute object-cover"
            style={roomAnchorStyle(ROOM_V2_LAYOUT.windowTop)} draggable={false} />
          <img src={`/art/room/windows/${composition.window}.webp`} alt="Вид из нижней части окна" className="absolute object-cover"
            style={roomAnchorStyle(ROOM_V2_LAYOUT.windowBottom)} draggable={false} />
        </>
      )}
      {showPoster && (
        <img src={`${ART}/poster-layer.png`} alt="Постер на стене" className="absolute object-fill"
          style={roomAnchorStyle(ROOM_V2_LAYOUT.poster)} draggable={false} />
      )}
      {showPlant && (
        <img src={`${ART}/plant-layer.png`} alt="Комнатное растение" className="absolute object-fill"
          style={roomAnchorStyle(ROOM_V2_LAYOUT.plant)} draggable={false} />
      )}

      {/* Floor shadow and chair are behind the seated character and table. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute rounded-[50%] bg-black/35 blur-sm"
        style={{ left: '44.9%', top: '74.2%', width: '14%', height: '2.6%' }}
      />
      <img
        src={['chair_gaming', 'chair_throne'].includes(composition.chair)
          ? '/art/room-modular/chairs/chair_gaming.png'
          : '/art/room-modular/chairs/chair_office.png'}
        alt={composition.chair === 'chair_gaming' ? 'Геймерское кресло' : 'Офисное кресло'}
        className="absolute object-fill"
        style={roomAnchorStyle(ROOM_V2_LAYOUT.chair)}
        draggable={false}
      />
      {composition.showCharacter && (
        <img src={`${ART}/character-layer.png`} alt="Персонаж сидит за рабочим столом"
          className="absolute object-fill" style={roomAnchorStyle(ROOM_V2_LAYOUT.character)} draggable={false} />
      )}
      <img src={`${ART}/desk-layer.png`} alt="Рабочий стол" className="absolute object-fill"
        style={roomAnchorStyle(ROOM_V2_LAYOUT.desk)} draggable={false} />

      {showMonitor ? (
        <img src={`${ART}/monitor-layer.png`} alt="Монитор" className="absolute object-fill"
          style={roomAnchorStyle(ROOM_V2_LAYOUT.monitor)} draggable={false} />
      ) : (
        <img src="/art/room-modular/setups/setup_laptop.png" alt="Ноутбук на столе" className="absolute object-fill"
          style={roomAnchorStyle(ROOM_V2_LAYOUT.monitor)} draggable={false} />
      )}

      {composition.pet && (
        <img
          src={`/iso/${composition.pet}.png`}
          alt="Питомец"
          className="absolute z-10 object-contain"
          style={roomAnchorStyle(ROOM_V2_LAYOUT.pet)}
          onError={(event) => { event.currentTarget.style.display = 'none'; }}
          draggable={false}
        />
      )}

      <div className="absolute left-2.5 top-2.5 z-20 flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/75 px-2.5 py-1 text-[11px] font-medium text-amber-300 shadow-md">
          <span>🏠</span><span>{HOUSING_NAMES[housingLevel] ?? `Жильё ${housingLevel}/4`}</span>
        </div>
      </div>
      {onClick && <div className="absolute bottom-2.5 right-2.5 z-20 rounded-full border border-white/10 bg-black/60 px-2 py-0.5 text-[10px] text-ink-300 opacity-80 group-hover:opacity-100">⚙ Настроить</div>}
    </div>
  );
};
