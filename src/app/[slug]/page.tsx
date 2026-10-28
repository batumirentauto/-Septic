import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLeadBySlug, getAllSlugs } from '../../data/septicLeads'
import { UniversalSepticPage } from '../../components/UniversalSepticPage'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamicParams = true

export async function generateStaticParams() {
  return [
    { slug: 'bolt-septic-excavation' },
    { slug: 'bonzo-excavating' }
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const lead = getLeadBySlug(slug)
  if (!lead) return { title: 'Septic Service Not Found' }

  return {
    title: `${lead.name} | Septic Tank Pumping & Drain Field Repair in ${lead.city || lead.state}`,
    description: `Verified ${lead.rating}★ septic contractor (${lead.reviewCount} Google reviews). Same-day vacuum pumping, video line camera diagnostics, and drain field restoration serving ${lead.city || lead.state}.`,
    keywords: [
      lead.name,
      `septic repair ${lead.city}`,
      `septic tank pumping ${lead.state}`,
      `drain field restoration ${lead.city}`,
      `emergency septic service ${lead.city}`,
    ],
  }
}

export default async function CompanyEnglishPage({ params }: Props) {
  const { slug } = await params
  const lead = getLeadBySlug(slug)

  if (!lead) {
    notFound()
  }

  return <UniversalSepticPage lead={lead} isRu={false} />
}
