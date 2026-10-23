'use client'

import React from 'react'
import { SepticLead } from '../data/septicLeads'
import { Truck, ShieldCheck, Gauge, Eye } from 'lucide-react'

interface SepticEquipmentProps {
  lead: SepticLead
  isRu?: boolean
}

export function SepticEquipment({ lead, isRu = false }: SepticEquipmentProps) {
  const specs = isRu
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
        },
      ]

  return (
    <section className="py-16 sm:py-20 bg-slate-900 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">
            {isRu ? 'Оснащение бригады' : 'Commercial-Grade Fleet & Tooling'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            {isRu ? 'Спецтехника без риска повреждения вашего участка' : 'High-Capacity Equipment Engineered for Clean Yards'}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            {isRu
              ? `Бригада ${lead.name} оснащена профессиональным оборудованием для безопасного обслуживания даже на участках со сложным ландшафтом и узкими заездами.`
              : `The service crew at ${lead.name} operates modern vacuum tankers and diagnostic gear configured to protect residential driveways, landscaping, and delicate root systems.`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {specs.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-950 border border-slate-800/80 p-7 flex flex-col justify-between space-y-5 shadow-lg"
            >
              <div className="space-y-4">
                <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {item.badge}
                </span>
                <h3 className="text-xl font-bold text-white leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
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
          ))}
        </div>

      </div>
    </section>
  )
}
