import { describe, expect, it } from 'vitest';
import type { LayerManifest } from '@itsim/shared';
import { findRoomPosition, normalizedRectStyle } from '../roomManifest';

const manifest = {
  collection: 'room',
  version: 1,
  resolution: { width: 1000, height: 1000 },
  slots: [
    {
      id: 'window',
      zOrder: 1,
      required: true,
      position: { x: 0.819, y: 0.205, width: 0.155, height: 0.4 },
      entries: [],
    },
    {
      id: 'pet',
      zOrder: 7,
      required: true,
      entries: [{ id: 'pet_cat', file: 'room/pet/pet_cat.svg', position: { x: 0.63, y: 0.63, width: 0.15 } }],
    },
  ],
} as LayerManifest;

describe('room manifest positions', () => {
  it('prefers an entry rectangle and falls back to its slot rectangle', () => {
    expect(findRoomPosition(manifest, 'pet', 'pet_cat')).toEqual({ x: 0.63, y: 0.63, width: 0.15 });
    expect(findRoomPosition(manifest, 'window', 'window_night')).toEqual({
      x: 0.819,
      y: 0.205,
      width: 0.155,
      height: 0.4,
    });
    expect(findRoomPosition(manifest, 'missing')).toBeNull();
  });

  it('converts normalized coordinates to CSS percentages', () => {
    expect(normalizedRectStyle({ x: 0.25, y: 0.5, width: 0.2, height: 0.4 })).toEqual({
      left: '25%',
      top: '50%',
      width: '20%',
      height: '40%',
    });
  });
});
