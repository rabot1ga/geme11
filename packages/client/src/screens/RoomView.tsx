import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { FlatRoom } from '../components/room/FlatRoom';
import { FlatRoomEditor } from '../components/room/FlatRoomEditor';
import { ScreenTitle, SectionTitle, EmptyState } from '../components/ui';
import { Wardrobe } from '../components/room/Wardrobe';
import { ShareCard } from '../components/room/ShareCard';
import { haptic } from '../lib/telegram';
import { buildAvatarData, fetchPixelPack, PixelAvatarData } from '../components/room/pixelAvatar';
import { PixelIdentity } from '../components/room/PixelIdentity';

/**
 * «Дом» — 2D flat modular pixel-art room, room customizer, wardrobe,
 * NFT inventory, and share card.
 */
export const RoomView: React.FC = () => {
  const player = useGameStore((s) => s.player);
  const bindWallet = useGameStore((s) => s.bindWallet);
  const setMockCollections = useGameStore((s) => s.setMockCollections);
  const inventory = useGameStore((s) => s.inventory);
  const heldCollections = useGameStore((s) => s.heldCollections);

  const [geneticsConfig, setGeneticsConfig] = useState<any>(null);
  const [avatarManifest, setAvatarManifest] = useState<any>(null);
  const [crossCollections, setCrossCollections] = useState<any[]>([]);
  const [pixelPack, setPixelPack] = useState<Awaited<ReturnType<typeof fetchPixelPack>>>(null);
  const [walletInput, setWalletInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(true);
  const [wardrobeOpen, setWardrobeOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/content/genetics').then((r) => r.json()),
      fetch('/api/content/layers').then((r) => r.json()),
      fetch('/api/content/cross-collections').then((r) => r.json()),
      fetchPixelPack(),
    ])
      .then(([g, l, c, pixel]) => {
        setGeneticsConfig(g.genetics);
        setAvatarManifest(l.avatar);
        setCrossCollections(c.crossCollections?.collections ?? []);
        setPixelPack(pixel);
      })
      .catch(() => setError('Не удалось загрузить контент'));
  }, []);

  if (!player) return null;

  const pixelAvatarData: PixelAvatarData | null =
    pixelPack && player.genetics ? buildAvatarData(pixelPack, player.genetics, player.avatar) : null;

  const traits = player.genetics;
  const ready = geneticsConfig && avatarManifest && traits;

  const displayTraits = traits && player?.room?.wallColor ? { ...traits, wallColor: player.room.wallColor } : traits;

  const handleBind = async () => {
    const ok = await bindWallet(walletInput.trim());
    setError(ok ? null : 'Не удалось привязать кошелёк (проверь формат base58)');
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <ScreenTitle
        emoji="🏠"
        meta={
          traits ? (
            <span className="num truncate max-w-[120px]" title={traits.seed}>
              seed {traits.seed.slice(0, 8)}…
            </span>
          ) : undefined
        }
      >
        Дом
      </ScreenTitle>

      {/* Flat Modular Pixel-Art Room */}
      <FlatRoom player={player} />

      {/* Room Modular Customizer */}
      <div className="card">
        <button
          onClick={() => {
            haptic('selection');
            setEditorOpen((v) => !v);
          }}
          aria-expanded={editorOpen}
          className="w-full flex items-center justify-between touch-target"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-ink-100">
            <span aria-hidden="true">🛋️</span>
            Обустроить комнату
          </span>
          <span aria-hidden="true" className={`accordion-chevron ${editorOpen ? 'is-open' : ''}`}>
            ▾
          </span>
        </button>
        <div className={`accordion-body ${editorOpen ? 'open' : ''}`}>
          <div className="accordion-inner">
            <div className="pt-3">
              <FlatRoomEditor player={player} />
            </div>
          </div>
        </div>
      </div>

      {/* Wardrobe */}
      {ready && (
        <div className="card">
          <button
            onClick={() => {
              haptic('selection');
              setWardrobeOpen((v) => !v);
            }}
            aria-expanded={wardrobeOpen}
            className="w-full flex items-center justify-between touch-target"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-ink-100">
              <span aria-hidden="true">👕</span>
              Гардероб
            </span>
            <span aria-hidden="true" className={`accordion-chevron ${wardrobeOpen ? 'is-open' : ''}`}>
              ▾
            </span>
          </button>
          <div className={`accordion-body ${wardrobeOpen ? 'open' : ''}`}>
            <div className="accordion-inner">
              <div className="pt-3">
                <Wardrobe avatarManifest={avatarManifest} traits={traits} player={player} />
              </div>
            </div>
          </div>
        </div>
      )}

      {pixelAvatarData && pixelPack && <PixelIdentity pack={pixelPack} data={pixelAvatarData} />}

      {error && (
        <div role="alert" className="card card-sm">
          <p className="text-sm text-clay-300">⚠ {error}</p>
        </div>
      )}

      {/* Wallet */}
      <div className="card">
        <SectionTitle className="mb-3">Кошелёк Solana</SectionTitle>
        {player.walletAddress ? (
          <p className="num text-xs text-moss-300 break-all">{player.walletAddress}</p>
        ) : (
          <div className="flex gap-2">
            <input
              value={walletInput}
              onChange={(e) => setWalletInput(e.target.value)}
              placeholder="Base58 адрес…"
              className="input flex-1 min-w-0"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="done"
            />
            <button onClick={handleBind} disabled={walletInput.trim().length < 32} className="btn btn-primary shrink-0">
              Привязать
            </button>
          </div>
        )}
        <p className="subtle mt-3">
          Генетика персонажа детерминированно привязана к кошельку. В проде — через Solana Wallet Adapter.
        </p>
      </div>

      {/* NFT inventory */}
      <div className="card">
        <SectionTitle className="mb-3">NFT-предметы (мок)</SectionTitle>
        {(inventory ?? []).length === 0 ? (
          <EmptyState
            bare
            emoji="📦"
            title="NFT пока нет"
            hint="Загляни в магазин (Herman Miller, MacBook…) или открой лутбоксы на Claim-сайте."
          />
        ) : (
          <div className="space-y-1.5">
            {(inventory ?? []).map((nft: any) => (
              <div key={nft.name} className="well flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-ink-100">{nft.name}</p>
                  <p className="num text-2xs text-ink-500 truncate">
                    {nft.attributes?.map((a: any) => `${a.trait_type}:${a.value}`).join(' · ')}
                  </p>
                </div>
                <span className="num text-2xs text-sky-300">{nft.symbol}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cross-collection synergies */}
      <div className="card">
        <SectionTitle className="mb-3">Cross-collection (мок-детект)</SectionTitle>
        <div className="space-y-2">
          {crossCollections.map((c: any) => {
            const held = (heldCollections ?? []).includes(c.collectionId);
            const bonuses = (c.bonuses ?? []).map((b: any) => `${b.type}=${b.value}`).join(', ');
            return (
              <button
                key={c.collectionId}
                onClick={() =>
                  setMockCollections(
                    held
                      ? (heldCollections ?? []).filter((x: string) => x !== c.collectionId)
                      : [...(heldCollections ?? []), c.collectionId]
                  )
                }
                className={`tile w-full flex items-center justify-between gap-2 text-left ${held ? 'is-chosen' : ''}`}
              >
                <div className="min-w-0">
                  <p className="text-sm text-ink-100">{c.collectionName}</p>
                  <p className="text-2xs text-ink-500 truncate">
                    {c.nftType} → {c.layerId}
                    {bonuses ? ` · ${bonuses}` : ''}
                  </p>
                </div>
                <span aria-hidden="true" className={held ? 'text-moss-300' : 'text-ink-500'}>
                  {held ? '✓' : '+'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Share card */}
      {ready && <ShareCard traits={displayTraits} player={player} />}
    </div>
  );
};
