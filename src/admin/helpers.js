// Known values from the current site — offered as datalist suggestions so the
// existing look stays consistent, while still allowing brand-new entries.
export const REGIONS = [
  'Southern Europe',
  'South Asia',
  'East Africa',
  'Latin America',
  'West Africa',
  'East Asia',
  'Middle East & North Africa',
  'Caribbean',
]

export const COUNTRIES = [
  'Catalonia',
  'Sri Lanka',
  'Eritrea',
  'Argentina',
  'Peru',
  'Chile',
  'Nigeria',
  'Senegal',
  'Cameroon',
  'Japan',
  'Taiwan',
  'Korea',
  'Algeria',
  'Egypt',
  'Jamaica',
  'Cuba',
]

export function slugify(text) {
  return (
    (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || `item-${Date.now().toString(36)}`
  )
}
