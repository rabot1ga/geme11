import React from 'react';
import { useGameStore } from '../store/gameStore';
import { ModularFlatRoom } from './flat/ModularFlatRoom';

/**
 * Dynamic flat pixel-art room on the main page (DayView).
 * Matches the flat 2D perspective of room.webp and reflects owned items,
 * chair, computer setup, wall color, and pet.
 * Tapping opens the full room customizer.
 */
export const HomeRoomCard: React.FC = () => {
  const player = useGameStore((state) => state.player);
  const setView = useGameStore((state) => state.setView);
  if (!player) return null;

  return (
    <section className="room-card" aria-label="Твоя комната">
      <div className="room-card-head">
        <h2>
          <span aria-hidden="true">🛋</span>
          Комната
        </h2>
        <button onClick={() => setView('room')} aria-label="Обустроить комнату">
          Обустроить →
        </button>
      </div>

      <ModularFlatRoom player={player} onClick={() => setView('room')} />

      <span className="room-card-caption">
        Твоя комната · нажми, чтобы настроить мебель, сетап, питомца и стиль
      </span>
    </section>
  );
};
