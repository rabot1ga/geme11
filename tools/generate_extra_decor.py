from PIL import Image, ImageDraw

def make_cactus():
    im = Image.new("RGBA", (120, 150), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # Pot
    d.polygon([(30, 90), (90, 90), (80, 140), (40, 140)], fill=(195, 100, 60), outline=(50, 25, 15), width=3)
    # Rim
    d.rectangle([(25, 80), (95, 92)], fill=(215, 115, 75), outline=(50, 25, 15), width=3)
    # Cactus stem
    d.rounded_rectangle([(48, 30), (72, 85)], radius=12, fill=(45, 150, 75), outline=(20, 70, 35), width=3)
    # Left arm
    d.rounded_rectangle([(25, 45), (50, 62)], radius=8, fill=(45, 150, 75), outline=(20, 70, 35), width=3)
    d.rounded_rectangle([(25, 30), (38, 55)], radius=6, fill=(45, 150, 75), outline=(20, 70, 35), width=3)
    # Right arm
    d.rounded_rectangle([(70, 40), (95, 57)], radius=8, fill=(45, 150, 75), outline=(20, 70, 35), width=3)
    d.rounded_rectangle([(82, 25), (95, 50)], radius=6, fill=(45, 150, 75), outline=(20, 70, 35), width=3)
    # Flower on top
    d.ellipse([(55, 20), (65, 30)], fill=(255, 80, 120), outline=(150, 20, 50), width=2)
    im.save('packages/client/public/art/room-modular/pets/pet_cactus.png', 'PNG')
    print("Saved pet_cactus.png")

def make_coffee_maker():
    im = Image.new("RGBA", (140, 160), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # Base and body
    d.rounded_rectangle([(30, 20), (110, 150)], radius=8, fill=(40, 44, 52), outline=(20, 22, 26), width=3)
    # Chrome accents
    d.rectangle([(40, 30), (100, 45)], fill=(180, 185, 195), outline=(100, 105, 115), width=2)
    # Pressure gauge
    d.ellipse([(60, 50), (80, 70)], fill=(240, 240, 245), outline=(50, 50, 60), width=2)
    d.line([(70, 60), (76, 56)], fill=(220, 40, 40), width=2)
    # Cup niche
    d.rectangle([(42, 85), (98, 135)], fill=(25, 28, 34), outline=(15, 18, 22), width=2)
    # Coffee cup
    d.rectangle([(55, 110), (85, 132)], fill=(245, 245, 250), outline=(60, 60, 70), width=2)
    # Handle
    d.arc([(80, 114), (92, 128)], start=-90, end=90, fill=(60, 60, 70), width=2)
    # Drip
    d.line([(70, 85), (70, 110)], fill=(120, 70, 40), width=2)
    im.save('packages/client/public/art/room-modular/decor/coffee_maker.png', 'PNG')
    print("Saved coffee_maker.png")

make_cactus()
make_coffee_maker()
