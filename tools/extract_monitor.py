from PIL import Image

im = Image.open('packages/client/public/art/room-modular/room_ref.png').convert("RGBA")
w, h = im.size
# Monitor is at x: ~140..330, y: ~150..310 in 640x480
x1, y1 = 140, 140
x2, y2 = 330, 310
crop = im.crop((x1, y1, x2, y2))
pix = crop.load()
cw, ch = crop.size
for y in range(ch):
    for x in range(cw):
        r, g, b, a = pix[x, y]
        # Background is dark brown wall (r: 60..90, g: 40..60, b: 30..50) and desk wood (r: 100..160, g: 50..90, b: 20..50)
        # Monitor is black bezel (r<40, g<40, b<40) with blue screen (b>100)
        is_bg = (r > 45 and g > 30 and b < 60) or (r > 90 and g > 50)
        if is_bg:
            pix[x, y] = (0, 0, 0, 0)
crop.save('packages/client/public/art/room-modular/setups/setup_monitor.png', 'PNG')
print("Saved setup_monitor.png")
