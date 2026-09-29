from PIL import Image
import os

def clean_keyed_image(im):
    im = im.convert("RGBA")
    w, h = im.size
    pix = im.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a == 0:
                continue
            # Magenta detection: high R and B, low G
            is_magenta = (r > 175 and b > 175 and g < 130) or \
                         (r > 130 and b > 130 and g < 60 and abs(r - b) < 70) or \
                         ((r - 255)**2 + g**2 + (b - 255)**2)**0.5 < 100
            if is_magenta:
                pix[x, y] = (0, 0, 0, 0)
            elif (r > 110 and b > 110 and g < 90 and abs(r - b) < 60):
                # Desaturate edge fringe to dark outline
                gray = int(g * 0.4)
                pix[x, y] = (gray, gray, gray, a)
    return im

def process_sheet(src_path, crops_dict):
    im = Image.open(src_path)
    im_keyed = clean_keyed_image(im)
    for out_rel_path, box in crops_dict.items():
        cropped = im_keyed.crop(box)
        bbox = cropped.getbbox()
        if bbox:
            cropped = cropped.crop(bbox)
        dest = os.path.join('packages/client/public/art/room-modular', out_rel_path)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        cropped.save(dest, 'PNG')
        print(f"Saved {out_rel_path}: {cropped.size}")

# Pets (1195x896)
pets_crops = {
    'pets/pet_cat.png': (20, 50, 400, 380),
    'pets/pet_dog.png': (400, 40, 800, 400),
    'pets/pet_robo.png': (700, 180, 1180, 600),
    'pets/pet_bulldog.png': (30, 420, 380, 880),
    'pets/pet_parrot.png': (410, 480, 680, 880),
    'pets/pet_hamster.png': (940, 650, 1150, 860),
}
process_sheet('packages/client/public/art/room-modular/pets_spritesheet.png', pets_crops)

# Equipment (1195x896)
eq_crops = {
    'chairs/chair_herman_miller.png': (40, 100, 320, 490),
    'chairs/chair_gaming.png': (330, 90, 600, 500),
    'chairs/chair_stool.png': (600, 190, 800, 480),
    'setups/setup_dual.png': (780, 130, 1180, 380),
    'setups/setup_macbook.png': (890, 430, 1180, 630),
    'setups/setup_ultrawide.png': (25, 610, 410, 840),
    'setups/setup_laptop.png': (415, 650, 670, 850),
    'decor/plant_monstera.png': (640, 520, 900, 850),
    'decor/mech_keyboard.png': (900, 650, 1180, 850),
}
process_sheet('packages/client/public/art/room-modular/equipment_spritesheet.png', eq_crops)

# Windows & Decor (1195x896)
win_crops = {
    'windows/window_day.png': (20, 20, 410, 510),
    'windows/window_sunset.png': (410, 20, 810, 510),
    'windows/window_cyber.png': (810, 20, 1180, 510),
    'decor/neon_code.png': (25, 620, 390, 800),
    'decor/poster_python.png': (420, 560, 600, 770),
    'decor/poster_js.png': (600, 560, 790, 770),
    'decor/whiteboard.png': (820, 580, 1180, 850),
    'decor/garland.png': (410, 780, 800, 900),
}
process_sheet('packages/client/public/art/room-modular/windows_decor_spritesheet.png', win_crops)

print("Done slicing and cleaning all modular assets!")
