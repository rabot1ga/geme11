import React from 'react';

export interface FlatItemIconProps {
  itemId: string;
  itemType?: string;
  size?: number;
  className?: string;
}

export const FlatItemIcon: React.FC<FlatItemIconProps> = ({
  itemId,
  itemType,
  size = 48,
  className = '',
}) => {
  // 1. Pets
  if (itemId.startsWith('pet_') && itemId !== 'pet_bow' && itemId !== 'pet_glasses' && itemId !== 'pet_crown') {
    if (itemId === 'pet_cat') {
      return (
        <img
          src="/art/room/pets/pet_cat.webp"
          alt=""
          width={size}
          height={size}
          className={`object-contain select-none drop-shadow-sm ${className}`}
          style={{ imageRendering: 'pixelated' }}
        />
      );
    }
    return (
      <img
        src={`/iso/${itemId}.png`}
        alt=""
        width={size}
        height={size}
        className={`object-contain select-none drop-shadow-sm ${className}`}
        style={{ imageRendering: 'pixelated' }}
      />
    );
  }

  // 2. Hardware / PCs / Laptops
  if (itemType === 'pc' || itemId === 'macbook' || itemId === 'gaming_pc' || itemId === 'cheap_pc') {
    return (
      <img
        src="/art/equipment/laptop.svg"
        alt=""
        width={size}
        height={size}
        className={`object-contain select-none ${className}`}
      />
    );
  }

  // 3. Chairs
  if (itemType === 'chair' || itemId.includes('chair') || itemId === 'herman_miller') {
    return (
      <img
        src="/art/equipment/chair.svg"
        alt=""
        width={size}
        height={size}
        className={`object-contain select-none ${className}`}
      />
    );
  }

  // 4. Keyboard
  if (itemId.includes('keyboard')) {
    return (
      <img
        src="/art/equipment/keyboard.svg"
        alt=""
        width={size}
        height={size}
        className={`object-contain select-none ${className}`}
      />
    );
  }

  // 5. Headphones
  if (itemType === 'headphones' || itemId.includes('headphones')) {
    return (
      <img
        src="/art/equipment/headphones.svg"
        alt=""
        width={size}
        height={size}
        className={`object-contain select-none ${className}`}
      />
    );
  }

  // 6. Plants
  if (itemId === 'desk_plant') {
    return (
      <img
        src="/art/room/pets/pet_plant_crop.png"
        alt=""
        width={size}
        height={size}
        className={`object-contain select-none ${className}`}
        style={{ imageRendering: 'pixelated' }}
      />
    );
  }

  // 7. Mining Hardware
  if (itemId.startsWith('mining_')) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-ink-800 border border-ink-700 text-amber-300 font-mono ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xl">⛏️</span>
      </div>
    );
  }

  // 8. Courses & Mentorship
  if (itemType === 'course' || itemId.startsWith('study_')) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-ink-800 border border-ink-700 text-sky-300 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xl">📚</span>
      </div>
    );
  }

  // 9. Pet accessories
  if (itemId === 'pet_crown') {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-300 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xl">👑</span>
      </div>
    );
  }
  if (itemId === 'pet_glasses') {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-sky-500/10 border border-sky-400/30 text-sky-300 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xl">🕶️</span>
      </div>
    );
  }
  if (itemId === 'pet_bow') {
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-pink-500/10 border border-pink-400/30 text-pink-300 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xl">🎀</span>
      </div>
    );
  }

  // Fallback
  return (
    <div
      className={`flex items-center justify-center rounded-xl bg-ink-800 border border-ink-700 text-ink-300 ${className}`}
      style={{ width: size, height: size }}
    >
      <span className="text-xl">📦</span>
    </div>
  );
};

export const FlatHousingIcon: React.FC<{ level: number; size?: number }> = ({ level, size = 44 }) => {
  const EMOJIS = ['🏚️', '🏠', '🏡', '🏢', '👑'];
  const LABELS = ['Хрущевка', '1-к', '2-к', 'Лофт', 'Пентхаус'];
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl bg-ink-800 border border-ink-700 text-amber-300 shadow-inner"
      style={{ width: size, height: size }}
      title={LABELS[level] ?? 'Жильё'}
    >
      <span className="text-lg leading-none">{EMOJIS[level] ?? '🏠'}</span>
    </div>
  );
};
