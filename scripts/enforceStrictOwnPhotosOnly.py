#!/usr/bin/env python3
"""
enforceStrictOwnPhotosOnly.py
Enforces 100% authenticity rule:
- Leads with 0 original photos have ALL photos removed (clean text-only showcase).
- Leads with original photos keep ONLY their OWN photos (zero foreign pool photos).
- No foreign photos anywhere for call campaign leads.
"""

import json
import os
import glob
import shutil
import re
from PIL import Image, ImageFilter

def smart_frame_machinery(src_path, dest_path, target_w=1200, target_h=750):
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    with Image.open(src_path) as img:
        img = img.convert('RGB')
        orig_w, orig_h = img.size
        aspect = orig_w / orig_h
        target_aspect = target_w / target_h  # 1.6 (16:10)

        # 1. Landscape close to 16:10 (1.45 to 1.8)
        if 1.45 <= aspect <= 1.8:
            if aspect > target_aspect:
                new_w = int(orig_h * target_aspect)
                left = (orig_w - new_w) // 2
                cropped = img.crop((left, 0, left + new_w, orig_h))
            else:
                new_h = int(orig_w / target_aspect)
                top = int((orig_h - new_h) * 0.35)
                cropped = img.crop((0, top, orig_w, top + new_h))
            final = cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
            final.save(dest_path, 'JPEG', quality=88, optimize=True)
            return 'cropped_landscape'

        # 2. Panoramic (> 1.8)
        elif aspect > 1.8:
            new_w = int(orig_h * target_aspect)
            left = (orig_w - new_w) // 2
            cropped = img.crop((left, 0, left + new_w, orig_h))
            final = cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
            final.save(dest_path, 'JPEG', quality=88, optimize=True)
            return 'cropped_panorama'

        # 3. Portrait or near-square (< 1.45)
        else:
            scale_bg = max(target_w / orig_w, target_h / orig_h)
            bg_w, bg_h = int(orig_w * scale_bg), int(orig_h * scale_bg)
            bg = img.resize((bg_w, bg_h), Image.Resampling.BILINEAR)
            bg_left = (bg_w - target_w) // 2
            bg_top = (bg_h - target_h) // 2
            bg_cropped = bg.crop((bg_left, bg_top, bg_left + target_w, bg_top + target_h))
            bg_blurred = bg_cropped.filter(ImageFilter.GaussianBlur(radius=30))
            
            dark_overlay = Image.new('RGB', (target_w, target_h), (10, 15, 26))
            bg_final = Image.blend(bg_blurred, dark_overlay, alpha=0.55)

            fg_h = target_h
            fg_w = int(orig_w * (fg_h / orig_h))
            fg = img.resize((fg_w, fg_h), Image.Resampling.LANCZOS)

            paste_x = (target_w - fg_w) // 2
            bg_final.paste(fg, (paste_x, 0))
            bg_final.save(dest_path, 'JPEG', quality=88, optimize=True)
            return 'framed_portrait'


def generate_thumbnail(opt_path, thumb_path, target_w=600, target_h=375):
    with Image.open(opt_path) as img:
        thumb = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
        thumb.save(thumb_path, 'JPEG', quality=80, optimize=True)


def normalize(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())


def find_lead_raw_photos(lead_name, slug):
    all_dirs = os.listdir('septic_repair')
    norm_slug = normalize(slug)
    norm_name = normalize(lead_name)

    matched_dirs = []
    for rd in all_dirs:
        norm_rd = normalize(rd)
        if norm_rd == norm_slug or norm_rd == norm_name:
            matched_dirs.append(rd)

    photos = []
    for md in matched_dirs:
        p_dir = os.path.join('septic_repair', md, 'photos')
        if os.path.isdir(p_dir):
            for root, _, fs in os.walk(p_dir):
                for f in sorted(fs):
                    if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                        photos.append(os.path.join(root, f))
    return photos


def main():
    with open('src/data/callLeads.json', 'r') as f:
        call_leads = json.load(f)

    with open('src/data/septicLeads.json', 'r') as f:
        master_leads = json.load(f)

    master_by_slug = {l['slug']: l for l in master_leads}

    print(f"Enforcing strict photos rule for {len(call_leads)} call leads...")

    cleaned_count = 0
    own_photos_count = 0

    for idx, call_lead in enumerate(call_leads, 1):
        slug = call_lead['slug']
        lead = master_by_slug.get(slug)
        if not lead:
            continue

        company_name = lead.get('name', call_lead.get('company', slug))
        city = lead.get('city') or call_lead.get('city', 'Local Area')
        state = lead.get('state') or call_lead.get('state', 'US')

        raw_photos = find_lead_raw_photos(company_name, slug)
        dest_dir = os.path.join('public', 'showcase', slug)

        # ----------------------------------------------------
        # CASE 1: 0 RAW PHOTOS -> REMOVE ALL PHOTOS COMPLETELY
        # ----------------------------------------------------
        if len(raw_photos) == 0:
            if os.path.exists(dest_dir):
                shutil.rmtree(dest_dir)

            lead.pop('heroImage', None)
            lead['heroImage'] = None
            lead['photosSample'] = []
            lead['galleryPhotos'] = []

            # Keep equipment specifications text, but clear images
            eq_photos = lead.get('equipmentPhotos') or []
            for eq in eq_photos:
                eq['image'] = None
            lead['equipmentPhotos'] = eq_photos

            cleaned_count += 1
            print(f"[{idx:02d}/40] {slug}: NO OWN PHOTOS -> Cleaned completely (text-only showcase)")

        # ----------------------------------------------------
        # CASE 2: HAS OWN PHOTOS -> KEEP ONLY OWN PHOTOS
        # ----------------------------------------------------
        else:
            # Wipe dest_dir to clear any previous pool photos
            if os.path.exists(dest_dir):
                shutil.rmtree(dest_dir)
            os.makedirs(dest_dir, exist_ok=True)

            # Process only contractor's OWN photos (up to max 8)
            own_slice = raw_photos[:8]
            processed_urls = []

            for photo_idx, src_p in enumerate(own_slice, 1):
                opt_name = f"photo_{photo_idx:03d}_opt.jpg"
                thumb_name = f"photo_{photo_idx:03d}_thumb.jpg"
                opt_path = os.path.join(dest_dir, opt_name)
                thumb_path = os.path.join(dest_dir, thumb_name)

                smart_frame_machinery(src_p, opt_path, 1200, 750)
                generate_thumbnail(opt_path, thumb_path, 600, 375)
                processed_urls.append(f"/showcase/{slug}/{opt_name}")

            # Assign heroImage
            lead['heroImage'] = processed_urls[0]
            lead['photosSample'] = processed_urls

            # Assign equipmentPhotos (cards 1, 2, 3)
            # photo 0 is hero, photos 1, 2, 3 are equipment cards
            eq_img_1 = processed_urls[1] if len(processed_urls) > 1 else None
            eq_img_2 = processed_urls[2] if len(processed_urls) > 2 else None
            eq_img_3 = processed_urls[3] if len(processed_urls) > 3 else None

            # Determine company trade profile
            slug_lower = slug.lower()
            name_lower = company_name.lower()
            if 'excavat' in slug_lower or 'excavat' in name_lower or 'perc' in slug_lower:
                trade_profile = 'EXCAVATION'
            elif any(k in slug_lower or k in name_lower for k in ['plumb', 'drain', 'rooter', 'pipe', 'inspect']):
                trade_profile = 'PLUMBING_INSPECTION'
            else:
                trade_profile = 'PUMPING'

            if trade_profile == 'EXCAVATION':
                eq1_title = f"Precision Excavation & Heavy Fleet in {city}"
                eq1_title_ru = f"Землеройная спецтехника и экскаваторы в г. {city}"
                eq1_desc = f"Dedicated excavation equipment operated directly by {company_name} crews in {city}, {state}. Engineered for precise trenching, heavy tank placement, and code-compliant grade establishment."
                eq1_desc_ru = f"Собственная землеройная техника бригады {company_name} в г. {city}, {state}. Обеспечивает точную разработку котлованов, монтаж тяжелых емкостей и соблюдение проектных отметок."

                eq2_title = "Laser-Graded Drain Field & Soil Bedding"
                eq2_title_ru = "Лазерное нивелирование полей фильтрации и дренажа"
                eq2_desc = f"Optical laser transits and washed stone aggregate bedding ensure flawless gravity wastewater dispersal without surface standing water."
                eq2_desc_ru = f"Лазерный контроль уклона траншей и укладка мытого гранитного щебня гарантируют естественный самотек сточных вод без застоя."
            elif trade_profile == 'PLUMBING_INSPECTION':
                eq1_title = f"Mobile Diagnostic & Service Unit in {city}"
                eq1_title_ru = f"Мобильный диагностический комплекс в г. {city}"
                eq1_desc = f"Fully equipped utility service unit operated directly by {company_name} specialists in {city}, {state}. Ready for rapid field dispatch and comprehensive system evaluations."
                eq1_desc_ru = f"Оснащенный сервисный комплекс бригады {company_name} в г. {city}, {state}. Обеспечивает оперативный выезд и полную проверку коммуникаций на месте."

                eq2_title = "512Hz Sonde High-Definition Camera Diagnostics"
                eq2_title_ru = "Цветная телеинспекция и зонд-локатор 512 Гц"
                eq2_desc = f"Self-leveling waterproof fiber-optic cameras pinpoint line bellies, roots, and hidden tank access covers without invasive digging."
                eq2_desc_ru = f"Самовыравнивающиеся видеокамеры высокого разрешения с радиозондом находят скрытые засоры, трещины и закопанные люки без лишних раскопок."
            else:
                eq1_title = f"Commercial Septic Pumper & Service Fleet in {city}"
                eq1_title_ru = f"Вакуумные цистерны и спецтранспорт в г. {city}"
                eq1_desc = f"High-capacity commercial vacuum trucks operated directly by {company_name} crews in {city}, {state}. Designed for high-displacement sludge extraction and sanitary compliance."
                eq1_desc_ru = f"Мощные вакуумные ассенизаторские цистерны бригады {company_name} в г. {city}, {state}. Обеспечивают полную откачку донного ила и герметичную транспортировку стоков."

                eq2_title = "High-Capacity Vacuum Sludge Extraction"
                eq2_title_ru = "Глубокая вакуумная откачка донного ила и жира"
                eq2_desc = f"Heavy-displacement vacuum rotary blowers lift dense solid settled sludge and scum layers from deep residential and commercial tanks without residue."
                eq2_desc_ru = f"Высокопроизводительные насосы поднимают застарелый плотный осадок и тяжелые жировые фракции со дна резервуара за один заезд."

            lead['equipmentPhotos'] = [
                {
                    "title": eq1_title,
                    "titleRu": eq1_title_ru,
                    "badge": "Company-Owned Fleet",
                    "badgeRu": "Собственный автопарк",
                    "desc": eq1_desc,
                    "descRu": eq1_desc_ru,
                    "image": eq_img_1
                },
                {
                    "title": eq2_title,
                    "titleRu": eq2_title_ru,
                    "badge": "Diagnostic Equipment",
                    "badgeRu": "Профессиональное оснащение",
                    "desc": eq2_desc,
                    "descRu": eq2_desc_ru,
                    "image": eq_img_2
                },
                {
                    "title": "Turf Protection & Clean Backfill Restoration",
                    "titleRu": "Защита ландшафта и чистовая обратная засыпка",
                    "badge": "Property Preservation",
                    "badgeRu": "Чистота участка",
                    "desc": f"Every project in {city} includes layered soil compaction, grade-level access riser fitting, and smooth surface finishing so your yard looks clean and settled upon completion.",
                    "descRu": f"Каждый выезд в г. {city} завершается послойной трамбовкой грунта, выводом ревизионных крышек в уровень с травой и чистовым разравниванием площадки.",
                    "image": eq_img_3
                }
            ]

            # Gallery Photos (ONLY remaining own photos from index 4 up to 7, zero padding!)
            gallery_urls = processed_urls[4:8]
            gallery_templates = [
                {
                    "title": f"On-Site Septic System Execution in {city}, {state}",
                    "titleRu": f"Выполнение работ на объекте в г. {city}, {state}",
                    "tag": "Verified Jobsite",
                    "tagRu": "Реальный объект",
                    "desc": f"Documented field work completed by {company_name} adhering to {state} environmental and county health standards.",
                    "descRu": f"Подтвержденный фотоотчет с объекта компании {company_name}, выполненный по санитарным стандартам штата {state}."
                },
                {
                    "title": "Subsurface Line & Tank Access Preparation",
                    "titleRu": "Подготовка подземных коммуникаций и горловин",
                    "tag": "System Integrity",
                    "tagRu": "Герметичность узлов",
                    "desc": "Inspection of inlet/outlet baffles, watertight connections, and structural tank integrity during field service.",
                    "descRu": "Проверка впускных и выпускных перегородок, герметизация стыков и контроль целостности резервуара."
                },
                {
                    "title": "Excavation, Bedding & Drainage Alignment",
                    "titleRu": "Земляные работы и выравнивание дренажного контура",
                    "tag": "Field Engineering",
                    "tagRu": "Инженерный монтаж",
                    "desc": f"Careful trenching and soil management by the {company_name} crew ensuring long-term wastewater flow and zero yard settling.",
                    "descRu": f"Аккуратная разработка траншей бригадой {company_name} с сохранением правильного уклона и защитой грунта от просадок."
                },
                {
                    "title": "Final Site Grading & Property Handover",
                    "titleRu": "Чистовая планировка и сдача объекта заказчику",
                    "tag": "Clean Finish",
                    "tagRu": "Чистовая сдача",
                    "desc": f"Completed service site in {city} with backfilled soil and clean terrain ready for everyday residential use.",
                    "descRu": f"Завершенный объект в г. {city} с обратной засыпкой и аккуратным восстановлением территории."
                }
            ]

            lead['galleryPhotos'] = [
                {
                    **gallery_templates[g_idx],
                    "image": g_url
                }
                for g_idx, g_url in enumerate(gallery_urls)
            ]

            own_photos_count += 1
            print(f"[{idx:02d}/40] {slug}: {len(processed_urls)} OWN PHOTOS ONLY (hero={bool(lead['heroImage'])}, eq={sum(1 for e in lead['equipmentPhotos'] if e.get('image'))}, gal={len(lead['galleryPhotos'])})")

    # Save master leads
    with open('src/data/septicLeads.json', 'w') as f:
        json.dump(master_leads, f, indent=2)

    print(f"\nCOMPLETED: {own_photos_count} leads keep STRICTLY OWN photos, {cleaned_count} leads reset to NO photos.")

if __name__ == '__main__':
    main()
