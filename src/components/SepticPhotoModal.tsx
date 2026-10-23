'use client'

import React, { useEffect } from 'react'
import { X, ZoomIn, ShieldCheck } from 'lucide-react'

export interface ActivePhoto {
  src: string
  title: string
  description?: string
  tag?: string
}

interface SepticPhotoModalProps {
  activePhoto: ActivePhoto | null
  onClose: () => void
  isRu?: boolean
}

export function SepticPhotoModal({ activePhoto, onClose, isRu = false }: SepticPhotoModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (activePhoto) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activePhoto, onClose])

  if (!activePhoto) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[92vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isRu ? 'Подлинное фото объекта' : 'Verified Jobsite Photo'}
            </span>
            {activePhoto.tag && (
              <span className="text-xs text-slate-400 hidden sm:inline-block font-mono">
                • {activePhoto.tag}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close photo preview"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image viewport */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[350px] max-h-[68vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activePhoto.src}
            alt={activePhoto.title}
            className="max-h-[68vh] w-auto max-w-full object-contain mx-auto"
            loading="eager"
          />
        </div>

        {/* Footer Caption */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 space-y-1">
          <h4 className="text-base font-bold text-white">{activePhoto.title}</h4>
          {activePhoto.description && (
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {activePhoto.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
