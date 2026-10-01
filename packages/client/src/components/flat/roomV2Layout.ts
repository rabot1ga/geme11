import type { CSSProperties } from 'react';

export interface RoomAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** All anchors are percentages of the 1200 × 896, 4:3 room plate. */
export const ROOM_V2_LAYOUT = {
  room: { x: 0, y: 0, width: 1, height: 1 },
  windowTop: { x: 0.808, y: 0.222, width: 0.135, height: 0.174 },
  windowBottom: { x: 0.808, y: 0.418, width: 0.135, height: 0.266 },
  poster: { x: 0.325, y: 0.229, width: 0.15, height: 0.201 },
  plant: { x: 0.792, y: 0.742, width: 0.142, height: 0.104 },
  chair: { x: 0.444, y: 0.43, width: 0.15, height: 0.3125 },
  desk: { x: 0.217, y: 0.43, width: 0.60, height: 0.439 },
  monitor: { x: 0.59, y: 0.455, width: 0.158, height: 0.13 },
  character: { x: 0.292, y: 0.402, width: 0.475, height: 0.348 },
  pet: { x: 0.70, y: 0.79, width: 0.12, height: 0.13 },
} as const satisfies Record<string, RoomAnchor>;

export function roomAnchorStyle(anchor: RoomAnchor): CSSProperties {
  return {
    left: `${anchor.x * 100}%`,
    top: `${anchor.y * 100}%`,
    width: `${anchor.width * 100}%`,
    height: `${anchor.height * 100}%`,
  };
}
