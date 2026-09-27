from PIL import Image

def extract_chair_office():
    # From room_studio.png
    im = Image.open('packages/client/public/art/room-modular/room_studio.png').convert("RGBA")
    # Studio chair is at x: 380..580, y: 390..780 in 1195x896 (or in 640x480: x: 215..325, y: 210..415)
    # Let's crop in relative terms
    w, h = im.size
    x1, y1 = int(w * 0.34), int(h * 0.44)
    x2, y2 = int(w * 0.54), int(h * 0.85)
    chair = im.crop((x1, y1, x2, y2))
    # Make background transparent: studio wall is beige/striped (R>180, G>180, B>150) and floor is wood orange (R>150, G>80)
    # The chair is dark grey/black (R<80, G<80, B<80)
    pix = chair.load()
    cw, ch = chair.size
    for y in range(ch):
        for x in range(cw):
            r, g, b, a = pix[x, y]
            # If not dark grey/black chair material
            if (r > 100 or g > 95 or b > 90) and (y < ch * 0.65 or r > 120):
                pix[x, y] = (0, 0, 0, 0)
    chair.save('packages/client/public/art/room-modular/chairs/chair_office.png', 'PNG')
    print("Saved chair_office.png")

def extract_chair_leather():
    # From room_ref.png
    im = Image.open('packages/client/public/art/room-modular/room_ref.png').convert("RGBA")
    w, h = im.size
    x1, y1 = int(w * 0.33), int(h * 0.41)
    x2, y2 = int(w * 0.55), int(h * 0.84)
    chair = im.crop((x1, y1, x2, y2))
    pix = chair.load()
    cw, ch = chair.size
    for y in range(ch):
        for x in range(cw):
            r, g, b, a = pix[x, y]
            # Dark black leather: r<70, g<70, b<70
            if r > 80 or g > 80 or b > 80:
                pix[x, y] = (0, 0, 0, 0)
    chair.save('packages/client/public/art/room-modular/chairs/chair_leather.png', 'PNG')
    print("Saved chair_leather.png")

extract_chair_office()
extract_chair_leather()
