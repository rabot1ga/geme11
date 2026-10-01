import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoomV2Stage } from '../RoomV2Stage';
import type { FlatRoomComposition } from '../flatRoomComposition';

const baseComposition: FlatRoomComposition = {
  bg: 'bg_0',
  window: 'window_night',
  chair: 'chair_office',
  setup: 'setup_dual',
  atmosphere: 'atmo_plant',
  decor: 'decor_posters',
  pet: null,
  showCharacter: true,
};

function renderStage(composition: FlatRoomComposition = baseComposition) {
  return render(<RoomV2Stage player={{ housingLevel: 0 } as never} composition={composition} />);
}

describe('layered room v2', () => {
  it('renders separate furniture layers with a seated character and matching glass panes', () => {
    renderStage();
    expect(screen.getByAltText('Пустая комната с окном')).toBeTruthy();
    expect(screen.getByAltText('Рабочий стол')).toBeTruthy();
    expect(screen.getByAltText('Офисное кресло')).toBeTruthy();
    expect(screen.getByAltText('Персонаж сидит за рабочим столом')).toBeTruthy();
    expect(screen.getByAltText('Монитор')).toBeTruthy();
    expect(screen.getAllByAltText(/вид из .* части окна/i)).toHaveLength(2);
    expect(screen.getAllByAltText(/вид из .* части окна/i).every((image) => image.getAttribute('src') === '/art/room/windows/window_night.webp')).toBe(true);
  });

  it('draws the seated body behind the desk and device in front', () => {
    const { container } = renderStage();
    const images = Array.from(container.querySelectorAll('img'));
    const body = images.findIndex((image) => image.src.endsWith('/character-layer.png'));
    const desk = images.findIndex((image) => image.alt === 'Рабочий стол');
    const monitor = images.findIndex((image) => image.alt === 'Монитор');
    expect(body).toBeLessThan(desk);
    expect(desk).toBeLessThan(monitor);
  });

  it('never stacks monitor variants and omits the monitor for laptop-only setups', () => {
    const { container, rerender } = renderStage({ ...baseComposition, setup: 'setup_gaming' });
    expect(container.querySelectorAll('img[alt="Монитор"]')).toHaveLength(1);
    rerender(<RoomV2Stage player={{ housingLevel: 0 } as never} composition={{ ...baseComposition, setup: 'setup_laptop' }} />);
    expect(container.querySelectorAll('img[alt="Монитор"]')).toHaveLength(0);
    expect(screen.getByAltText('Ноутбук на столе')).toBeTruthy();
  });
});
