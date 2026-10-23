'use client'

import React from 'react'
import { SepticLead } from '../data/septicLeads'
import { ShieldAlert, CheckCircle2 } from 'lucide-react'

interface SepticFearsProps {
  lead: SepticLead
  isRu?: boolean
}

export function SepticFears({ lead, isRu = false }: SepticFearsProps) {
  const fears = isRu
    ? [
        {
          fear: 'Страх повреждения газона, брусчатки и подъездных путей тяжелым грузовиком',
          solution:
            'Наши цистерны оборудованы шлангами повышенной дальности (до 200 футов), что позволяет машине оставаться на проезжей части. Если заезд на грунт неизбежен, под колеса укладываются распределяющие вес полимерные маты Turf-Mats.',
        },
        {
          fear: 'Страх скрытых доплат за утилизацию и «неожиданных» полигонных сборов',
          solution:
            'Мы называем полную фиксированную стоимость (All-Inclusive Flat Rate) до начала откачки. В стоимость уже включены работа оператора, подача вакуума, экологический полигонный сбор и утилизация.',
        },
        {
          fear: 'Страх навязывания замены дренажного поля стоимостью $10,000–$25,000',
          solution:
            'Мы никогда не приговариваем дренажное поле вслепую. До принятия решения всегда проводится видеоинспекция камерой и тест проницаемости (percolation test). В 80% случаев проблема решается промывкой труб и био-реювенацией.',
        },
        {
          fear: 'Страх зловония, разбрызгивания нечистот и грязи по двору во время откачки',
          solution:
            'Используются герметичные быстросъемные соединения Camlock с двойными силиконовыми прокладками. Вакуумная система работает под отрицательным давлением — ни капли и никакого запаха на участке.',
        },
        {
          fear: 'Страх нелицензированных подрядчиков и штрафов от департамента здравоохранения',
          solution:
            'Работаем строго по регламентам Environmental Protection и Health Department. Заказчик получает официальный талон утилизации (Waste Manifest), подтверждающий законный сброс на муниципальной станции.',
        },
      ]
    : [
        {
          fear: 'Fear of heavy pump trucks rutting your lawn or cracking concrete driveways',
          solution:
            'Our tankers carry up to 200 feet of commercial-grade suction hose, allowing trucks to remain parked safely curbside in most homes. When yard entry is required, we lay composite ground-protection mats to disperse truck weight.',
        },
        {
          fear: 'Fear of surprise disposal fees and hidden dump surcharges added at the end',
          solution:
            'We provide guaranteed upfront flat-rate pricing before our hoses touch your tank. Your quote includes operator labor, full sludge and scum extraction, and all municipal wastewater treatment facility dump fees.',
        },
        {
          fear: 'Fear of dishonest contractors falsely diagnosing a $10,000+ drain field failure',
          solution:
            'We never condemn a drain field without verified proof. You watch the live high-definition color camera inspection screen alongside our technician. In most cases, hydro-jetting and shock treatments restore flow completely.',
        },
        {
          fear: 'Fear of foul odors, messy spills, and sewage stains across your property',
          solution:
            'We use sealed commercial Camlock hose couplings with secondary containment valves. Because our systems run on continuous negative vacuum pressure, zero effluent or airborne odor can escape onto your lawn.',
        },
        {
          fear: 'Fear of uncertified haulers dumping illegally and creating environmental liability',
          solution:
            'Fully licensed, bonded, and insured in compliance with state environmental protection standards. Every pump-out comes with an official municipal treatment plant manifest proving compliant, lawful waste disposal.',
        },
      ]

  return (
    <section className="py-16 sm:py-20 bg-slate-900 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
            {isRu ? 'Надежность и безопасность' : 'Peace of Mind Guaranteed'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            {isRu ? '5 главных страхов заказчика септика — и как мы их исключаем' : 'The 5 Biggest Septic Fears — Solved by Our Protocol'}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            {isRu
              ? `Мы знаем, с какими неприятностями домовладельцы сталкиваются при вызове безответственных компаний. Регламент ${lead.name} полностью защищает вас и ваше имущество.`
              : `We know the horror stories homeowners experience with fly-by-night pumpers. Here is how ${lead.name} ensures a clean, honest, and stress-free appointment.`}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-5">
          {fears.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-slate-950 border border-slate-800 p-6 sm:p-7 shadow-lg space-y-3 hover:border-slate-700 transition"
            >
              <div className="flex items-start gap-3.5">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {item.fear}
                </h3>
              </div>

              <div className="flex items-start gap-3.5 pl-8 sm:pl-9 pt-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
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
