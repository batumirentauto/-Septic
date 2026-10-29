'use client'

import React from 'react'
import { SepticLead } from '../data/septicLeads'
import { ActivePhoto } from './SepticPhotoModal'
import { ZoomIn, ShieldCheck } from 'lucide-react'

interface SepticEquipmentProps {
  lead: SepticLead
  isRu?: boolean
  onOpenPhoto?: (photo: ActivePhoto) => void
}

export function SepticEquipment({ lead, isRu = false, onOpenPhoto }: SepticEquipmentProps) {
  const hasCustomEquipment = lead.equipmentPhotos && lead.equipmentPhotos.length > 0

  const defaultSpecs = isRu
    ? [
        {
          title: 'Вакуумные цистерны Commercial 3,500–5,000 Gallons',
          badge: 'Мощность всасывания',
          desc: 'Специализированные грузовые цистерны с роторными вакуумными насосами высокой производительности. Способны откачивать застарелый плотный донный ил с глубины до 25 футов без остатка.',
          points: [
            'Герметичный люк с угольными фильтрами запаха',
            'Откачка за один заезд без необходимости повторных рейсов',
            'Электронный расходомер откачанного объема',
          ],
          image: null as string | null,
        },
        {
          title: 'Защитные полимерные трапы для газонов (Turf-Mats)',
          badge: 'Сохранность участка',
          desc: 'Мы бережем ваш газон, асфальт и тротуарную плитку. При необходимости заезда на грунт под колеса укладываются распределяющие вес полимерные маты высокой прочности.',
          points: [
            'Нулевая колейность и отсутствие продавленных борозд',
            'Шланги длиной до 200 футов позволяют машине оставаться на дороге',
            'Защита корней деревьев и спринклеров автополива',
          ],
          image: null as string | null,
        },
        {
          title: 'Цветные камеры с передатчиком глубинного зондирования',
          badge: 'Точная диагностика',
          desc: 'Зонд с передатчиком 512 Гц позволяет оператору на поверхности с точностью до дюйма определить, где именно под землей застрял засор или разрушилась труба, без лишних раскопок.',
          points: [
            'Локализация повреждений на глубине до 15 футов',
            'Обнаружение скрытых под слоем земли крышек резервуара',
            'Полный видеоотчет для страховых компаний и покупателей жилья',
          ],
          image: null as string | null,
        },
      ]
    : [
        {
          title: 'Commercial 3,500–5,000 Gallon Vacuum Tankers',
          badge: 'Heavy Suction Rating',
          desc: 'Engineered pump trucks equipped with high-displacement rotary vane vacuum blowers. Capable of lifting dense sludge and settled grit from deep residential and commercial tanks without residue.',
          points: [
            'Airtight vacuum locks with activated carbon odor scrubbers',
            'Full tank pump-out in a single trip with zero mid-job dumps',
            'Certified onboard volume gauges for verified gallonage',
          ],
          image: null as string | null,
        },
        {
          title: 'Heavy-Duty Ground & Turf Protection Mats',
          badge: 'Property Protection',
          desc: 'We treat your turf, pavers, and driveway with extreme care. Heavy-duty composite ground mats disperse truck weight across the surface, preventing ruts, tire scarring, and cracked concrete.',
          points: [
            'Zero lawn rutting or mud displacement during equipment moves',
            'Up to 200-ft hose capability allows trucks to stay parked curbside',
            'Guaranteed sprinkler head and irrigation line preservation',
          ],
          image: null as string | null,
        },
        {
          title: '512Hz Sonde Color Video Inspection Cameras',
          badge: 'Surgical Accuracy',
          desc: 'Self-leveling fiber-optic cameras equipped with high-frequency 512Hz locating beacons. Pinpoints underground line collapses, belly sags, and hidden buried access covers with pinpoint surface accuracy.',
          points: [
            'Pinpoint surface depth readings down to 15 feet below ground',
            'Rapid discovery of buried tank lids without exploratory digging',
            'Digital photo & video report accepted by lenders and health boards',
          ],
          image: null as string | null,
        },
      ]

  const items = hasCustomEquipment
    ? lead.equipmentPhotos!.map((eq) => ({
        title: isRu ? eq.titleRu : eq.title,
        badge: isRu ? eq.badgeRu : eq.badge,
        desc: isRu ? eq.descRu : eq.desc,
        points: isRu
          ? [
              'Подтвержденное фото оборудования в работе',
              'Собственный автопарк без посредников',
              'Полная страховая ответственность за целостность участка',
            ]
          : [
              'Verified jobsite machinery in operation',
              'Company-owned fleet — zero brokered contractors',
              'Fully insured operator liability for site preservation',
            ],
        image: eq.image,
      }))
    : defaultSpecs

  return (
    <section id="equipment" className="py-16 sm:py-20 bg-slate-900 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">
            {isRu ? 'Оснащение бригады и спецтехника' : 'Commercial-Grade Fleet & Machinery'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            {isRu
              ? 'Профессиональная техника без риска для ландшафта'
              : 'Heavy-Duty Equipment Engineered for Clean Yards'}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            {isRu
              ? `Бригада ${lead.name} использует сертифицированное оборудование для точной раскопки, лазерной укладки дренажа и сохранения окружающего рельефа.`
              : `The crew at ${lead.name} deploys dedicated mini-excavators, laser grading instruments, and ground protection designed to protect your turf and driveway.`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-950 border border-slate-800/80 overflow-hidden flex flex-col justify-between shadow-xl hover:border-slate-700 transition"
            >
              {/* Image banner if present */}
              {item.image && (
                <div
                  className="relative aspect-[16/10] bg-slate-900 group cursor-pointer overflow-hidden border-b border-slate-800"
                  onClick={() =>
                    onOpenPhoto &&
                    onOpenPhoto({
                      src: item.image!,
                      title: item.title,
                      description: item.desc,
                      tag: item.badge,
                    })
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition" />
                  <div className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-300 opacity-80 group-hover:opacity-100 transition">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-slate-950/90 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{isRu ? 'Реальный снимок' : 'Verified Photo'}</span>
                  </div>
                </div>
              )}

              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {item.badge}
                  </span>
                  <h3 className="text-xl font-bold text-white leading-snug">{item.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{item.desc}</p>
                </div>

                <ul className="space-y-2.5 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
                  {item.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
