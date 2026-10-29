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

  return {
    title: `${lead.name} | Откачка септиков и ремонт дренажных полей в ${lead.city || lead.state}`,
    description: `Подтвержденный рейтинг ${lead.rating}★ (${lead.reviewCount} отзывов Google Maps). Срочная вакуумная откачка, видеоинспекция труб и ремонт септиков в ${lead.city || lead.state}.`,
    keywords: [
      lead.name,
      `ремонт септика ${lead.city}`,
      `откачка септика ${lead.state}`,
      `дренажное поле ${lead.city}`,
      `вызов ассенизатора ${lead.city}`,
    ],
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
