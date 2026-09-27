import React from 'react';
import { useGameStore } from '../store/gameStore';
import { FlatRoom } from './room/FlatRoom';

/** Home preview of the player's flat modular room; tapping opens the full room editor. */
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

      <div onClick={() => setView('room')} className="cursor-pointer">
        <FlatRoom player={player} />
      </div>

      <span className="room-card-caption">
        Твоя комната · нажми на комнату или «Обустроить», чтобы настроить мебель и технику
      </span>
    </section>
  );
};
