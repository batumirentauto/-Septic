import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLeadBySlug, getHighTicketSlugs } from '../../data/septicLeads'
import { UniversalSepticPage } from '../../components/UniversalSepticPage'

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
  if (!lead) return { title: 'Septic Service Not Found' }

  const ogImageUrl = lead.heroImage
    ? (lead.heroImage.startsWith('http')
        ? lead.heroImage
        : `https://septic.up.railway.app${lead.heroImage}`)
    : 'https://septic.up.railway.app/favicon.ico'

  const title = `${lead.name} • 5★ Septic & Excavation Showcase`
  const description = `Verified ${lead.rating}★ contractor (${lead.reviewCount} Google reviews) in ${lead.city || lead.state}. Professional fleet, emergency pumping, line camera inspections & drain field restoration.`

  return {
    title,
    description,
    keywords: [
      lead.name,
      `septic repair ${lead.city}`,
      `septic tank pumping ${lead.state}`,
      `drain field restoration ${lead.city}`,
      `emergency septic service ${lead.city}`,
    ],
    openGraph: {
      title,
      description,
      url: `https://septic.up.railway.app/${slug}`,
      siteName: `${lead.name} Showcase`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${lead.name} equipment and machinery fleet in ${lead.city}`,
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

export default async function CompanyEnglishPage({ params }: Props) {
  const { slug } = await params
  const lead = getLeadBySlug(slug)

  if (!lead) {
    notFound()
  }

  return <UniversalSepticPage lead={lead} isRu={false} />
}
