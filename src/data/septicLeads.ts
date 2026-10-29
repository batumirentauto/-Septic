// Enhanced SepticLead Type Definitions
import rawLeads from './septicLeads.json'

export interface ReviewItem {
  author: string
  authorMeta?: string
  rating: number
  date?: string
  text: string
  photos?: string[]
}

export interface EquipmentPhotoItem {
  title: string
  titleRu: string
  badge: string
  badgeRu: string
  desc: string
  descRu: string
  image: string
}

export interface GalleryPhotoItem {
  title: string
  titleRu: string
  tag: string
  tagRu: string
  desc: string
  descRu: string
  image: string
}

export interface SepticLead {
  slug: string
  name: string
  state: string
  city: string
  address: string
  phone: string
  rating: number
  reviewCount: number
  hasWebsite: boolean
  website: string
  websiteIssue: string
  mapsUrl: string
  category: string
  hours: string
  photosCount: number
  reviewsCount: number
  folderName: string
  reviewsSample: ReviewItem[]
  photosSample: string[]
  heroImage?: string
  equipmentPhotos?: EquipmentPhotoItem[]
  galleryPhotos?: GalleryPhotoItem[]
  crewMembers?: string[]
  serviceAreaList?: string[]
  ticketTier?: 'HIGH_TICKET' | 'LOW_TICKET'
  ticketTierLabel?: string
  ticketTierLabelRu?: string
  ticketRange?: string
  primaryFocus?: string
  highTicketServices?: string[]
}

export const septicLeads: SepticLead[] = rawLeads as SepticLead[]

export function getLeadBySlug(slug: string): SepticLead | undefined {
  return septicLeads.find((l) => l.slug === slug)
}

export function getAllSlugs(): string[] {
  return septicLeads.map((l) => l.slug)
}

export function getHighTicketSlugs(): string[] {
  return septicLeads
    .filter((l) => l.ticketTier === 'HIGH_TICKET')
    .map((l) => l.slug)
}
