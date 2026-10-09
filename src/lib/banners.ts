// Shared validation for banner create/update.
export function bannerData(body: any): { data: any } | { error: string } {
  const heading = String(body.heading ?? '').trim()
  const image = String(body.image ?? '').trim()
  if (!heading) return { error: 'Heading is required' }
  if (!image) return { error: 'Banner image is required' }
  const ctaUrl = String(body.ctaUrl ?? '').trim()
  if (ctaUrl && !/^(\/|https?:\/\/)/.test(ctaUrl)) return { error: 'Target URL must start with / or https://' }
  return {
    data: {
      heading: heading.slice(0, 120),
      description: String(body.description ?? '').trim().slice(0, 240) || null,
      image,
      ctaLabel: String(body.ctaLabel ?? '').trim().slice(0, 40) || null,
      ctaUrl: ctaUrl || null,
      active: body.active !== false,
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Math.trunc(Number(body.sortOrder)) : 0,
    },
  }
}
