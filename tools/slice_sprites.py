import os
from PIL import Image

def key_out_magenta(im, threshold=40):
    im = im.convert("RGBA")
    data = im.getdata()
    new_data = []
    # Target magenta: R ~ 255, G ~ 0, B ~ 255
    for item in data:
        r, g, b, a = item
        # Calculate distance to magenta (255, 0, 255)
        dist = ((r - 255)**2 + (g - 0)**2 + (b - 255)**2) ** 0.5
        if dist < threshold or (r > 210 and b > 210 and g < 60):
            new_data.append((0, 0, 0, 0))
        elif dist < threshold + 30:
            # Alpha feathering
            alpha = int(255 * (dist - threshold) / 30)
            new_data.append((r, g, b, min(a, alpha)))
        else:
            new_data.append((r, g, b, a))
    im.putdata(new_data)
    return im

def trim_bbox(im):
    bbox = im.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

os.makedirs('packages/client/public/art/room-modular/chairs', exist_ok=True)
os.makedirs('packages/client/public/art/room-modular/setups', exist_ok=True)
os.makedirs('packages/client/public/art/room-modular/windows', exist_ok=True)
os.makedirs('packages/client/public/art/room-modular/pets', exist_ok=True)
os.makedirs('packages/client/public/art/room-modular/decor', exist_ok=True)
os.makedirs('packages/client/public/art/room-modular/character', exist_ok=True)
os.makedirs('packages/client/public/art/room-modular/backgrounds', exist_ok=True)

# 1. Backgrounds (clean conversion to webp)
for src, dst in [
    ('packages/client/public/art/room-modular/room_studio.png', 'packages/client/public/art/room-modular/backgrounds/bg_0_studio.webp'),
    ('packages/client/public/art/room-modular/room_ref.png', 'packages/client/public/art/room-modular/backgrounds/bg_1_apartment.webp'),
    ('packages/client/public/art/room-modular/room_penthouse.png', 'packages/client/public/art/room-modular/backgrounds/bg_2_penthouse.webp'),
    ('packages/client/public/art/office-flat/office_base.png', 'packages/client/public/art/office-flat/office_base.webp'),
]:
    if os.path.exists(src):
        im = Image.open(src).convert('RGB')
        im.save(dst, 'WEBP', quality=95)
        print(f"Saved {dst}")

# 2. Process Pets
pets_im = Image.open('packages/client/public/art/room-modular/pets_spritesheet.png')
keyed_pets = key_out_magenta(pets_im)
# Dimensions 640x480
# 1) Cat: top-left ~ (20, 40, 210, 200)
# 2) Corgi: top-center ~ (210, 20, 430, 215)
# 3) Robo dog: top-right ~ (380, 100, 630, 320)
# 4) Bulldog: bottom-left ~ (20, 220, 200, 460)
# 5) Parrot: bottom-center ~ (220, 250, 360, 465)
# 6) Hamster: bottom-right ~ (500, 340, 610, 450)

pet_crops = {
    'pet_cat': (20, 30, 210, 200),
    'pet_dog': (210, 20, 430, 215),
    'pet_robo': (380, 90, 630, 320),
    'pet_bulldog': (20, 220, 200, 460),
    'pet_parrot': (220, 250, 360, 465),
    'pet_hamster': (500, 340, 610, 450),
}
for name, box in pet_crops.items():
    crop = keyed_pets.crop(box)
    crop = trim_bbox(crop)
    crop.save(f'packages/client/public/art/room-modular/pets/{name}.png', 'PNG')
    print(f"Saved pet {name}: {crop.size}")

# 3. Process Equipment & Furniture
eq_im = Image.open('packages/client/public/art/room-modular/equipment_spritesheet.png')
keyed_eq = key_out_magenta(eq_im)
eq_crops = {
    'chairs/chair_herman_miller': (25, 55, 175, 260),
    'chairs/chair_gaming': (175, 50, 320, 260),
    'chairs/chair_stool': (320, 100, 430, 250),
    'setups/setup_dual': (420, 65, 630, 200),
    'setups/setup_macbook': (480, 225, 630, 335),
    'setups/setup_ultrawide': (15, 320, 220, 440),
    'setups/setup_laptop': (220, 340, 360, 445),
    'decor/plant_monstera': (340, 275, 480, 445),
    'decor/mech_keyboard': (480, 345, 630, 445),
}
for name, box in eq_crops.items():
    crop = keyed_eq.crop(box)
    crop = trim_bbox(crop)
    crop.save(f'packages/client/public/art/room-modular/{name}.png', 'PNG')
    print(f"Saved eq {name}: {crop.size}")

# 4. Process Windows & Decor
win_im = Image.open('packages/client/public/art/room-modular/windows_decor_spritesheet.png')
keyed_win = key_out_magenta(win_im)
win_crops = {
    'windows/window_day': (10, 10, 220, 275),
    'windows/window_sunset': (220, 10, 430, 275),
    'windows/window_cyber': (430, 10, 630, 275),
    'decor/neon_code': (15, 320, 210, 420),
    'decor/poster_python': (220, 290, 320, 400),
    'decor/poster_js': (320, 290, 420, 400),
    'decor/whiteboard': (430, 305, 630, 445),
    'decor/garland': (215, 410, 430, 470),
}
for name, box in win_crops.items():
    crop = keyed_win.crop(box)
    crop = trim_bbox(crop)
    crop.save(f'packages/client/public/art/room-modular/{name}.png', 'PNG')
    print(f"Saved win {name}: {crop.size}")

# 5. Process Character at Desk
char_im = Image.open('packages/client/public/art/room-modular/character_at_desk.png')
keyed_char = key_out_magenta(char_im)
# Isolate the programmer character sitting at desk
char_crop = keyed_char.crop((230, 30, 640, 480))
char_crop = trim_bbox(char_crop)
char_crop.save('packages/client/public/art/room-modular/character/char_sitting.png', 'PNG')
print(f"Saved character: {char_crop.size}")

print("All modular assets sliced and saved successfully!")
