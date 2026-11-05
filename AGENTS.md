<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Cold Outreach & Sales Communication Rules

## 1. Запрет на защитные формулировки и триггеры страха (No Fear-Based Framing)
- **Строго запрещено** использовать в скриптах, SMS, письмах и сообщениях клиентам слова и фразы, навязывающие подозрение или страх:
  - `afraid to click`, `scared`, `worried` («боитесь переходить», «если страшно»);
  - `phishing`, `virus`, `malware`, `scam`, `not spam` («это не вирус», «не спам», «безопасная ссылка»).
- Никогда не оправдываться и не объяснять безопасность ссылок заранее — это вызывает обратный эффект (паранойю и ассоциацию со скамом).
- Любую альтернативу ссылке формулировать **исключительно через удобство и экономию времени**:
  - ❌ *«If you're afraid to click links, I can send screenshots»*
  - ✅ *«Happy to text over a few quick screenshots if that's easier!»*
  - ✅ *«Mind if I text over a couple of screenshots to see what you think?»*

## 2. Правила отбора и размещения фотографий (Photo & Media Integrity)
- **Строжайший запрет на дублирование фотографий на одной странице**: одна и та же фотография ни при каких обстоятельствах не должна появляться дважды (например, в Hero, карточках техники и галерее). Каждое изображение на странице обязано быть уникальным.
- **Строжайший запрет на нерелевантные фотографии и «заглушки»**:
  - Запрещено ставить под заголовки спецтехники/оборудования случайные бытовые фото: газовые плиты, водонагреватели с игрушками, кондиционеры, темные подполы, поливочные шланги, деревья, заборы, грязные перчатки и т.д.
  - Фотография прикрепляется к карточке только в том случае, если она **напрямую и очевидно** изображает то, о чем говорится в карточке (ассенизаторский трак, мини-экскаватор, откачка колодца шлангом, инспекционная камера, аккуратные люки/септик-райзеры в газоне).
- **Правило отсутствия подходящего фото**:
  - Если у подрядчика нет реальной, подходящей по смыслу фотографии для конкретного блока или карточки — **категорически запрещено** ставить чужие фото или случайные картинки.
  - В таких случаях поле изображения остается пустым (`heroImage: null`, `image: null`, `galleryPhotos: []`).
  - Система в этом случае автоматически рендерит премиальный текстовый блок с техническими спецификациями или карточку подтвержденной репутации (`Verified Reputation Card`), где фотографии изначально не предусмотрены дизайном.
- **Фотографии из отзывов**:
  - Фотографии, прикрепленные клиентами к отзывам, не должны подменяться под видом «собственной техники компании», если они не отображают реальное профильное оборудование. Если фото сомнительное — лучше оставить блок текстовым.

