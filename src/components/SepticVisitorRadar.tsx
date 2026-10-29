'use client'

import { useEffect, useRef } from 'react'

interface SepticVisitorRadarProps {
  slug: string
  isRu?: boolean
  activePhotoTitle?: string | null
}

export function SepticVisitorRadar({
  slug,
  isRu = false,
  activePhotoTitle = null
}: SepticVisitorRadarProps) {
  const sessionIdRef = useRef<string>('')
  const activeSecondsRef = useRef<number>(1)
  const maxScrollPctRef = useRef<number>(0)
  const photoClicksRef = useRef<number>(0)
  const ctaClicksRef = useRef<number>(0)
  const calculatorClicksRef = useRef<number>(0)

  const sendBeaconPayload = (eventType: string, eventLabel = '') => {
    if (!sessionIdRef.current) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('notrack') === '1') return

    const payload = {
      sessionId: sessionIdRef.current,
      slug,
      eventType,
      eventLabel,
      durationSec: activeSecondsRef.current,
      maxScrollPct: maxScrollPctRef.current,
      photoClicks: photoClicksRef.current,
      ctaClicks: ctaClicksRef.current,
      calculatorClicks: calculatorClicksRef.current,
      screen: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      language: navigator.language || '',
      referrer: document.referrer || '',
      forceTrack: params.get('track_me') === '1'
    }

    try {
      if (eventType === 'page_leave' && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
        navigator.sendBeacon('/api/radar', blob)
      } else {
        fetch('/api/radar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(() => {})
      }
    } catch {
      // ignore network errors
    }
  }

  // Track photo modal opening
  useEffect(() => {
    if (isRu || !activePhotoTitle || !sessionIdRef.current) return
    photoClicksRef.current += 1
    sendBeaconPayload('photo_open', `Открыл фото: ${activePhotoTitle}`)
  }, [activePhotoTitle, isRu])

  useEffect(() => {
    if (isRu) return
    if (typeof window === 'undefined') return
    if (navigator.webdriver) return
    if (window.innerWidth === 0 && window.innerHeight === 0) return

    const params = new URLSearchParams(window.location.search)
    if (params.get('notrack') === '1') return

    // Create or reuse session ID for this slug within the current tab
    const storageKey = `septic_radar_sid_${slug}`
    let sid = ''
    try {
      sid = sessionStorage.getItem(storageKey) || ''
      if (!sid) {
        sid = `${slug}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
        sessionStorage.setItem(storageKey, sid)
      }
    } catch {
      sid = `${slug}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
    }
    sessionIdRef.current = sid

    const computeScrollPct = () => {
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      )
      const winHeight = window.innerHeight
      const maxScrollable = Math.max(1, docHeight - winHeight)
      const pct = Math.min(100, Math.round(((window.scrollY + winHeight * 0.25) / maxScrollable) * 100))
      if (pct > maxScrollPctRef.current) {
        maxScrollPctRef.current = pct
      }
    }

    computeScrollPct()
    sendBeaconPayload('page_view', 'Открыл витрину')

    const handleScroll = () => {
      computeScrollPct()
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      const anchor = target.closest('a')
      const button = target.closest('button')

      if (anchor) {
        const href = anchor.getAttribute('href') || ''
        if (href.startsWith('tel:')) {
          ctaClicksRef.current += 1
          sendBeaconPayload('phone_click', `Нажал на телефон (${href.replace('tel:', '')})`)
          return
        }
        if (href.includes('#calculator') || href.includes('#contact')) {
          ctaClicksRef.current += 1
          sendBeaconPayload('cta_click', `Переход к блоку ${href}`)
          return
        }
      }

      if (button) {
        const text = (button.textContent || '').trim().slice(0, 45)
        if (
          text.toLowerCase().includes('estimate') ||
          text.toLowerCase().includes('calculate') ||
          text.toLowerCase().includes(' bedroom') ||
          text.toLowerCase().includes('gallon')
        ) {
          calculatorClicksRef.current += 1
          sendBeaconPayload('calculator_use', `Калькулятор: ${text}`)
        }
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendBeaconPayload('page_leave', 'Свернул вкладку / вернулся в iMessage')
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('click', handleClick, { passive: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)

    const secondInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        activeSecondsRef.current += 1
      }
    }, 1000)

    const heartbeatInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        computeScrollPct()
        sendBeaconPayload('heartbeat')
      }
    }, 5000)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('click', handleClick)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.clearInterval(secondInterval)
      window.clearInterval(heartbeatInterval)
    }
  }, [slug, isRu])

  return null
}
