from PIL import Image

def key_out_magenta(im, threshold=50):
    im = im.convert("RGBA")
    data = im.getdata()
    new_data = []
    for r, g, b, a in data:
        dist = ((r - 255)**2 + (g - 0)**2 + (b - 255)**2) ** 0.5
        # If color is close to magenta
        if dist < threshold or (r > 190 and b > 190 and g < 70):
            new_data.append((0, 0, 0, 0))
        elif dist < threshold + 25:
            alpha = int(255 * (dist - threshold) / 25)
            new_data.append((r, g, b, min(a, alpha)))
        else:
            new_data.append((r, g, b, a))
    im.putdata(new_data)
    return im

char_im = Image.open('packages/client/public/art/room-modular/character_at_desk.png')
keyed = key_out_magenta(char_im)
# In 1195x896, character is on the right side:
# Let's crop from x ~ 400 to 1195, y ~ 60 to 896
char_person = keyed.crop((440, 60, 1190, 896))
bbox = char_person.getbbox()
if bbox:
    char_person = char_person.crop(bbox)
char_person.save('packages/client/public/art/room-modular/character/char_sitting.png')
print('Character saved:', char_person.size)
