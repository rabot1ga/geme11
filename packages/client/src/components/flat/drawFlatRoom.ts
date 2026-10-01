import type { PlayerState } from '@itsim/shared';
import { buildFlatRoomComposition } from './flatRoomComposition';
import { ROOM_V2_LAYOUT, type RoomAnchor } from './roomV2Layout';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function drawAt(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  box: Box,
  anchor: RoomAnchor
): void {
  ctx.drawImage(
    image,
    box.x + box.w * anchor.x,
    box.y + box.h * anchor.y,
    box.w * anchor.width,
    box.h * anchor.height
  );
}

/** Match CSS object-fit: cover for landscape art placed inside the window panes. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  box: Box,
  anchor: RoomAnchor
): void {
  const dx = box.x + box.w * anchor.x;
  const dy = box.y + box.h * anchor.y;
  const dw = box.w * anchor.width;
  const dh = box.h * anchor.height;
  const sourceRatio = image.width / image.height;
  const targetRatio = dw / dh;
  let sx = 0;
  let sy = 0;
  let sw = image.width;
  let sh = image.height;
  if (sourceRatio > targetRatio) {
    sw = image.height * targetRatio;
    sx = (image.width - sw) / 2;
  } else {
    sh = image.width / targetRatio;
    sy = (image.height - sh) / 2;
  }
  ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
}

async function drawOptional(
  ctx: CanvasRenderingContext2D,
  src: string,
  box: Box,
  anchor: RoomAnchor,
  fit: 'fill' | 'cover' = 'fill'
): Promise<void> {
  try {
    const image = await loadImage(src);
    if (fit === 'cover') drawCover(ctx, image, box, anchor);
    else drawAt(ctx, image, box, anchor);
  } catch {
    // Optional room layers can be absent without hiding the room behind them.
  }
}

/** Draw the same normalized, independent layers as RoomV2Stage for share cards. */
export async function drawFlatRoom(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  box: Box
): Promise<void> {
  const composition = buildFlatRoomComposition(player);
  const art = '/art/room-v2';
  ctx.save();
  ctx.imageSmoothingEnabled = false;

  try {
    drawAt(ctx, await loadImage(`${art}/base-room.png`), box, ROOM_V2_LAYOUT.room);
  } catch {
    try {
      drawAt(ctx, await loadImage('/art/story-v1/room.webp'), box, ROOM_V2_LAYOUT.room);
    } catch {
      ctx.fillStyle = '#281812';
      ctx.fillRect(box.x, box.y, box.w, box.h);
    }
  }

  // Tint only the base plate; props retain their original palette.
  if (composition.wallColor && composition.wallColor !== 'transparent') {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = composition.wallColor;
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.restore();
  }

  // The same selected view is repeated across the two pane anchors; mullion/frame stay uncovered.
  if (composition.window !== 'window_blinds') {
    const viewPath = `/art/room/windows/${composition.window}.webp`;
    await drawOptional(ctx, viewPath, box, ROOM_V2_LAYOUT.windowTop, 'cover');
    await drawOptional(ctx, viewPath, box, ROOM_V2_LAYOUT.windowBottom, 'cover');
  }
  if (composition.decor === 'decor_posters') {
    await drawOptional(ctx, `${art}/poster-layer.png`, box, ROOM_V2_LAYOUT.poster);
  }
  if (composition.atmosphere === 'atmo_plant') {
    await drawOptional(ctx, `${art}/plant-layer.png`, box, ROOM_V2_LAYOUT.plant);
  }

  // Contact shadow and chair sit on the same floor anchor in DOM and canvas renders.
  const chairPath = ['chair_gaming', 'chair_throne'].includes(composition.chair)
    ? '/art/room-modular/chairs/chair_gaming.png'
    : '/art/room-modular/chairs/chair_office.png';
  const chairCenterX = ROOM_V2_LAYOUT.chair.x + ROOM_V2_LAYOUT.chair.width / 2;
  const chairFloorY = ROOM_V2_LAYOUT.chair.y + ROOM_V2_LAYOUT.chair.height;
  const shadowX = box.x + box.w * chairCenterX;
  const shadowY = box.y + box.h * chairFloorY;
  const shadowRadius = box.w * 0.08;
  const shadow = ctx.createRadialGradient(shadowX, shadowY, 0, shadowX, shadowY, shadowRadius);
  shadow.addColorStop(0, 'rgba(0,0,0,0.32)');
  shadow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.ellipse(shadowX, shadowY, shadowRadius, box.h * 0.018, 0, 0, Math.PI * 2);
  ctx.fill();
  await drawOptional(ctx, chairPath, box, ROOM_V2_LAYOUT.chair);

  // Seat the body behind the desk: the desktop occludes the lap naturally.
  if (composition.showCharacter) {
    await drawOptional(ctx, `${art}/character-layer.png`, box, ROOM_V2_LAYOUT.character);
  }
  await drawOptional(ctx, `${art}/desk-layer.png`, box, ROOM_V2_LAYOUT.desk);

  // Exclusive workstation slot: one monitor or one laptop, never both.
  if (!['setup_laptop', 'setup_macbook'].includes(composition.setup)) {
    await drawOptional(ctx, `${art}/monitor-layer.png`, box, ROOM_V2_LAYOUT.monitor);
  } else {
    await drawOptional(ctx, '/art/room-modular/setups/setup_laptop.png', box, ROOM_V2_LAYOUT.monitor);
  }

  if (composition.pet) {
    const petPath = composition.pet === 'pet_cat'
      ? '/art/room/pets/pet_cat.webp'
      : `/iso/${composition.pet}.png`;
    await drawOptional(ctx, petPath, box, ROOM_V2_LAYOUT.pet);
  }
  ctx.restore();
}
