import type { CSSProperties } from 'react';
import type { LayerManifest, NormalizedRect } from '@itsim/shared';

/** Load and memoize room layout metadata from the shared content API. */
let manifestRequest: Promise<LayerManifest | null> | null = null;
export function fetchRoomManifest(): Promise<LayerManifest | null> {
  if (!manifestRequest) {
    manifestRequest = fetch('/api/content/layers')
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = await response.json();
        return payload.room ?? null;
      })
      .catch((error) => {
        console.warn('Unable to load room layout manifest', error);
        manifestRequest = null;
        return null;
      });
  }
  return manifestRequest;
}

/** Entry-specific position overrides its slot position. */
export function findRoomPosition(
  manifest: LayerManifest | null | undefined,
  slotId: string,
  entryId?: string
): NormalizedRect | null {
  const slot = manifest?.slots.find((candidate) => candidate.id === slotId);
  if (!slot) return null;
  return (entryId ? slot.entries.find((entry) => entry.id === entryId)?.position : undefined) ?? slot.position ?? null;
}

export function normalizedRectStyle(rect: NormalizedRect | null | undefined): CSSProperties {
  if (!rect) return {};
  return {
    left: `${rect.x * 100}%`,
    top: `${rect.y * 100}%`,
    width: `${rect.width * 100}%`,
    ...(rect.height == null ? {} : { height: `${rect.height * 100}%` }),
  };
}
