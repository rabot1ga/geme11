from PIL import Image

def trim_bottom_text(path, cut_bottom_px):
    im = Image.open(path)
    w, h = im.size
    cropped = im.crop((0, 0, w, max(1, h - cut_bottom_px)))
    bbox = cropped.getbbox()
    if bbox:
        cropped = cropped.crop(bbox)
    cropped.save(path)
    print(f"Trimmed {path}: {cropped.size}")

# Items with labels underneath:
trim_bottom_text('packages/client/public/art/room-modular/chairs/chair_herman_miller.png', 38)
trim_bottom_text('packages/client/public/art/room-modular/chairs/chair_gaming.png', 38)
trim_bottom_text('packages/client/public/art/room-modular/chairs/chair_stool.png', 38)
trim_bottom_text('packages/client/public/art/room-modular/setups/setup_dual.png', 38)
trim_bottom_text('packages/client/public/art/room-modular/setups/setup_ultrawide.png', 38)
trim_bottom_text('packages/client/public/art/room-modular/setups/setup_laptop.png', 38)
trim_bottom_text('packages/client/public/art/room-modular/decor/plant_monstera.png', 38)
trim_bottom_text('packages/client/public/art/room-modular/decor/mech_keyboard.png', 38)
