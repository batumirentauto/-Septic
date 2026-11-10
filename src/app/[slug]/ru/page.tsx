import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLeadBySlug, getHighTicketSlugs } from '../../../data/septicLeads'
import { UniversalSepticPage } from '../../../components/UniversalSepticPage'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamicParams = true

export async function generateStaticParams() {
  return getHighTicketSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const lead = getLeadBySlug(slug)
  if (!lead) return { title: 'Служба септиков не найдена' }

  const rawFocus = lead.primaryFocus || ''
  const isLowTicket =
    lead.ticketTier === 'LOW_TICKET' ||
    rawFocus.toLowerCase().includes('откачк') ||
    rawFocus.toLowerCase().includes('чистк') ||
    rawFocus.toLowerCase().includes('pumping') ||
    Boolean(lead.ticketRange && (lead.ticketRange.includes('$350') || lead.ticketRange.includes('$650')))

  const ogImageUrl = lead.heroImage
    ? (lead.heroImage.startsWith('http')
        ? lead.heroImage
        : `https://septic.up.railway.app${lead.heroImage}`)
    : isLowTicket
    ? 'https://septic.up.railway.app/og-preview-pumping.jpg'
    : 'https://septic.up.railway.app/og-preview.jpg'

  const title = isLowTicket
    ? `${lead.name} | Откачка септиков, чистка и устранение засоров в ${lead.city || lead.state}`
    : `${lead.name} | Монтаж, ремонт септиков и полей фильтрации в ${lead.city || lead.state}`

  const description = isLowTicket
    ? `Подтвержденный рейтинг ${lead.rating}★ (${lead.reviewCount} отзывов Google Maps). Срочная вакуумная откачка, гидродинамическая промывка и устранение аварийных подпоров в ${lead.city || lead.state}.`
    : `Подтвержденный рейтинг ${lead.rating}★ (${lead.reviewCount} отзывов Google Maps). Капитальный монтаж, видеоинспекция труб и восстановление полей фильтрации в ${lead.city || lead.state}.`

  return {
    title,
    description,
    keywords: [
      lead.name,
      `откачка септика ${lead.city}`,
      `чистка септика ${lead.state}`,
      `устранение засоров ${lead.city}`,
      `вызов ассенизатора ${lead.city}`,
    ],
    openGraph: {
      title,
      description,
      url: `https://septic.up.railway.app/${slug}/ru`,
      siteName: `${lead.name} • Откачка и сервис септиков`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${lead.name} спецтехника в ${lead.city}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  }
}

export default async function CompanyRussianPage({ params }: Props) {
  const { slug } = await params
  const lead = getLeadBySlug(slug)

  if (!lead) {
    notFound()
  }

  return <UniversalSepticPage lead={lead} isRu={true} />
}
