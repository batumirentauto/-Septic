'use client'

import React from 'react'
import { SepticLead } from '../data/septicLeads'
import { Droplet, Video, Activity, Sparkles, Filter, Wrench } from 'lucide-react'

interface SepticServicesProps {
  lead: SepticLead
  isRu?: boolean
}

export function SepticServices({ lead, isRu = false }: SepticServicesProps) {
  const services = isRu
    ? [
        {
          icon: Droplet,
          title: 'Откачка септика и утилизация ила',
          desc: 'Полная выкачка жидкой и твердой фракции (scum & sludge) мощным вакуумным насосом. Промывка стенок резервуара и официальная утилизация на сертифицированном полигоне.',
          specs: 'Вакуум 4000+ CFM | Шланги до 200 футов',
        },
        {
          icon: Activity,
          title: 'Ремонт и восстановление дренажного поля',
          desc: 'Устранение био-мата, заиления и застоя воды над дренажными траншеями. Восстановление проницаемости грунта без тотального разрытия всего участка.',
          specs: 'Реювенация перфораций | Проверка распределительных коробок (D-box)',
        },
        {
          icon: Video,
          title: 'Видеокамера высокого разрешения (CCTV Audit)',
          desc: 'Цветная видеоинспекция отводящих и подводящих магистралей. Точное определение прорастания корней, трещин, провисов труб и засоров с фиксацией метража.',
          specs: 'Камера с автогоризонтом | Запись отчета на флешку',
        },
        {
          icon: Sparkles,
          title: 'Гидродинамическая промывка (Hydro-Jetting)',
          desc: 'Смыв застарелого жирового и мыльного налета давлением воды до 4,000 PSI. Полное восстановление заводского сечения труб без повреждения пластика и бетона.',
          specs: 'Давление до 4,000 PSI | Вращающиеся роторные форсунки',
        },
        {
          icon: Filter,
          title: 'Установка райзеров (горловин) и замена фильтров',
          desc: 'Подъем ревизионных люков на уровень газона с герметичными крышками. Больше не нужно перекапывать газон при каждой инспекции и обслуживании.',
          specs: 'Ударопрочный полиэтилен | Газонепроницаемые уплотнители',
        },
        {
          icon: Wrench,
          title: 'Ремонт насосных станций (Lift Station & Effluent Pumps)',
          desc: 'Диагностика и замена погружных насосов, контрольных панелей, аварийных поплавковых датчиков и обратных клапанов в напорных системах.',
          specs: 'Насосы класса Commercial Heavy-Duty | Тестирование автоматики',
        },
      ]
    : [
        {
          icon: Droplet,
          title: 'Septic Tank Pumping & Sludge Removal',
          desc: 'Complete removal of both surface scum and heavy settled sludge layers using high-volume vacuum equipment. Tank interior rinsed and effluent manifested at certified facilities.',
          specs: '4,000+ CFM Vacuum Power | Up to 200 ft hose reach',
        },
        {
          icon: Activity,
          title: 'Drain Field Restoration & Soil Rejuvenation',
          desc: 'Targeted recovery of biological slime (bio-mat) clogs and standing surface effluent over lateral lines. Restoring natural soil percolation without destructive backyard excavation.',
          specs: 'Perforation clearing | Distribution box (D-Box) leveling',
        },
        {
          icon: Video,
          title: 'High-Definition Color Sewer Camera Diagnostics',
          desc: 'Fiber-optic camera run down the mainline from cleanout to baffle. Pinpoints tree root intrusions, crushed pipes, sags, and grease blockages with foot-by-foot accuracy.',
          specs: 'Self-leveling optics | Digital video inspection report',
        },
        {
          icon: Sparkles,
          title: 'High-Pressure Hydro-Jetting Line Cleaning',
          desc: 'Scours calcified scale, mineral buildup, and hardened grease out of inlet and outlet lines using 4,000 PSI pulsating water streams, leaving pipe walls like new.',
          specs: 'Up to 4,000 PSI @ 12 GPM | Hardened rotating nozzles',
        },
        {
          icon: Filter,
          title: 'Riser Installation & Effluent Filter Upgrades',
          desc: 'Brings buried concrete tank access covers up to ground level with heavy-duty poly risers. Eliminates messy yard digging and lawn destruction during every future pump-out.',
          specs: 'Heavy-duty airtight lids | Washable fine-mesh effluent filters',
        },
        {
          icon: Wrench,
          title: 'Lift Station & Effluent Pump Replacement',
          desc: 'Full mechanical diagnosis of pump chambers, check valves, high-water audible alarm floats, and automated electrical controls for engineered pressure systems.',
          specs: 'Commercial-grade submersible pumps | Waterproof control boxes',
        },
      ]

  return (
    <section className="py-16 sm:py-20 bg-slate-950 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
            {isRu ? 'Полный спектр услуг' : 'Comprehensive Scope of Work'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            {isRu ? 'Регламентные работы и капитальный ремонт септиков' : 'Engineered Septic Maintenance & System Repair'}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            {isRu
              ? `Все выезды бригады ${lead.name} выполняются в строгом соответствии с экологическими нормами штата ${lead.state} и санитарными правилами округа.`
              : `All dispatches by ${lead.name} adhere strictly to ${lead.state} environmental codes, health department guidelines, and county disposal standards.`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((s, idx) => {
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
