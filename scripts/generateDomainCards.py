from PIL import Image, ImageDraw, ImageFont
import os

def create_domain_comparison():
    img1_path = '/Users/workpc/.gemini/antigravity/brain/c532ba69-f1f6-4351-8442-ec293734333e/.user_uploaded/media_1793445701507_58bf2da6.png'
    img2_path = '/Users/workpc/.gemini/antigravity/brain/c532ba69-f1f6-4351-8442-ec293734333e/.user_uploaded/media_1793445701508_2ad47513.png'

    im1 = Image.open(img1_path).convert('RGB')
    im2 = Image.open(img2_path).convert('RGB')

    # Crop the cart item card (x: 120 to 620, y: 190 to 320)
    # This shows the www icon, stones-pumping.com, the year dropdown, and the price!
    card1 = im1.crop((125, 195, 615, 315))
    card2 = im2.crop((125, 195, 615, 315))

    w, h = card1.size
    total_w = w + 40
    total_h = h * 2 + 130

    combined = Image.new('RGB', (total_w, total_h), color=(248, 250, 252))
    draw = ImageDraw.Draw(combined)

    # Title Banner
    draw.rounded_rectangle([15, 15, total_w - 15, 65], radius=10, fill=(15, 23, 42))
    
    # Try default or truetype font
    try:
        font_title = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 20)
        font_sub = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 14)
        font_price = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 16)
    except:
        font_title = font_sub = font_price = ImageFont.load_default()

    draw.text((28, 27), "AVAILABLE DOMAIN: stones-pumping.com", fill=(255, 255, 255), font=font_title)

    # Option 1: 1 Year
    y1 = 80
    draw.text((22, y1), "OPTION A: 1 YEAR REGISTRATION ($12.99)", fill=(30, 41, 59), font=font_sub)
    combined.paste(card1, (20, y1 + 22))
    # Highlight box around 1 Year
    draw.rounded_rectangle([20, y1 + 22, 20 + w, y1 + 22 + h], radius=8, outline=(16, 185, 129), width=3)

    # Option 2: 3 Years
    y2 = y1 + 22 + h + 25
    draw.text((22, y2), "OPTION B: 3 YEARS LOCK-IN ($45.99 - RECOMMENDED)", fill=(30, 41, 59), font=font_sub)
    combined.paste(card2, (20, y2 + 22))
    # Highlight box around 3 Years
    draw.rounded_rectangle([20, y2 + 22, 20 + w, y2 + 22 + h], radius=8, outline=(37, 99, 235), width=3)

    os.makedirs('public/domains', exist_ok=True)
    out_file = 'public/domains/stones-pumping-options.jpg'
    combined.save(out_file, quality=95)
    print(f"Created: {out_file} ({combined.size})")

create_domain_comparison()
