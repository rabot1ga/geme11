import { describe, it, expect } from 'vitest';
import { buildFlatRoomComposition } from '../flatRoomComposition';
import { PlayerState } from '@itsim/shared';

describe('Flat Modular Room Composition', () => {
  const basePlayer = {
    id: 'test',
    currentDay: 10,
    housingLevel: 0,
    items: [],
    grade: 'junior',
    room: { slots: {} },
  } as unknown as PlayerState;

  it('selects starter bg_0 and stool for housing level 0 with no items', () => {
    const comp = buildFlatRoomComposition(basePlayer);
    expect(comp.bg).toBe('bg_0');
    expect(comp.chair).toBe('chair_stool');
    expect(comp.pet).toBeNull();
    expect(comp.showCharacter).toBe(true);
  });

  it('adapts chair and setup when player buys upgraded equipment', () => {
    const upgraded = {
      ...basePlayer,
      housingLevel: 2,
      items: ['herman_miller', 'macbook', 'pet_cat', 'coffee_maker'],
    } as unknown as PlayerState;

    const comp = buildFlatRoomComposition(upgraded);
    expect(comp.bg).toBe('bg_2');
    expect(comp.chair).toBe('chair_herman_miller');
    expect(comp.setup).toBe('setup_macbook');
    expect(comp.pet).toBe('pet_cat');
    expect(comp.atmosphere).toBe('atmo_coffee');
  });

  it('honors manual room customization slots over auto logic', () => {
    const customized = {
      ...basePlayer,
      housingLevel: 1,
      items: ['gaming_chair'],
      room: {
        slots: {
          bg: 'bg_3',
          chair: 'chair_throne',
          window: 'window_sunset',
          decor: 'decor_neon',
          character: 'hidden',
        },
        wallColor: '#1a2238',
      },
    } as unknown as PlayerState;

    const comp = buildFlatRoomComposition(customized);
    expect(comp.bg).toBe('bg_3');
    expect(comp.chair).toBe('chair_throne');
    expect(comp.window).toBe('window_sunset');
    expect(comp.decor).toBe('decor_neon');
    expect(comp.wallColor).toBe('#1a2238');
    expect(comp.showCharacter).toBe(false);
  });
});
