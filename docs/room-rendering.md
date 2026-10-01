# Room rendering: status and next steps

## Active renderer

`RoomView` uses `ModularFlatRoom`, which currently selects `RoomV2Stage`. The
empty room and props are separate image layers under
`packages/client/public/art/room-v2/`. Both the DOM renderer and canvas
share-card renderer read the same 4:3 anchors from `roomV2Layout.ts`.

The base plate is 1200 × 896 px. Positions in `ROOM_V2_LAYOUT` are fractions of
that plate; sprite alpha-bounds are measured separately because source PNGs
contain transparent padding. Measurement, pixel bounds, and the next geometry
iteration live in [`room-v2-layout.md`](room-v2-layout.md). The character body
is rendered behind the desk so the tabletop occludes its lap; chair and person
anchors were resized/repositioned after calculating their visible bounds.

Window views are clipped by placement to the two glass panes, leaving the
mullion and frame in the base plate. Desktop setups render one monitor; laptop
setups render one laptop instead. The same layer order and equipment selection
are used by the share-card canvas renderer.

## Known limitations / active to-do

- The generated prop PNGs have checkerboards baked into RGB. Hand-traced alpha
  masks are experimental. The chair currently reuses an existing transparent
  sprite; the generated chair mask is not accepted.
- The current seated-character source was not drawn to this desk's perspective.
  Its body can sit behind the desk, but its hands cannot yet be cleanly separated
  onto the tabletop; a cleaner seated pose/hand layer is needed.
- Only the poster and plant variants currently have matching new layers. Other
  decor/atmosphere options still need assets and slot mapping; `window_blinds`
  currently uses the blinds painted in the base plate.
- The share-card now uses the same anchors, but still needs a browser visual
  comparison at its actual output size.
- The older room manifest and legacy room renderers remain in the repository;
  their coordinates do not control the v2 4:3 stage. Avoid treating the old
  manifest rectangles as validated v2 geometry.

## Validation

The current measured-geometry pass passes the client production build, content
validation (0 errors/warnings), 116 client tests, and `git diff --check`.
