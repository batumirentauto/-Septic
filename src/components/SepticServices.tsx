'use client'

import React from 'react'
import { SepticLead } from '../data/septicLeads'
import { Droplet, Video, Activity, Sparkles, Filter, Wrench } from 'lucide-react'

interface SepticServicesProps {
  lead: SepticLead
  isRu?: boolean
}

export function SepticServices({ lead, isRu = false }: SepticServicesProps) {
  const rawFocus = lead.primaryFocus || ''
  const isLowTicket =
    lead.ticketTier === 'LOW_TICKET' ||
    rawFocus.toLowerCase().includes('откачк') ||
    rawFocus.toLowerCase().includes('чистк') ||
    rawFocus.toLowerCase().includes('pumping') ||
    Boolean(lead.ticketRange && (lead.ticketRange.includes('$350') || lead.ticketRange.includes('$650')))

  const services = isRu
    ? (isLowTicket
        ? [
            {
              icon: Droplet,
              title: 'Откачка септика и утилизация ила',
              desc: 'Полная выкачка жидкой и твердой фракции (scum & sludge) мощным вакуумным насосом. Промывка стенок резервуара и официальная утилизация на сертифицированном полигоне.',
              specs: 'Вакуум 4000+ CFM | Шланги до 200 футов',
            },
            {
              icon: Sparkles,
              title: 'Гидродинамическая промывка магистралей (Hydro-Jetting)',
              desc: 'Смыв застарелых жировых пробок и отложений давлением воды до 4,000 PSI. Полное восстановление проходимости труб от дома до септика без раскопок газона.',
              specs: 'Давление до 4,000 PSI | Роторные форсунки',
            },
            {
              icon: Video,
              title: 'Цветная видеоинспекция труб (CCTV Audit)',
              desc: 'Оптоволоконная видеоинспекция отводящих и подводящих магистралей. Точное определение причин застоя, корней и скрытых повреждений с фиксацией метража.',
              specs: 'HD-камера с автогоризонтом | Монитор с видеозаписью',
            },
            {
              icon: Activity,
              title: 'Устранение аварийного переполнения 24/7',
              desc: 'Срочный выезд дежурной цистерны при остановке стоков или аварийном подъеме уровня в резервуаре. Быстрая разгрузка септика и запуск водоотведения.',
              specs: 'Экстренный выезд за 45–60 мин | Бригада на линии',
            },
            {
              icon: Filter,
              title: 'Установка райзеров (люков на уровень грунта)',
              desc: 'Монтаж герметичных ревизионных горловин на уровне газона. Больше не придется перекапывать газон лопатой при каждой регламентной откачке.',
              specs: 'Ударопрочный полиэтилен | Газонепроницаемые крышки',
            },
            {
              icon: Wrench,
              title: 'Промывка фильтров стоков и ревизия насосов',
              desc: 'Регламентная очистка сервисного фильтра (effluent filter), проверка обратных клапанов и поплавковых выключателей насосной камеры септика.',
              specs: 'Защита дренажного контура | Проверка автоматики',
            },
          ]
        : [
            {
              icon: Wrench,
              title: 'Капитальный монтаж септических систем «под ключ»',
              desc: 'Проектирование и монтаж конвенциональных и аэробных септиков. Соблюдение всех уклонов магистралей, согласование с округом (Health Department) и официальная сдача инспекторам.',
              specs: 'Танки 1,000–2,500 Gal | Лазерный нивелир | Сертификат округа',
            },
            {
              icon: Activity,
              title: 'Замена и восстановление дренажных полей (Drain Field)',
              desc: 'Полная замена заиленных дренажных траншей, укладка современных бескамерных перфорированных систем (Infiltrator Chambers) и восстановление проницаемости грунта.',
              specs: 'Перколяционный тест | Реювенация грунта | Нивелировка D-Box',
            },
            {
              icon: Filter,
              title: 'Замена резервуаров септиков и установка ревизионных люков',
              desc: 'Демонтаж треснувших или аварийных емкостей, аккуратная установка новых железобетонных или полимерных резервуаров с выводом герметичных люков на уровень газона.',
              specs: 'Бетон класс 5000 PSI / Ударопрочный полимер | Газонепроницаемые люки',
            },
            {
              icon: Sparkles,
              title: 'Точные земляные работы и лазерная разработка котлованов',
              desc: 'Работа на компактных экскаваторах с резиновыми гусеницами на полимерных настилах. Нулевая колейность, сохранение деревьев, заборов и коммуникаций.',
              specs: 'Мини-экскаваторы 3.5–5T | Защитные маты Turf-Mats | Чистовая засыпка',
            },
            {
              icon: Video,
              title: 'Цветная видеоинспекция труб камерой высокого разрешения',
              desc: 'Оптоволоконная видеодиагностика подземных магистралей с передатчиком 512 Гц. Точная фиксация трещин, корней и уклонов с записью видеоотчета.',
              specs: 'HD-камера с автогоризонтом | Зонд 512 Гц | Точность до дюйма',
            },
            {
              icon: Droplet,
              title: 'Вакуумная разгрузка резервуаров и гидродинамика',
              desc: 'Откачка отстоя и гидродинамическая промывка питающих линий перед пусконаладочными работами и после ремонта для запуска гидравлического цикла.',
              specs: 'Вакуум 4000+ CFM | Гидродинамика до 4,000 PSI',
            },
          ])
    : (isLowTicket
        ? [
            {
              icon: Droplet,
              title: 'Septic Tank Pumping & Sludge Removal',
              desc: 'Complete extraction of settled heavy sludge and floating scum layers with high-capacity vacuum tankers. Full interior rinse and certified municipal manifest.',
              specs: '4,000+ CFM Vacuum Power | Up to 200 ft hose reach',
            },
            {
              icon: Sparkles,
              title: 'High-Pressure Line Hydro-Jetting',
              desc: 'High-velocity water scouring up to 4,000 PSI clearing grease, scale, and root obstructions between home plumbing and tank without yard excavation.',
              specs: 'Up to 4,000 PSI | 360-degree rotary nozzles',
            },
            {
              icon: Video,
              title: 'HD Color Sewer Camera Diagnostics',
              desc: 'Fiber-optic self-leveling camera inspection locating pipe offsets, root intrusion, and line sags with foot-by-foot accuracy.',
              specs: 'Self-leveling optics | Digital video inspection report',
            },
            {
              icon: Activity,
              title: '24/7 Emergency Septic Overflow Response',
              desc: 'Immediate dispatch for backed-up drains, rising tank levels, or mainline blockages. Rapid pump-down to restore immediate domestic drain flow.',
              specs: '45–60 min rapid arrival | 24/7 priority line',
            },
            {
              icon: Filter,
              title: 'Septic Tank Riser & Safety Lid Installation',
              desc: 'Bringing buried inspection access lids flush to ground level with heavy-duty airtight composite covers. Eliminates tedious yard digging on future pump-outs.',
              specs: 'Commercial composite | Odor-sealed locking lids',
            },
            {
              icon: Wrench,
              title: 'Effluent Filter Cleaning & Pump Chamber Service',
              desc: 'Thorough washing of internal septic tank baffle filters and functional testing of effluent lift pumps, check valves, and float switches.',
              specs: 'Drain line protection | Electrical check',
            },
          ]
        : [
            {
              icon: Wrench,
              title: 'Complete Septic System Installation & Engineered Replacements',
              desc: 'Turnkey residential and commercial septic engineering. Laser-guided tank setting, proper slope calibration, and county health department permit acquisition and final sign-off.',
              specs: '1,000–2,500 Gal Tanks | Laser Level Precision | County Health Certified',
            },
            {
              icon: Activity,
              title: 'Drain Field (Leach Field) Engineering & Replacement',
              desc: 'Complete excavation of failed drainfields and precision installation of modern high-capacity chamber systems (Infiltrator Systems) and engineered distribution boxes (D-Box).',
              specs: 'Soil Perc Calibration | Infiltrator Chambers | D-Box Laser Leveling',
            },
            {
              icon: Filter,
              title: 'Septic Tank Replacement & Surface Riser Installations',
              desc: 'Surgical removal of compromised or cracked concrete tanks and installation of precast concrete or heavy-duty polyethylene units with airtight composite ground-level access lids.',
              specs: '5000 PSI Precast Concrete / Heavy Poly | Airtight Locking Lids',
            },
            {
              icon: Sparkles,
              title: 'Precision Trenching, Site Grading & Turf Preservation',
              desc: 'Dedicated rubber-track mini-excavators operating on composite ground protection mats. Surgical trenching with zero cracked driveways, tire rutting, or irrigation line damage.',
              specs: '3.5–5T Mini-Excavators | AlturnaMATS Turf Protection | Precision Backfill',
            },
            {
              icon: Video,
              title: 'HD Color Sewer Camera Diagnostics & Sonde Locating',
              desc: 'Fiber-optic self-leveling cameras equipped with 512Hz sondes. Pinpoints pipe offsets, root intrusion, structural bellies, and buried lids with foot-by-foot accuracy.',
              specs: 'Self-Leveling HD Lens | 512Hz Surface Sonde | Digital Video Archive',
            },
            {
              icon: Droplet,
              title: 'Tank Pump-Down, Sludge Extraction & Hydro-Jetting',
              desc: 'High-vacuum pump-down and 4,000 PSI rotary hydro-jetting of inlet/outlet baffles to prepare systems for replacement or restore optimum hydraulic flow.',
              specs: '4,000+ CFM Vacuum Power | Up to 4,000 PSI Hydro-Jetting',
            },
          ])

  const iconMap: Record<string, typeof Wrench> = {
    Droplet,
    Video,
    Activity,
    Sparkles,
    Filter,
    Wrench,
  }

  const finalServices =
    lead.customServices && lead.customServices.length > 0
      ? lead.customServices.map((cs, idx) => ({
          icon: (cs.iconName && iconMap[cs.iconName]) || [Activity, Wrench, Video, Filter, Sparkles, Droplet][idx % 6],
          title: isRu ? cs.titleRu : cs.title,
          desc: isRu ? cs.descRu : cs.desc,
          specs: isRu ? cs.specsRu : cs.specs,
        }))
      : services

  return (
    <section id="services" className="py-16 sm:py-20 bg-slate-950 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
            {isRu ? 'Полный спектр услуг' : 'Comprehensive Scope of Work'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            {isLowTicket
              ? isRu
                ? 'Профессиональная откачка, чистка и обслуживание септиков'
                : 'Professional Septic Pumping, Line Jetting & Maintenance'
              : isRu
              ? 'Капитальный монтаж, ремонт и обслуживание септиков'
              : 'Engineered Septic Installation, Restoration & Maintenance'}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            {isRu
              ? `Все выезды бригады ${lead.name} в г. ${lead.city}, ${lead.state} выполняются в строгом соответствии с экологическими нормами штата и санитарными правилами округа.`
              : `All dispatches by ${lead.name} in ${lead.city}, ${lead.state} adhere strictly to state environmental codes, health department guidelines, and county disposal standards.`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {finalServices.map((s, idx) => {
            const Icon = s.icon
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-7 hover:border-slate-700 transition flex flex-col justify-between space-y-4 hover:shadow-xl hover:shadow-emerald-500/5 group"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">
                    {s.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                  <span className="text-slate-500">⚙</span>
                  <span>{s.specs}</span>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
