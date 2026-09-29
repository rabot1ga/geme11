import { PlayerState } from '@itsim/shared';
import { buildFlatRoomComposition } from './flatRoomComposition';

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

export async function drawFlatRoom(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  box: Box
): Promise<void> {
  const comp = buildFlatRoomComposition(player);

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // 1. Draw Room Background
  const bgUrl = `/art/room/bg/${comp.bg}.webp`;
  let bgImg: HTMLImageElement;
  try {
    bgImg = await loadImage(bgUrl);
  } catch {
    bgImg = await loadImage('/art/story-v1/room.webp');
  }

  ctx.drawImage(bgImg, box.x, box.y, box.w, box.h);

  // 2. Wall Color Tint
  if (comp.wallColor && comp.wallColor !== 'transparent') {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = comp.wallColor;
    ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.restore();
  }

  // 2.5 Draw Window
  try {
    const winImg = await loadImage(`/art/room/windows/${comp.window}.webp`);
    ctx.drawImage(
      winImg,
      Math.round(box.x + box.w * 0.819),
      Math.round(box.y + box.h * 0.162),
      Math.round(box.w * 0.155),
      Math.round(box.h * 0.431)
    );
  } catch {
    // default window in bg
  }

  // 3. Draw Sitting Character (if enabled)
  if (comp.showCharacter) {
    try {
      const charImg = await loadImage('/art/room/character/char_sitting_full.webp');
      ctx.drawImage(charImg, box.x, box.y, box.w, box.h);
    } catch (e) {
      // ignore
    }
  }

  // 4. Draw Pet (if owned/equipped)
  if (comp.pet) {
    try {
      const petSrc = comp.pet === 'pet_cat' ? '/art/room/pets/pet_cat.webp' : `/iso/${comp.pet}.png`;
      const petImg = await loadImage(petSrc);
      const petW = Math.round(box.w * 0.15);
      const petH = Math.round(petW * (petImg.height / petImg.width));
      const petX = Math.round(box.x + box.w * 0.63);
      const petY = Math.round(box.y + box.h * 0.88 - petH);
      ctx.drawImage(petImg, petX, petY, petW, petH);
    } catch (e) {
      // ignore
    }
  }

  ctx.restore();
}
