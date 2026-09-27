/**
 * Seasons, New Game+ and Play-to-Earn mechanics (ТЗ v3.0, §3, §18)
 *
 * Implements:
 *   - Final multipliers for Season Score calculation (§3.2)
 *   - Start modifiers pool (§3.4)
 *   - 10% skill carryover across lives
 *   - startNewLife: bridge between lives in a season
 */

import {
  PlayerState,
  CareerEnding,
  SkillId,
  SkillLevel,
  StartModifier,
  LifeResult,
  Grade,
} from '../types';
import { createNewPlayer } from './player';
import { calculateRating, theoreticalMaxRatingXp } from './rating';
import { clamp } from './utils';
import { metaXpBonusPct } from './meta';

export const FINAL_MULTIPLIERS: Record<CareerEnding, number> = {
  exit: 3.0,
  cto: 2.2,
  corporate_god: 2.2,
  teacher: 2.0,
  free_artist: 1.8,
  burnout: 0.8,
  left_it: 0.6,
  season_end: 1.0,
};

export const FINAL_EPILOGUES: Record<CareerEnding, string> = {
  exit: '«Ты в Дубае. Уже полгода. Скучно.»',
  cto: '«Ты управляешь 400 инженерами. Код не писал 3 года.»',
  corporate_god: '«Ты управляешь 400 инженерами. Код не писал 3 года.»',
  teacher: '«Один из учеников — твой начальник.»',
  free_artist: '«Только ты и дедлайны, которые ты сам себе поставил»',
  burnout: '«Ты уехал в деревню. Впервые за 10 лет высыпаешься»',
  left_it: '«Ты открыл кофейню. Клиенты спрашивают про Wi-Fi»',
  season_end: '«Сезон подошёл к концу. Время подводить итоги.»',
};

/**
 * Multiplier for Season Score calculation based on ending type and optional day.
 */
export function finalMultiplier(
  finalType?: CareerEnding | string | null,
  day = 365,
  theoreticalMax = 1000
): number {
  if (!finalType) return 1.0;
  if (finalType === 'season_end') {
    return Math.min(1.0, Math.max(0.2, day / theoreticalMax));
  }
  return FINAL_MULTIPLIERS[finalType as CareerEnding] ?? 1.0;
}

/**
 * 10% skill carryover: each skill drops to 10% of its achieved level.
 */
export function applySkillCarryover(
  skills: Record<SkillId, SkillLevel> = {},
  carryoverPercent = 0.10
): Record<SkillId, SkillLevel> {
  const result: Record<SkillId, SkillLevel> = {};
  for (const [id, skill] of Object.entries(skills)) {
    if (!skill || typeof skill.level !== 'number') continue;
    const carriedLevel = Math.floor(skill.level * carryoverPercent);
    if (carriedLevel > 0) {
      result[id] = { level: carriedLevel, xp: 0 };
    }
  }
  return result;
}

/**
 * Calculates new Season Score by adding current life's score with final multiplier.
 */
export function calculateSeasonScore(
  currentSeasonScore: number,
  lifeScore: number,
  finalType?: CareerEnding | string | null,
  day = 365
): number {
  const mult = finalMultiplier(finalType, day);
  return Math.round(currentSeasonScore + lifeScore * mult);
}

/**
 * Starting modifiers pool (§3.4)
 */
export const START_MODIFIERS: StartModifier[] = [
  {
    id: 'born_in_moscow',
    name: 'Родился в Москве',
    description: '+15% к стартовым деньгам, −10% к энергии от жилья',
    weight: 20,
    applyStart(state: PlayerState) {
      state.money = Math.round(state.money * 1.15); // 11 500 ₽
    },
  },
  {
    id: 'rich_parents',
    name: 'Богатые родители',
    description: 'Старт с 200 000 ₽, но −20 к стартовой репутации',
    weight: 15,
    applyStart(state: PlayerState) {
      state.money = 200000;
      state.reputation = clamp(state.reputation - 20, 0, 100);
    },
  },
  {
    id: 'late_start',
    name: 'Поздний старт в 30',
    description: '−1 к максимальной энергии, но +20 к стартовой коммуникации',
    weight: 20,
    applyStart(state: PlayerState) {
      state.maxEnergy = Math.max(5, state.maxEnergy - 1);
      state.energy = Math.min(state.energy, state.maxEnergy);
      if (!state.softSkills['communication']) {
        state.softSkills['communication'] = { level: 25, xp: 0 };
      } else {
        state.softSkills['communication'].level += 20;
      }
    },
  },
  {
    id: 'exit_veteran',
    name: 'После Экзита все ждут повторения',
    description: '+30 к репутации, но события чаще предлагают рискованные развилки',
    weight: 35,
    condition: (prevFinal) => prevFinal === 'exit',
    applyStart(state: PlayerState) {
      state.reputation = clamp(state.reputation + 30, 0, 100);
    },
  },
  {
    id: 'workaholic',
    name: 'Трудоголик',
    description: '+1 к максимальной энергии, но −10 к стартовой мотивации',
    weight: 20,
    applyStart(state: PlayerState) {
      state.maxEnergy += 1;
      state.energy += 1;
      state.motivation = clamp(state.motivation - 10, 0, 100);
    },
  },
  {
    id: 'code_ninja',
    name: 'Кодер-самоучка',
    description: 'Старт с 15 ур. JavaScript, но −5 к стартовой коммуникации',
    weight: 20,
    applyStart(state: PlayerState) {
      state.skills['javascript'] = { level: 15, xp: 0 };
      if (state.softSkills['communication']) {
        state.softSkills['communication'].level = Math.max(
          1,
          state.softSkills['communication'].level - 5
        );
      }
    },
  },
  {
    id: 'coffee_addict',
    name: 'Кофеман',
    description: '+2 к энергии на старте дня, но стартовое здоровье 70 вместо 80',
    weight: 15,
    applyStart(state: PlayerState) {
      state.energy = Math.min(state.maxEnergy, state.energy + 2);
      state.health = 70;
    },
  },
  {
    id: 'open_source_contributor',
    name: 'Опенсорсник',
    description: '+25 к стартовой репутации, но старт с 5 000 ₽',
    weight: 15,
    applyStart(state: PlayerState) {
      state.money = 5000;
      state.reputation = clamp(state.reputation + 25, 0, 100);
    },
  },
];

/**
 * Pick a start modifier weighted by previous final.
 */
export function pickModifierWeightedByFinal(
  previousFinal?: CareerEnding,
  rng: () => number = Math.random
): StartModifier {
  const candidates = START_MODIFIERS.filter((mod) =>
    mod.condition ? mod.condition(previousFinal) : true
  );

  const totalWeight = candidates.reduce((sum, mod) => sum + (mod.weight ?? 10), 0);
  let roll = rng() * totalWeight;

  for (const mod of candidates) {
    roll -= mod.weight ?? 10;
    if (roll <= 0) return mod;
  }

  return candidates[0] ?? START_MODIFIERS[0];
}

export interface NewLifeOptions {
  previousFinal?: CareerEnding;
  rng?: () => number;
  seasonId?: string;
}

/**
 * New Game+ core transition between lives (§3.4).
 *
 * Keeps:
 *   - 10% skills carryover
 *   - Accumulates Season Score (Life Score × multiplier)
 *   - Preserves achievements, inventory (items), NFT items
 *   - Applies selected NG+ modifier
 *   - Increments lifeCount
 *   - Preserves meta ledger (memories, deepest day, best grade)
 */
export function startNewLife(
  prev: PlayerState,
  options: NewLifeOptions = {}
): PlayerState {
  const finalType = options.previousFinal ?? prev.careerEnding ?? 'burnout';
  const lifeScore = calculateRating(prev);
  const nextSeasonScore = calculateSeasonScore(
    prev.seasonScore ?? 0,
    lifeScore,
    finalType,
    prev.currentDay
  );

  const fresh = createNewPlayer();
  const modifier = pickModifierWeightedByFinal(finalType, options.rng);

  // Apply skill carryover (10%)
  const carriedSkills = applySkillCarryover(prev.skills, 0.10);
  fresh.skills = { ...carriedSkills };

  // Seasons & progression
  fresh.seasonId = options.seasonId ?? prev.seasonId ?? 'season_1';
  fresh.seasonScore = nextSeasonScore;
  fresh.lifeCount = (prev.lifeCount ?? 1) + 1;
  fresh.currentModifier = modifier.id;

  // Preserve achievements & inventory (NFTs, cosmetics, bought gear)
  fresh.achievements = [...(prev.achievements ?? [])];
  fresh.items = [...(prev.items ?? [])];
  fresh.nftInventory = [...(prev.nftInventory ?? [])];
  fresh.housingLevel = prev.housingLevel ?? 0;

  // Preserve Stars entitlements and badges
  if (prev.entitlements?.length) fresh.entitlements = [...prev.entitlements];
  if (prev.badges?.length) fresh.badges = [...prev.badges];
  fresh.dailyStreak = prev.dailyStreak;
  fresh.lastCheckInDate = prev.lastCheckInDate;
  fresh.walletAddress = prev.walletAddress;

  // Weekly sprint progress persists across lives within the week
  if (prev.sprint) fresh.sprint = { ...prev.sprint };

  // Preserve & update meta ledger
  const prevMeta = prev.meta;
  const memories = [...(prevMeta?.memories ?? [])];
  if (finalType && !memories.includes(finalType)) {
    memories.push(finalType);
  }

  const bestGrade = ((): Grade => {
    const grades: Grade[] = [
      'unemployed',
      'intern',
      'junior',
      'middle',
      'senior',
      'teamlead',
      'architect',
      'cto',
    ];
    const prevIdx = grades.indexOf(prevMeta?.bestGrade ?? 'unemployed');
    const curIdx = grades.indexOf(prev.grade ?? 'unemployed');
    return grades[Math.max(prevIdx, curIdx)] ?? 'unemployed';
  })();

  fresh.meta = {
    lives: (prevMeta?.lives ?? 0) + 1,
    memories,
    bestGrade,
    deepestDay: Math.max(prevMeta?.deepestDay ?? 0, prev.currentDay ?? 0),
    lifetimeActions: (prevMeta?.lifetimeActions ?? 0) + (prev.totalActions ?? 0),
  };

  // Apply the modifier effects
  modifier.applyStart(fresh);

  return fresh;
}
