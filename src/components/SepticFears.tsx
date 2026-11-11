'use client'

import React from 'react'
import { SepticLead } from '../data/septicLeads'
import { ShieldCheck, CheckCircle2 } from 'lucide-react'

interface SepticFearsProps {
  lead: SepticLead
  isRu?: boolean
}

export function SepticFears({ lead, isRu = false }: SepticFearsProps) {
  const isHighTicket = lead.ticketTier === 'HIGH_TICKET'

  const standards = isRu
    ? (isHighTicket
        ? [
            {
              badge: 'Защита покрытия',
              title: 'Защита газона, брусчатки и подъездных путей (Zero Yard Damage)',
              solution:
                'Вся техника передвигается по участку на резиновых гусеницах и по распределяющим вес полимерным настилам Turf-Mats (до 60 тонн на ось). Нулевая колейность, отсутствие борозд и сохранение тротуарной плитки.',
            },
            {
              badge: 'Фиксированная цена',
              title: '100% фиксированная смета до начала работ (Guaranteed Flat Bid)',
              solution:
                'Фиксируем полную стоимость до въезда техники на участок. В смету включены разработка грунта, танки, трубы, щебень, лазерная укладка, обратная засыпка и вывоз излишков земли без скрытых доплат.',
            },
            {
              badge: 'Инженерный контроль',
              title: 'Лазерный контроль уклона труб и объективная видеоинспекция',
              solution:
                'Каждый фут магистрали укладывается по цифровому лазерному нивелиру со строгим уклоном 1/4 дюйма на фут. Видеокамера высокого разрешения с зондом 512 Гц проверяет соединения до обратной засыпки.',
            },
            {
              badge: 'Чистота участка',
              title: 'Послойная трамбовка и чистовое разравнивание территории',
              solution:
                'Мы не оставляем после себя траншей и бугров. Котлован и трассы послойно уплотняются виброплитами, выводятся в проектную отметку газона и закрываются плодородным грунтом под засев травы.',
            },
            {
              badge: 'Стандарты округа',
              title: 'Официальное разрешение Health Department и сдача инспектору',
              solution:
                'Работаем в строгом соответствии с экологическими и строительными кодексами округа. Обеспечиваем получение разрешений (Septic Permits), проведение перколяционных тестов и подписание актов сдачи.',
            },
          ]
        : [
            {
              badge: 'Защита покрытия',
              title: 'Защита газона, брусчатки и подъездных путей (Zero Yard Damage)',
              solution:
                'Наши цистерны оборудованы шлангами повышенной дальности (до 200 футов), что позволяет машине оставаться на проезжей части. При необходимости заезда под колеса укладываются распределяющие вес полимерные маты Turf-Mats.',
            },
            {
              badge: 'Фиксированная цена',
              title: '100% прозрачная цена без скрытых сборов (All-Inclusive Flat Rate)',
              solution:
                'Фиксируем полную стоимость до начала работ. В смету уже включены выезд бригады, работа оператора, откачка донного осадка и официальный экологический полигонный сбор за утилизацию.',
            },
            {
              badge: 'Видеоконтроль',
              title: 'Объективная видеоинспекция до принятия любых решений',
              solution:
                'Мы никогда не приговариваем систему вслепую. Заказчик видит реальное состояние труб на цветном мониторе камеры высокого разрешения. В 80% случаев проходимость восстанавливается промывкой без лишних трат.',
            },
            {
              badge: 'Чистота и экология',
              title: 'Герметичная система откачки без капель и запаха',
              solution:
                'Используются промышленные быстросъемные соединения Camlock с двойным силиконовым контуром. Вакуумная система работает под постоянным отрицательным давлением — ни капли и никакого запаха на участке.',
            },
            {
              badge: 'Гослицензия',
              title: 'Официальный талон утилизации (Waste Manifest) и соответствие нормам',
              solution:
                'Работаем строго по экологическим регламентам Health Department и EPA. Предоставляем официальный манифест утилизации, подтверждающий законную сдачу стоков на муниципальные очистные сооружения.',
            },
          ])
    : (isHighTicket
        ? [
            {
              badge: 'Zero Lawn Damage',
              title: 'Turf & Driveway Protection Protocol',
              solution:
                'Excavation machinery operates exclusively on non-marking rubber tracks and heavy-duty composite AlturnaMATS rated up to 60 tons per axle. Guaranteed zero cracked pavers, asphalt scarring, or lawn rutting.',
            },
            {
              badge: 'Guaranteed Flat Bid',
              title: '100% Guaranteed Upfront Quoted Bids',
              solution:
                'We lock in your total project price before equipment touches your yard. Your quote includes engineering, excavation, tank setting, pipe materials, backfill compaction, and permit fees with zero surprise add-ons.',
            },
            {
              badge: 'Laser Precision',
              title: 'Laser Slope Grading & Dual CCTV Video Verification',
              solution:
                'Every drain line and lateral is laid with dual-axis digital laser instruments guaranteeing precise 1/4" per foot gravity pitch. High-definition color sewer cameras verify all internal joints prior to final backfill.',
            },
            {
              badge: 'Clean Yard Restoration',
              title: 'Layered Soil Compaction & Clean Yard Restoration',
              solution:
                'We never leave messy mounds or future sinkholes. Trenches and tank pits are backfilled in layered lifts with mechanical compactor vibratory tamping, topped with clean graded topsoil ready for turf re-seeding.',
            },
            {
              badge: 'County Health Code',
              title: 'Licensed Health Department Permitting & Final Sign-Off',
              solution:
                'Licensed, bonded, and insured in compliance with municipal and county health department codes. We handle soil perc testing, engineered drawings, and coordinate directly with local health inspectors for official sign-off.',
            },
          ]
        : [
            {
              badge: 'Zero Lawn Damage',
              title: 'Lawn & Driveway Protection Protocol',
              solution:
                'Our tankers carry up to 200 feet of commercial-grade suction hose, allowing trucks to remain parked safely curbside in most homes. When yard entry is necessary, we deploy heavy-duty composite Turf-Mats to protect grass and pavers.',
            },
            {
              badge: 'All-Inclusive Flat Rate',
              title: 'Guaranteed Upfront Flat-Rate Pricing',
              solution:
                'We provide guaranteed upfront pricing before our hoses touch your tank. Your quote includes operator labor, full sludge and scum extraction, and all municipal wastewater treatment facility dump fees with zero hidden surcharges.',
            },
            {
              badge: 'Video Proof',
              title: 'Objective HD Camera Inspection First',
              solution:
                'We never condemn a drain line or tank blindly. You watch the live high-definition color camera inspection screen alongside our technician. In most cases, hydro-jetting and cleanouts restore full flow without major excavation.',
            },
            {
              badge: 'Zero Spill & Odor',
              title: 'Sealed Odorless & Spill-Free Camlock System',
              solution:
                'Equipped with positive-locking Camlock hose couplings and secondary containment valves. Continuous negative vacuum pressure ensures zero drips, no property contamination, and an odorless visit.',
            },
            {
              badge: 'EPA Compliant',
              title: 'Licensed Environmental Disposal & Official Waste Manifest',
              solution:
                'Fully licensed, bonded, and insured in compliance with county Health Department and state environmental standards. Every service comes with an official treatment facility manifest proving compliant, lawful waste disposal.',
            },
          ])

  return (
    <section className="py-16 sm:py-20 bg-slate-900 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isRu ? 'Стандарты защиты заказчика' : 'Homeowner Protection Protocol'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {isRu
              ? '5 стандартов бережного сервиса и честной цены'
              : 'The 5-Point Homeowner Protection Standard'}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            {isRu
              ? `Регламент ${lead.name} защищает ваш участок, бюджет и спокойствие на каждом этапе — от подъезда машины до выдачи документов об утилизации.`
              : `How ${lead.name} ensures zero property damage, completely transparent flat-rate pricing, and rigorous environmental compliance on every call.`}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
          {standards.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-950 border border-slate-800/80 p-6 sm:p-7 shadow-lg space-y-3.5 hover:border-emerald-500/40 transition duration-200"
            >
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {item.title}
                  </h3>
                </div>
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700">
                  {item.badge}
                </span>
              </div>

              <div className="flex items-start gap-3 pl-10 pt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400/90 shrink-0 mt-1" />
                <p className="text-sm text-slate-300 leading-relaxed">
                  {item.solution}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
