import { GeneticTraits, PlayerState } from '@itsim/shared';

export interface FlatRoomComposition {
  bg: string;
  wallColor?: string | null;
  window: string;
  chair: string;
  setup: string;
  atmosphere: string;
  decor: string;
  pet: string | null;
  showCharacter: boolean;
}

export interface SlotOption {
  id: string;
  name: string;
  emoji: string;
  previewUrl?: string;
}

export const HOUSING_NAMES: Record<number, string> = {
  0: 'Хрущёвка / Студия',
  1: '1-комнатная (Комфорт)',
  2: '2-комнатная квартира',
  3: 'Дизайнерский лофт',
  4: 'Пентхаус CTO',
};

export const WINDOW_OPTIONS: SlotOption[] = [
  { id: 'window_night', name: 'Ночной мегаполис', emoji: '🌃' },
  { id: 'window_day', name: 'Солнечный день', emoji: '🏙️' },
  { id: 'window_sunset', name: 'Закатные сумерки', emoji: '🌇' },
  { id: 'window_rain', name: 'Киберпанк дождь', emoji: '🌧️' },
  { id: 'window_blinds', name: 'Деревянные жалюзи', emoji: '🪟' },
];

export const CHAIR_OPTIONS: SlotOption[] = [
  { id: 'chair_office', name: 'Офисное кресло', emoji: '💺' },
  { id: 'chair_gaming', name: 'Геймерское ковш-кресло', emoji: '🏎️' },
  { id: 'chair_herman_miller', name: 'Herman Miller Aeron', emoji: '✨' },
  { id: 'chair_stool', name: 'Простой табурет', emoji: '🪵' },
  { id: 'chair_throne', name: 'Золотой трон CTO', emoji: '👑' },
];

export const SETUP_OPTIONS: SlotOption[] = [
  { id: 'setup_dual', name: 'Монитор 2K + Ноутбук', emoji: '🖥️' },
  { id: 'setup_laptop', name: 'Ноутбук разработчика', emoji: '💻' },
  { id: 'setup_macbook', name: 'MacBook Pro Retina', emoji: '🍎' },
  { id: 'setup_ultrawide', name: 'Изогнутый 34" Ultrawide', emoji: '🕹️' },
  { id: 'setup_gaming', name: 'Мощный ПК с подсветкой', emoji: '🚀' },
];

export const ATMO_OPTIONS: SlotOption[] = [
  { id: 'atmo_plant', name: 'Папоротник в горшке', emoji: '🌿' },
  { id: 'atmo_cactus', name: 'Кактус на столе', emoji: '🌵' },
  { id: 'atmo_lamp', name: 'Тёплая лампа и кофе', emoji: '☕' },
  { id: 'atmo_coffee', name: 'Кофемашина', emoji: '☕' },
  { id: 'atmo_rug', name: 'Уютный коврик', emoji: '🧶' },
  { id: 'atmo_none', name: 'Минимализм', emoji: '🧹' },
];

export const DECOR_OPTIONS: SlotOption[] = [
  { id: 'decor_posters', name: 'IT-постеры и крипта', emoji: '🖼️' },
  { id: 'decor_neon', name: 'Неоновая вывеска </>', emoji: '💡' },
  { id: 'decor_whiteboard', name: 'Маркерная доска Kanban', emoji: '📋' },
  { id: 'decor_bookshelf', name: 'Стеллаж с сервером', emoji: '📚' },
  { id: 'decor_garland', name: 'Уютная гирлянда', emoji: '✨' },
];

export const PET_OPTIONS: SlotOption[] = [
  { id: 'pet_cat', name: 'Кот-разработчик', emoji: '🐱' },
  { id: 'pet_dog', name: 'Корги', emoji: '🐶' },
  { id: 'pet_bulldog', name: 'Бульдог в галстуке', emoji: '👔' },
  { id: 'pet_robo', name: 'Робопёс', emoji: '🤖' },
  { id: 'pet_cactus', name: 'Кактус-друг', emoji: '🌵' },
  { id: 'pet_parrot', name: 'Попугай Кеша', emoji: '🦜' },
  { id: 'pet_hamster', name: 'Хомяк Байт', emoji: '🐹' },
  { id: 'pet_spider', name: 'Паук Пафнутий', emoji: '🕷️' },
  { id: 'pet_fish', name: 'Рыбка Гит', emoji: '🐠' },
  { id: 'pet_none', name: 'Без питомца', emoji: '🚫' },
];

export const WALL_COLORS = [
  { id: 'default', name: 'Уютный шоколадный', hex: 'transparent' },
  { id: 'navy', name: 'Глубокий синий', hex: '#1a2238' },
  { id: 'slate', name: 'Графитовый сланец', hex: '#262d38' },
  { id: 'brick', name: 'Лофт терракота', hex: '#44231b' },
  { id: 'emerald', name: 'Изумрудный бархат', hex: '#162e26' },
  { id: 'cyber', name: 'Неоновый киберпанк', hex: '#31193b' },
];

export function buildFlatRoomComposition(player: PlayerState): FlatRoomComposition {
  const housingLevel = Math.min(4, Math.max(0, player.housingLevel ?? 0));
  const items = player.items ?? [];
  const custom = player.room;

  // 1. BG based on housing level
  const defaultBg = `bg_${housingLevel}`;

  // 2. Chair based on items
  let defaultChair = 'chair_office';
  if (items.includes('herman_miller')) defaultChair = 'chair_herman_miller';
  else if (items.includes('gaming_chair')) defaultChair = 'chair_gaming';
  else if (items.includes('office_chair')) defaultChair = 'chair_office';
  else if (housingLevel === 0) defaultChair = 'chair_stool';

  // 3. Setup based on items
  let defaultSetup = 'setup_dual';
  if (items.includes('macbook')) defaultSetup = 'setup_macbook';
  else if (items.includes('gaming_pc')) defaultSetup = 'setup_gaming';
  else if (items.includes('cheap_pc')) defaultSetup = 'setup_monitor';

  // 4. Pet based on items
  let defaultPet: string | null = null;
  const petIds = ['pet_cat', 'pet_dog', 'pet_bulldog', 'pet_robo', 'pet_cactus', 'pet_parrot', 'pet_hamster', 'pet_spider', 'pet_fish'];
  for (const pid of petIds) {
    if (items.includes(pid)) {
      defaultPet = pid;
      break;
    }
  }

  // 5. Atmosphere
  let defaultAtmo = 'atmo_plant';
  if (items.includes('coffee_maker')) defaultAtmo = 'atmo_coffee';
  else if (items.includes('desk_plant')) defaultAtmo = 'atmo_plant';

  // 6. Window
  const defaultWindow = 'window_night';

  // 7. Decor
  const defaultDecor = 'decor_posters';

  const composition: FlatRoomComposition = {
    bg: custom?.slots?.bg || defaultBg,
    wallColor: custom?.wallColor || null,
    window: custom?.slots?.window || defaultWindow,
    chair: custom?.slots?.chair || defaultChair,
    setup: custom?.slots?.setup || defaultSetup,
    atmosphere: custom?.slots?.atmosphere || defaultAtmo,
    decor: custom?.slots?.decor || defaultDecor,
    pet: custom?.slots?.pet !== undefined ? (custom.slots.pet === 'pet_none' ? null : custom.slots.pet) : defaultPet,
    showCharacter: custom?.slots?.character !== 'hidden',
  };

  return composition;
}
