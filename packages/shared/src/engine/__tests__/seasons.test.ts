import { describe, it, expect } from 'vitest';
import {
  FINAL_MULTIPLIERS,
  finalMultiplier,
  applySkillCarryover,
  calculateSeasonScore,
  START_MODIFIERS,
  pickModifierWeightedByFinal,
  startNewLife,
  createNewPlayer,
  PlayerState,
} from '../../index';

describe('Seasons & NG+ Engine (§3, §18)', () => {
  it('has correct multipliers for all career finals (§3.2)', () => {
    expect(FINAL_MULTIPLIERS.exit).toBe(3.0);
    expect(FINAL_MULTIPLIERS.cto).toBe(2.2);
    expect(FINAL_MULTIPLIERS.corporate_god).toBe(2.2);
    expect(FINAL_MULTIPLIERS.teacher).toBe(2.0);
    expect(FINAL_MULTIPLIERS.free_artist).toBe(1.8);
    expect(FINAL_MULTIPLIERS.burnout).toBe(0.8);
    expect(FINAL_MULTIPLIERS.left_it).toBe(0.6);
    expect(FINAL_MULTIPLIERS.season_end).toBe(1.0);
  });

  it('calculates final multipliers correctly', () => {
    expect(finalMultiplier('exit')).toBe(3.0);
    expect(finalMultiplier('cto')).toBe(2.2);
    expect(finalMultiplier('burnout')).toBe(0.8);
    expect(finalMultiplier('left_it')).toBe(0.6);
    expect(finalMultiplier(null)).toBe(1.0);
  });

  it('correctly calculates cumulative season score', () => {
    const prevSeasonScore = 1500;
    const lifeScore = 500; // rating
    // with exit (x3.0): 1500 + 500 * 3.0 = 3000
    expect(calculateSeasonScore(prevSeasonScore, lifeScore, 'exit')).toBe(3000);
    // with burnout (x0.8): 1500 + 500 * 0.8 = 1900
    expect(calculateSeasonScore(prevSeasonScore, lifeScore, 'burnout')).toBe(1900);
  });

  it('applies 10% carryover of skills between lives', () => {
    const skills = {
      javascript: { level: 85, xp: 120 },
      react: { level: 40, xp: 10 },
      typescript: { level: 7, xp: 50 }, // 7 * 0.1 = 0 (dropped)
    };

    const carried = applySkillCarryover(skills, 0.10);
    expect(carried.javascript).toEqual({ level: 8, xp: 0 });
    expect(carried.react).toEqual({ level: 4, xp: 0 });
    expect(carried.typescript).toBeUndefined();
  });

  it('contains at least 6-8 starting modifiers', () => {
    expect(START_MODIFIERS.length).toBeGreaterThanOrEqual(6);
    const ids = START_MODIFIERS.map((m) => m.id);
    expect(ids).toContain('born_in_moscow');
    expect(ids).toContain('rich_parents');
    expect(ids).toContain('late_start');
    expect(ids).toContain('exit_veteran');
  });

  it('exit_veteran modifier requires previous exit final', () => {
    const exitMod = START_MODIFIERS.find((m) => m.id === 'exit_veteran')!;
    expect(exitMod.condition?.('exit')).toBe(true);
    expect(exitMod.condition?.('burnout')).toBe(false);
  });

  it('pickModifierWeightedByFinal picks a valid modifier', () => {
    const mod = pickModifierWeightedByFinal('burnout', () => 0.1);
    expect(mod).toBeDefined();
    expect(mod.id).toBeTruthy();
  });

  it('startNewLife performs seamless New Game+ transition', () => {
    const p = createNewPlayer();
    p.currentDay = 180;
    p.grade = 'senior';
    p.reputation = 65;
    p.skills = {
      javascript: { level: 75, xp: 100 },
      react: { level: 50, xp: 20 },
    };
    p.items = ['cap_legendary_01', 'gaming_pc'];
    p.nftInventory = ['cap_legendary_01'];
    p.achievements = ['first_job', 'middle_dev'];
    p.seasonScore = 800;
    p.careerEnding = 'exit';

    const nextLife = startNewLife(p, {
      previousFinal: 'exit',
      rng: () => 0, // pick first modifier: born_in_moscow
    });

    // Reset fields
    expect(nextLife.currentDay).toBe(1);
    expect(nextLife.grade).toBe('unemployed');
    expect(nextLife.job).toBeNull();

    // Carried over skills (10%)
    expect(nextLife.skills.javascript.level).toBe(7);
    expect(nextLife.skills.react.level).toBe(5);

    // Carried over achievements and inventory
    expect(nextLife.achievements).toContain('first_job');
    expect(nextLife.achievements).toContain('middle_dev');
    expect(nextLife.items).toContain('cap_legendary_01');
    expect(nextLife.items).toContain('gaming_pc');
    expect(nextLife.nftInventory).toContain('cap_legendary_01');

    // Season Score updated
    expect(nextLife.seasonScore).toBeGreaterThan(800);
    expect(nextLife.lifeCount).toBe(2);
    expect(nextLife.currentModifier).toBeDefined();

    // Meta updated
    expect(nextLife.meta?.lives).toBe(1);
    expect(nextLife.meta?.memories).toContain('exit');
    expect(nextLife.meta?.bestGrade).toBe('senior');
    expect(nextLife.meta?.deepestDay).toBe(180);
  });
});
