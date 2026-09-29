from PIL import Image

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
            is_magenta = (r > 180 and b > 180 and g < 120) or \
                         (r > 140 and b > 140 and g < 70 and abs(r - b) < 60) or \
                         ((r - 255)**2 + g**2 + (b - 255)**2)**0.5 < 90
            if is_magenta:
                pix[x, y] = (0, 0, 0, 0)
            elif (r > 120 and b > 120 and g < 90 and abs(r - b) < 50):
                # Desaturate fringe to match dark outline
                gray = int(g * 0.5)
                pix[x, y] = (gray, gray, gray, a)
    return im

for path in [
    'packages/client/public/art/room-modular/character/char_sitting.png',
]:
    im = Image.open(path)
    im = clean_keyed_image(im)
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    im.save(path)
    print("Cleaned", path)
