'use client'

import React, { useState, useMemo } from 'react'
import { SepticLead } from '../data/septicLeads'
import { Calculator, Phone, CheckCircle, Clock } from 'lucide-react'

interface SepticCalculatorProps {
  lead: SepticLead
  isRu?: boolean
}

export function SepticCalculator({ lead, isRu = false }: SepticCalculatorProps) {
  const [tankSize, setTankSize] = useState<number>(1000)
  const [serviceType, setServiceType] = useState<string>('pumping')
  const [customerPhone, setCustomerPhone] = useState<string>('')
  const [submitted, setSubmitted] = useState<boolean>(false)

  // Price Calculation Logic
  const estimate = useMemo(() => {
    let baseMin = 325
    let baseMax = 475

    // Tank Size multipliers
    if (tankSize === 500) {
      baseMin = 275
      baseMax = 375
    } else if (tankSize === 1000) {
      baseMin = 345
      baseMax = 495
    } else if (tankSize === 1250) {
      baseMin = 395
      baseMax = 550
    } else if (tankSize === 1500) {
      baseMin = 465
      baseMax = 650
    } else if (tankSize === 2000) {
      baseMin = 595
      baseMax = 850
    }

    // Service adjustment
    if (serviceType === 'emergency') {
      baseMin += 150
      baseMax += 220
    } else if (serviceType === 'drainfield') {
      baseMin += 450
      baseMax += 950
    } else if (serviceType === 'camera') {
      baseMin = 225
      baseMax = 350
    } else if (serviceType === 'risers') {
      baseMin = 380
      baseMax = 620
    }

    return { min: baseMin, max: baseMax }
  }, [tankSize, serviceType])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerPhone.trim()) return
    setSubmitted(true)
  }

  const cleanPhone = lead.phone ? lead.phone.replace(/[^\d+]/g, '') : ''

  return (
    <section id="calculator" className="py-16 sm:py-20 bg-slate-950 border-b border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
            {isRu ? 'Прозрачные тарифы' : 'Instant 10-Second Price Estimate'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            {isRu ? 'Калькулятор стоимости обслуживания септика' : 'Estimate Your Septic Service Cost'}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            {isRu
              ? `Выберите объем вашего резервуара и характер работ для расчета ориентировочной сметы в ${lead.city || 'вашем городе'}, ${lead.state}.`
              : `Select your tank size and service requirements below to view typical flat-rate costs in ${lead.city || 'your area'}, ${lead.state}.`}
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Box */}
          <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
            
            {/* 1. Tank Size Selector */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-white">
                1. {isRu ? 'Объем резервуара септика (галлоны)' : 'Septic Tank Size (Gallons)'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {[500, 1000, 1250, 1500, 2000].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setTankSize(size)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition ${
                      tankSize === size
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {size} Gal
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Service Type Selector */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-white">
                2. {isRu ? 'Требуемый вид работ' : 'Required Service Type'}
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'pumping',
                    name: isRu ? 'Регламентная откачка и утилизация' : 'Routine Tank Pumping & Waste Disposal',
                    sub: isRu ? 'Рекомендуется каждые 3–5 лет' : 'Recommended every 3–5 years for average homes',
                  },
                  {
                    id: 'emergency',
                    name: isRu ? 'Аварийный выезд: засор / вода поднимается в дом' : 'Emergency Backup Relief & Immediate Pump-Out',
                    sub: isRu ? 'Приоритетная подача вакуумной цистерны' : 'Priority same-day dispatch before overflow occurs',
                  },
                  {
                    id: 'drainfield',
                    name: isRu ? 'Диагностика и ремонт дренажного поля' : 'Drain Field Inspection & Restoration',
                    sub: isRu ? 'Устранение застоя воды и запаха на газоне' : 'For soggy yards, slow sinks, or surface wet spots',
                  },
                  {
                    id: 'camera',
                    name: isRu ? 'Видеоинспекция труб камерой высокого разрешения' : 'Color Video Pipe Camera Inspection',
                    sub: isRu ? 'Поиск корней, трещин и скрытых крышек' : 'Pinpoints breaks, bellies, or buried access lids',
                  },
                  {
                    id: 'risers',
                    name: isRu ? 'Монтаж ревизионной горловины (Riser Kit)' : 'Riser & Airtight Access Cover Installation',
                    sub: isRu ? 'Вывод люка на уровень земли' : 'Brings buried covers to surface level forever',
                  },
                ].map((s) => (
                  <label
                    key={s.id}
                    onClick={() => setServiceType(s.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      serviceType === s.id
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="serviceType"
                      checked={serviceType === s.id}
                      onChange={() => setServiceType(s.id)}
                      className="mt-1 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-sm font-semibold">{s.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{s.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Result Card Box */}
          <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 p-6 sm:p-7 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isRu ? 'Расчетная смета' : 'Estimated Cost Range'}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                {isRu ? 'Без скрытых платежей' : 'Guaranteed Flat-Rate'}
              </span>
            </div>

            <div className="text-center py-4 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                ${estimate.min} – ${estimate.max}
              </div>
              <p className="text-xs text-slate-400">
                {isRu
                  ? `Включает выезд, вакуумную откачку и полигонный сбор.`
                  : `Includes travel, certified pumping, and municipal dump fees.`}
              </p>
            </div>

            {/* Guarantee bullet points */}
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isRu ? 'Оплата только после завершения работ' : 'Pay only upon final inspection of work'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isRu ? 'Официальный экологический сертификат' : 'Official certified waste manifest receipt provided'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isRu ? 'Бережный заезд: газон не повреждается' : 'Guaranteed lawn preservation & clean grounds'}</span>
              </div>
            </div>

            {/* Quick Request Dispatch Form */}
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-slate-800">
                <label className="block text-xs font-semibold text-slate-300">
                  {isRu ? 'Забронировать выезд или зафиксировать смету:' : 'Lock In Your Rate / Request Booking:'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder={isRu ? 'Ваш номер телефона' : 'Your Phone Number (e.g. 555-123-4567)'}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition hover:scale-[1.01]"
                >
                  {isRu ? 'Запросить выезд бригады' : 'Schedule Service Dispatch'}
                </button>
              </form>
            ) : (
              <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold text-white">
                  {isRu ? 'Заявка принята!' : 'Request Sent Successfully!'}
                </div>
                <p className="text-xs text-slate-300">
                  {isRu
                    ? `Диспетчер ${lead.name} свяжется с вами по номеру ${customerPhone} в течение нескольких минут.`
                    : `A dispatcher from ${lead.name} will call ${customerPhone} momentarily to confirm your appointment.`}
                </p>
              </div>
            )}

            {/* Direct Phone Call backup */}
            {cleanPhone && (
              <div className="text-center pt-2">
                <span className="text-xs text-slate-400 block mb-1">
                  {isRu ? 'Срочный вопрос? Звоните прямо сейчас:' : 'Need immediate service? Call now:'}
                </span>
                <a
                  href={`tel:${cleanPhone}`}
                  className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition"
                >
                  {lead.phone}
                </a>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  )
}
