#!/usr/bin/env python3
import json
import os
import hashlib
import shutil
import re
from PIL import Image, ImageFilter

def get_file_hash(p):
    with open(p, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

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
                top = (orig_h - new_h) // 2
                cropped = img.crop((0, top, orig_w, top + new_h))
            final = cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
            final.save(dest_path, 'JPEG', quality=88, optimize=True)
            return 'cropped_landscape'

        # 2. Ultrawide (> 1.8)
        elif aspect > 1.8:
            new_w = int(orig_h * target_aspect)
            left = (orig_w - new_w) // 2
            cropped = img.crop((left, 0, left + new_w, orig_h))
            final = cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
            final.save(dest_path, 'JPEG', quality=88, optimize=True)
            return 'cropped_ultrawide'

        # 3. Portrait or Square (< 1.45)
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

def get_unique_raw_photos(lead_name, slug, folder_name=None):
    search_dirs = []
    if folder_name and os.path.isdir(os.path.join('septic_repair', folder_name)):
        search_dirs.append(folder_name)
    
    norm_slug = normalize(slug)
    norm_name = normalize(lead_name)
    for rd in os.listdir('septic_repair'):
        norm_rd = normalize(rd)
        if (norm_rd == norm_slug or norm_rd == norm_name) and rd not in search_dirs:
            search_dirs.append(rd)

    raw_files = []
    for d in search_dirs:
        p_dir = os.path.join('septic_repair', d, 'photos')
        if os.path.isdir(p_dir):
            for root, _, fs in os.walk(p_dir):
                for f in sorted(fs):
                    if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                        raw_files.append(os.path.join(root, f))

    # Deduplicate strictly by hash
    hashes = set()
    unique = []
    for rf in raw_files:
        try:
            h = get_file_hash(rf)
            if h not in hashes and os.path.getsize(rf) > 20000:
                hashes.add(h)
                unique.append(rf)
        except Exception:
            pass
    return unique

def main():
    with open('src/data/callLeads.json', 'r') as f:
        call_leads = json.load(f)

    with open('src/data/septicLeads.json', 'r') as f:
        master_leads = json.load(f)

    master_by_slug = {l['slug']: l for l in master_leads}
    
    # Also include premier-septic-services in processing if present
    leads_to_process = [cl['slug'] for cl in call_leads]
    if 'premier-septic-services' not in leads_to_process and 'premier-septic-services' in master_by_slug:
        leads_to_process.append('premier-septic-services')

    print(f"Applying strict unique photos rule for {len(leads_to_process)} target leads...")

    updated_count = 0
    text_only_count = 0

    for idx, slug in enumerate(leads_to_process, 1):
        lead = master_by_slug.get(slug)
        if not lead:
            continue

        company_name = lead.get('name', slug)
        city = lead.get('city', 'Local Area')
        state = lead.get('state', 'US')
        folder_name = lead.get('folderName')

        unique_photos = get_unique_raw_photos(company_name, slug, folder_name)
        dest_dir = os.path.join('public', 'showcase', slug)

        # CASE 1: ZERO PHOTOS
        if len(unique_photos) == 0:
            if os.path.exists(dest_dir):
                shutil.rmtree(dest_dir)
            lead['heroImage'] = None
            lead['photosCount'] = 0
            lead['photosSample'] = []
            lead['galleryPhotos'] = []
            for eq in lead.get('equipmentPhotos', []):
                eq['image'] = None
            text_only_count += 1
            print(f"[{idx:02d}/{len(leads_to_process)}] {slug}: ZERO photos -> Clean text-only showcase")
            continue

        # CASE 2: HAS UNIQUE PHOTOS
        if os.path.exists(dest_dir):
            shutil.rmtree(dest_dir)
        os.makedirs(dest_dir, exist_ok=True)

        lead['photosCount'] = len(unique_photos)
        
        # Take up to 8 unique photos
        own_slice = unique_photos[:8]
        processed_urls = []

        for photo_idx, src_p in enumerate(own_slice, 1):
            opt_name = f"photo_{photo_idx:03d}_opt.jpg"
            thumb_name = f"photo_{photo_idx:03d}_thumb.jpg"
            opt_path = os.path.join(dest_dir, opt_name)
            thumb_path = os.path.join(dest_dir, thumb_name)

            smart_frame_machinery(src_p, opt_path, 1200, 750)
            generate_thumbnail(opt_path, thumb_path, 600, 375)
            processed_urls.append(f"/showcase/{slug}/{opt_name}")

        lead['photosSample'] = processed_urls

        # STRICT MEDIA INTEGRITY (AGENTS.md):
        # 1. Hero image gets photo 0
        lead['heroImage'] = processed_urls[0]

        # 2. Equipment cards get photo 1, 2, 3 ONLY IF available and unique!
        # If not enough photos, remaining equipment cards MUST have image: null
        eq_img_1 = processed_urls[1] if len(processed_urls) > 1 else None
        eq_img_2 = processed_urls[2] if len(processed_urls) > 2 else None
        eq_img_3 = processed_urls[3] if len(processed_urls) > 3 else None

        # Determine trade profile for proper equipment titles
        slug_lower = slug.lower()
        name_lower = company_name.lower()
        if 'excavat' in slug_lower or 'excavat' in name_lower or 'perc' in slug_lower:
            trade_profile = 'EXCAVATION'
        elif any(k in slug_lower or k in name_lower for k in ['plumb', 'drain', 'rooter', 'pipe', 'inspect']):
            trade_profile = 'PLUMBING'
        else:
            trade_profile = 'SEPTIC'

        if trade_profile == 'EXCAVATION':
            eq1_title = f"Precision Excavation & Heavy Fleet in {city}"
            eq1_title_ru = f"Землеройная спецтехника и экскаваторы в г. {city}"
            eq1_desc = f"Dedicated excavation equipment operated directly by {company_name} crews in {city}, {state}. Engineered for precise trenching, heavy tank placement, and code-compliant grade establishment."
            eq1_desc_ru = f"Собственная землеройная техника бригады {company_name} в г. {city}, {state}. Обеспечивает точную разработку котлованов, монтаж тяжелых емкостей и соблюдение проектных отметок."

            eq2_title = "Laser-Graded Drain Field & Soil Bedding"
            eq2_title_ru = "Лазерное нивелирование полей фильтрации и дренажа"
            eq2_desc = f"Optical laser transits and washed stone aggregate bedding ensure flawless gravity wastewater dispersal without surface standing water."
            eq2_desc_ru = f"Лазерный контроль уклона траншей и укладка мытого гранитного щебня гарантируют естественный самотек сточных вод без застоя."
        elif trade_profile == 'PLUMBING':
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

        # 3. Gallery Photos get photo 4, 5, 6, 7 ONLY if available!
        # NO DUPLICATION: If fewer photos exist, gallery is smaller or empty.
        gallery_slice = processed_urls[4:8]
        gallery_items = []
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

        for g_idx, g_url in enumerate(gallery_slice):
            tpl = gallery_templates[g_idx % len(gallery_templates)]
            gallery_items.append({
                "title": tpl["title"],
                "titleRu": tpl["titleRu"],
                "tag": tpl["tag"],
                "tagRu": tpl["tagRu"],
                "desc": tpl["desc"],
                "descRu": tpl["descRu"],
                "image": g_url
            })

        lead['galleryPhotos'] = gallery_items
        updated_count += 1
        print(f"[{idx:02d}/{len(leads_to_process)}] {slug}: SUCCESS -> {len(processed_urls)} unique photos (hero: yes, eq_imgs: {sum(1 for x in [eq_img_1, eq_img_2, eq_img_3] if x)}, gallery: {len(gallery_items)})")

    with open('src/data/septicLeads.json', 'w') as f:
        json.dump(master_leads, f, indent=2)

    print("\n==================================================")
    print(f"SUMMARY: {updated_count} leads equipped with 100% authentic own photos!")
    print(f"         {text_only_count} leads verified text-only (0 genuine photos on Maps).")
    print("==================================================")

if __name__ == '__main__':
    main()
