import { describe, expect, it } from 'vitest';
import { ROOM_V2_LAYOUT } from '../roomV2Layout';

describe('room v2 normalized layout', () => {
  it('keeps every layer anchor within the 4:3 room plate', () => {
    for (const [name, rect] of Object.entries(ROOM_V2_LAYOUT)) {
      expect(rect.x, `${name} left`).toBeGreaterThanOrEqual(0);
      expect(rect.y, `${name} top`).toBeGreaterThanOrEqual(0);
      expect(rect.x + rect.width, `${name} right`).toBeLessThanOrEqual(1);
      expect(rect.y + rect.height, `${name} bottom`).toBeLessThanOrEqual(1);
    }
  });

  it('anchors the desk, display, chair and seated figure in a single workstation zone', () => {
    const chairCenter = ROOM_V2_LAYOUT.chair.x + ROOM_V2_LAYOUT.chair.width / 2;
    const seatedHip = ROOM_V2_LAYOUT.character.x + ROOM_V2_LAYOUT.character.width * 0.48;
    expect(Math.abs(chairCenter - seatedHip)).toBeLessThan(0.03);
    const characterFeet = ROOM_V2_LAYOUT.character.y + ROOM_V2_LAYOUT.character.height * (678 / 768);
    expect(ROOM_V2_LAYOUT.chair.y + ROOM_V2_LAYOUT.chair.height).toBeGreaterThan(characterFeet);
    expect(ROOM_V2_LAYOUT.monitor.x).toBeGreaterThan(ROOM_V2_LAYOUT.desk.x);
    expect(ROOM_V2_LAYOUT.monitor.x + ROOM_V2_LAYOUT.monitor.width).toBeLessThan(ROOM_V2_LAYOUT.desk.x + ROOM_V2_LAYOUT.desk.width);
  });
});
