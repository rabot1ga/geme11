import React from 'react';
import { PlayerState } from '@itsim/shared';

export interface RoomCustomConfig {
  background?: string;
  chair?: string;
  setup?: string;
  window?: string;
  pet?: string;
  decor?: string[];
  showCharacter?: boolean;
  wallColor?: string;
}

interface FlatRoomProps {
  player: PlayerState;
  custom?: RoomCustomConfig;
  onItemClick?: (category: string) => void;
  className?: string;
}

const HOUSING_NAMES = ['Студия', '1-комн. квартира', '2-комн. квартира', 'Лофт', 'Пентхаус'];

export const FlatRoom: React.FC<FlatRoomProps> = ({
  player,
  custom,
  onItemClick,
  className = '',
}) => {
  const housingLevel = Math.min(4, Math.max(0, player.housingLevel ?? 0));
  const items = player.items ?? [];
  const roomSlots = (player.room?.slots as Record<string, string>) ?? {};

  // 1. Resolve Background
  // Priority: custom -> saved slot -> housing level
  let bgImage = '/art/room-modular/backgrounds/bg_1_apartment.webp';
  const bgChoice = custom?.background ?? roomSlots.background;
  if (bgChoice === 'studio' || housingLevel === 0) {
    bgImage = '/art/room-modular/backgrounds/bg_0_studio.webp';
  } else if (bgChoice === 'penthouse' || housingLevel >= 3) {
    bgImage = '/art/room-modular/backgrounds/bg_2_penthouse.webp';
  } else {
    bgImage = '/art/room-modular/backgrounds/bg_1_apartment.webp';
  }

  // 2. Resolve Chair
  let chairSprite: string | null = null;
  const chairChoice = custom?.chair ?? roomSlots.chair;
  if (chairChoice) {
    chairSprite = `/art/room-modular/chairs/${chairChoice}.png`;
  } else if (items.includes('herman_miller') || items.includes('lootbox_ergonomic_chair')) {
    chairSprite = '/art/room-modular/chairs/chair_herman_miller.png';
  } else if (items.includes('gaming_chair')) {
    chairSprite = '/art/room-modular/chairs/chair_gaming.png';
  } else if (items.includes('office_chair')) {
    chairSprite = '/art/room-modular/chairs/chair_office.png';
  } else if (housingLevel === 0) {
    chairSprite = '/art/room-modular/chairs/chair_stool.png';
  } else {
    chairSprite = '/art/room-modular/chairs/chair_leather.png';
  }

  // 3. Resolve Setup (Computer / Monitors)
  let setupSprite = '/art/room-modular/setups/setup_laptop.png';
  const setupChoice = custom?.setup ?? roomSlots.setup;
  if (setupChoice) {
    setupSprite = `/art/room-modular/setups/${setupChoice}.png`;
  } else if (items.includes('macbook') || items.includes('lootbox_quantum_laptop')) {
    setupSprite = '/art/room-modular/setups/setup_macbook.png';
  } else if (items.includes('gaming_pc')) {
    setupSprite = '/art/room-modular/setups/setup_dual.png';
  } else if (items.includes('cheap_pc') || items.includes('lootbox_mech_kb')) {
    setupSprite = '/art/room-modular/setups/setup_monitor.png';
  } else {
    setupSprite = '/art/room-modular/setups/setup_laptop.png';
  }

  // 4. Resolve Window
  const windowChoice = custom?.window ?? roomSlots.window;
  let windowSprite: string | null = null;
  if (windowChoice && windowChoice !== 'none' && windowChoice !== 'default') {
    windowSprite = `/art/room-modular/windows/${windowChoice}.png`;
  }

  // 5. Resolve Pet
  let petSprite: string | null = null;
  let petName = '';
  const petChoice = custom?.pet ?? roomSlots.pet;
  const petList = [
    { id: 'pet_cat', file: 'pet_cat.png', label: 'Кот' },
    { id: 'pet_dog', file: 'pet_dog.png', label: 'Корги' },
    { id: 'pet_robo', file: 'pet_robo.png', label: 'Робопес' },
    { id: 'pet_bulldog', file: 'pet_bulldog.png', label: 'Бульдог' },
    { id: 'pet_parrot', file: 'pet_parrot.png', label: 'Попугай' },
    { id: 'pet_hamster', file: 'pet_hamster.png', label: 'Хомяк' },
    { id: 'pet_cactus', file: 'pet_cactus.png', label: 'Кактус' },
  ];

  if (petChoice && petChoice !== 'pet_none') {
    const p = petList.find((x) => x.id === petChoice);
    if (p) {
      petSprite = `/art/room-modular/pets/${p.file}`;
      petName = p.label;
    }
  } else {
    for (const p of petList) {
      if (items.includes(p.id)) {
        petSprite = `/art/room-modular/pets/${p.file}`;
        petName = p.label;
        break;
      }
    }
  }

  // 6. Resolve Decor & Props
  const decorSet = new Set<string>(custom?.decor ?? (roomSlots.decor ? roomSlots.decor.split(',') : []));
  if (items.includes('desk_plant')) decorSet.add('plant_monstera');
  if (items.includes('coffee_maker')) decorSet.add('coffee_maker');
  if (items.includes('mechanical_keyboard')) decorSet.add('mech_keyboard');
  if (items.includes('lootbox_server_rack') || housingLevel >= 3) decorSet.add('neon_code');

  // 7. Character Visibility
  const showCharacter = custom?.showCharacter ?? (roomSlots.showCharacter !== 'false');

  // Wall tint
  const wallColor = custom?.wallColor ?? player.room?.wallColor;

  return (
    <div
      className={`flat-room-container relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-ink-700 bg-ink-950 shadow-lg select-none ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* 0. Base Room Background */}
      <img
        src={bgImage}
        alt="Комната разработчика"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />

      {/* 0.1 Optional Wall Color Filter */}
      {wallColor && (
        <div
          className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-25"
          style={{ backgroundColor: wallColor }}
        />
      )}

      {/* 1. Custom Window View Overlay */}
      {windowSprite && (
        <div
          className="absolute right-[4%] top-[4%] w-[33%] h-[68%] pointer-events-none cursor-pointer transition-transform hover:scale-[1.02]"
          onClick={() => onItemClick?.('window')}
          title="Окно"
        >
          <img
            src={windowSprite}
            alt="Вид из окна"
            className="w-full h-full object-contain filter drop-shadow-md"
            draggable={false}
          />
        </div>
      )}

      {/* 2. Wall Decor */}
      {decorSet.has('whiteboard') && (
        <div
          className="absolute left-[2%] top-[12%] w-[22%] cursor-pointer hover:brightness-110 transition-all"
          onClick={() => onItemClick?.('decor')}
          title="Вайтборд с задачами"
        >
          <img src="/art/room-modular/decor/whiteboard.png" alt="Вайтборд" className="w-full h-auto drop-shadow-sm" />
        </div>
      )}

      {decorSet.has('neon_code') && (
        <div
          className="absolute left-[22%] top-[4%] w-[24%] cursor-pointer animate-pulse"
          onClick={() => onItemClick?.('decor')}
          title="Неоновая вывеска CODE"
        >
          <img
            src="/art/room-modular/decor/neon_code.png"
            alt="Неон CODE"
            className="w-full h-auto filter drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]"
          />
        </div>
      )}

      {decorSet.has('garland') && (
        <div
          className="absolute left-[16%] top-[2%] w-[48%] pointer-events-none"
          title="Гирлянда"
        >
          <img src="/art/room-modular/decor/garland.png" alt="Гирлянда" className="w-full h-auto" />
        </div>
      )}

      {decorSet.has('poster_python') && (
        <div
          className="absolute left-[36%] top-[18%] w-[11%] cursor-pointer hover:scale-105 transition-transform"
          onClick={() => onItemClick?.('decor')}
          title="Постер Python"
        >
          <img src="/art/room-modular/decor/poster_python.png" alt="Python" className="w-full h-auto drop-shadow-sm" />
        </div>
      )}

      {decorSet.has('poster_js') && (
        <div
          className="absolute left-[48%] top-[18%] w-[11%] cursor-pointer hover:scale-105 transition-transform"
          onClick={() => onItemClick?.('decor')}
          title="Постер JavaScript"
        >
          <img src="/art/room-modular/decor/poster_js.png" alt="JavaScript" className="w-full h-auto drop-shadow-sm" />
        </div>
      )}

      {/* 3. Furniture Decor */}
      {decorSet.has('coffee_maker') && (
        <div
          className="absolute left-[3%] bottom-[20%] w-[12%] cursor-pointer hover:brightness-110 transition-all z-10"
          onClick={() => onItemClick?.('decor')}
          title="Кофемашина"
        >
          <img src="/art/room-modular/decor/coffee_maker.png" alt="Кофемашина" className="w-full h-auto drop-shadow-md" />
        </div>
      )}

      {decorSet.has('plant_monstera') && (
        <div
          className="absolute right-[19%] bottom-[12%] w-[20%] cursor-pointer hover:scale-105 transition-transform z-10"
          onClick={() => onItemClick?.('decor')}
          title="Монстера"
        >
          <img src="/art/room-modular/decor/plant_monstera.png" alt="Монстера" className="w-full h-auto drop-shadow-md" />
        </div>
      )}

      {/* 4. Desk Setup (Computer / Monitors) */}
      {setupSprite && !showCharacter && (
        <div
          className="absolute left-[13%] top-[30%] w-[38%] cursor-pointer hover:brightness-110 transition-all z-10"
          onClick={() => onItemClick?.('setup')}
          title="Рабочее место"
        >
          <img src={setupSprite} alt="Компьютер" className="w-full h-auto drop-shadow-md" draggable={false} />
        </div>
      )}

      {/* 5. Chair (when empty) */}
      {chairSprite && !showCharacter && (
        <div
          className="absolute left-[30%] bottom-[12%] w-[27%] cursor-pointer hover:scale-105 transition-transform z-20"
          onClick={() => onItemClick?.('chair')}
          title="Рабочее кресло"
        >
          <img src={chairSprite} alt="Кресло" className="w-full h-auto drop-shadow-lg" draggable={false} />
        </div>
      )}

      {/* 6. Character Sitting at the Desk */}
      {showCharacter && (
        <div
          className="absolute left-[24%] bottom-[2%] w-[48%] cursor-pointer hover:brightness-105 transition-all z-20"
          onClick={() => onItemClick?.('character')}
          title="Ты за работой"
        >
          <img
            src="/art/room-modular/character/char_sitting.png"
            alt="Разработчик за столом"
            className="w-full h-auto drop-shadow-2xl animate-subtle-breathing"
            draggable={false}
          />
        </div>
      )}

      {/* 7. Pet */}
      {petSprite && (
        <div
          className="absolute right-[8%] bottom-[4%] w-[24%] cursor-pointer hover:scale-110 transition-transform z-30"
          onClick={() => onItemClick?.('pet')}
          title={petName || 'Твой питомец'}
        >
          <img
            src={petSprite}
            alt={petName}
            className="w-full h-auto filter drop-shadow-md animate-pet-idle"
            draggable={false}
          />
          {Boolean((player as any).petFedToday || (player as any).petFed) && (
            <span
              className="absolute -top-3 right-2 text-sm select-none animate-bounce"
              title="Питомец сыт и счастлив ❤️"
            >
              ❤️
            </span>
          )}
        </div>
      )}

      {/* 8. Top Badges Overlay */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-40">
        <span className="px-2 py-0.5 rounded bg-ink-900/80 backdrop-blur-sm border border-ink-700 text-2xs font-semibold text-ink-200">
          🏠 {HOUSING_NAMES[housingLevel] ?? 'Жильё'}
        </span>
        {petName && (
          <span className="px-2 py-0.5 rounded bg-ink-900/80 backdrop-blur-sm border border-ink-700 text-2xs font-semibold text-moss-300">
            🐾 {petName}
          </span>
        )}
      </div>

      <div className="absolute top-2.5 right-2.5 z-40">
        <span className="px-2 py-0.5 rounded bg-ink-900/80 backdrop-blur-sm border border-ink-700 text-2xs font-mono text-sky-300">
          Уровень {housingLevel}/4
        </span>
      </div>
    </div>
  );
};
