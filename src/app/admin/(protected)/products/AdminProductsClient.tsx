'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, ToggleLeft, ToggleRight, Star, Package, Search, X, Loader2, Upload, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { EGG_TYPES, EGG_TYPE_LABELS } from '@/lib/product-utils'

const DEFAULT_VARIANTS = [
  { name: 'Half kg', price: '' },
  { name: '1 kg',    price: '' },
  { name: '1.5 kg',  price: '' },
  { name: '2 kg',    price: '' },
]

const emptyForm = () => ({
  name: '', description: '', basePrice: '', categoryId: '', categoryIds: [] as string[],
  highlights: '', careInstructions: '', eggType: 'BOTH',
  featured: false, available: true,
  variants: DEFAULT_VARIANTS.map((v) => ({ ...v })),
})

// Each slot is either an already-uploaded URL or a new local file awaiting upload.
type ImageSlot = { url: string; file?: File }

export function AdminProductsClient({ products, categories }: { products: any[]; categories: any[] }) {
  const router   = useRouter()
  const fileRef  = useRef<HTMLInputElement>(null)
  const [search, setSearch]       = useState('')
  const [editing, setEditing]     = useState<any | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [images, setImages]       = useState<ImageSlot[]>([])
  const [form, setForm]           = useState(emptyForm)

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm())
    setImages([])
    setShowModal(true)
  }

  const openEdit = (p: any) => {
    setEditing(p)
    setForm({
      name: p.name,
      description: p.description,
      basePrice: String(p.basePrice),
      categoryId: p.categoryId,
      categoryIds: Array.from(new Set([p.categoryId, ...p.categories.map((c: any) => c.id)])),
      highlights: p.highlights.join('\n'),
      careInstructions: p.careInstructions || '',
      eggType: p.eggType,
      featured: p.featured,
      available: p.available,
      variants: p.variants.length
        ? p.variants.map((v: any) => ({ name: v.name, price: String(v.price) }))
        : DEFAULT_VARIANTS.map((v) => ({ ...v })),
    })
    setImages(p.images.map((url: string) => ({ url })))
    setShowModal(true)
  }

  const close = () => { setShowModal(false); setEditing(null) }

  const toggleCategory = (id: string) => {
    setForm(p => {
      const has = p.categoryIds.includes(id)
      const categoryIds = has ? p.categoryIds.filter(c => c !== id) : [...p.categoryIds, id]
      // The main category must always be one of the selected ones.
      const categoryId = categoryIds.includes(p.categoryId) ? p.categoryId : (categoryIds[0] || '')
      return { ...p, categoryIds, categoryId }
    })
  }

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(prev => [...prev, ...files.map(f => ({ url: URL.createObjectURL(f), file: f }))])
    e.target.value = ''
  }

  const moveImage = (idx: number, dir: -1 | 1) => {
    setImages(prev => {
      const next = [...prev]
      const j = idx + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[idx], next[j]] = [next[j], next[idx]]
      return next
    })
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Product deleted'); router.refresh() }
    else {
      const d = await res.json()
      toast.error(d.error || 'Failed to delete')
    }
  }

  const toggleField = async (id: string, field: 'available' | 'featured', current: boolean) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: !current }),
    })
    if (res.ok) { toast.success('Updated!'); router.refresh() }
    else toast.error('Failed to update')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.categoryIds.length === 0) { toast.error('Select at least one category'); return }
    setSaving(true)
    try {
      const uploadedUrls: string[] = []
      for (const img of images) {
        if (!img.file) { uploadedUrls.push(img.url); continue }
        const fd = new FormData()
        fd.append('file', img.file)
        const up = await fetch('/api/upload', { method: 'POST', body: fd })
        const upData = await up.json()
        if (!up.ok) throw new Error(upData.error || 'Image upload failed')
        uploadedUrls.push(upData.url)
      }

      const res = await fetch(editing ? `/api/products/${editing.id}` : '/api/products', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:             form.name,
          description:      form.description,
          basePrice:        parseFloat(form.basePrice),
          categoryId:       form.categoryId,
          categoryIds:      form.categoryIds,
          highlights:       form.highlights.split('\n').map(s => s.trim()).filter(Boolean),
          careInstructions: form.careInstructions,
          eggType:          form.eggType,
          featured:         form.featured,
          available:        form.available,
          images:           uploadedUrls,
          variants:         form.variants
            .filter(v => v.name.trim() && v.price)
            .map(v => ({ name: v.name.trim(), price: parseFloat(v.price) })),
        }),
      })

      if (res.ok) {
        toast.success(editing ? 'Product updated!' : 'Product created!')
        close()
        router.refresh()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to save product')
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">{products.length} products total</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search products..." value={search}
          onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map(p => {
          const extra = p.categories.filter((c: any) => c.id !== p.categoryId)
          return (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative aspect-square bg-rose-50">
                <img src={p.images[0] || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'}
                  alt={p.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-1.5">
                  {p.featured && <span className="badge bg-amber-400 text-amber-900 text-[10px]">⭐ Featured</span>}
                  <span className={`badge text-[10px] ${p.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.available ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs text-rose-500 font-medium truncate" title={[p.category?.name, ...extra.map((c: any) => c.name)].join(', ')}>
                  {p.category?.name}{extra.length > 0 && <span className="text-gray-400"> +{extra.length} more</span>}
                </p>
                <h3 className="font-display font-semibold text-gray-900 truncate">{p.name}</h3>
                <p className="text-sm font-bold text-rose-600 mt-1">₹{p.basePrice}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Package className="w-3 h-3" />{p.variants.length} sizes</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3" />{p._count.reviews} reviews</span>
                  <span>{p.eggType === 'NONE' ? '' : EGG_TYPE_LABELS[p.eggType as keyof typeof EGG_TYPE_LABELS]}</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => openEdit(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => toggleField(p.id, 'available', p.available)}
                    title={p.available ? 'Hide from store' : 'Show in store'}
                    className={`flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${p.available ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                  >
                    {p.available ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => toggleField(p.id, 'featured', p.featured)}
                    title={p.featured ? 'Remove from featured' : 'Feature on homepage'}
                    className={`flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${p.featured ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                  >
                    <Star className={`w-3.5 h-3.5 ${p.featured ? 'fill-amber-400' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    title="Delete"
                    className="flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-display font-bold text-xl text-gray-900">{editing ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={close} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
                  <input required type="text" className="input-field" placeholder="e.g., Classic Chocolate Truffle"
                    value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  {editing && <p className="text-xs text-gray-400 mt-1">The product URL stays the same if you rename it.</p>}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Categories * <span className="text-gray-400 font-normal">— the product appears in every selected category</span></label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(c => {
                      const on = form.categoryIds.includes(c.id)
                      return (
                        <button type="button" key={c.id} onClick={() => toggleCategory(c.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${on ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-600 hover:border-rose-200'}`}>
                          {on && '✓ '}{c.name}
                        </button>
                      )
                    })}
                  </div>
                  {form.categoryIds.length > 1 && (
                    <div className="mt-3 flex items-center gap-2">
                      <label className="text-xs text-gray-500">Main category (shown on the product & in breadcrumbs):</label>
                      <select className="text-xs border border-gray-200 rounded-lg px-2 py-1" value={form.categoryId}
                        onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
                        {form.categoryIds.map(id => <option key={id} value={id}>{categories.find(c => c.id === id)?.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Base Price (₹) *</label>
                  <input required type="number" min="0" className="input-field" placeholder="499"
                    value={form.basePrice} onChange={e => setForm(p => ({ ...p, basePrice: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Egg / Eggless *</label>
                  <select className="input-field" value={form.eggType} onChange={e => setForm(p => ({ ...p, eggType: e.target.value }))}>
                    {EGG_TYPES.map(t => <option key={t} value={t}>{t === 'NONE' ? 'Not applicable (flowers, chocolates…)' : EGG_TYPE_LABELS[t]}</option>)}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Customers only choose egg/eggless when “both” are available.</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                  <textarea required className="input-field h-24 resize-none" placeholder="2–3 sentences: what it is, taste and texture, who it's perfect for."
                    value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Highlights <span className="text-gray-400 font-normal">— one per line, shown as bullet points</span></label>
                  <textarea className="input-field h-24 resize-none" placeholder={'Layers of Belgian chocolate ganache\nTopped with handmade truffles\nServes 6–8 (1 kg)'}
                    value={form.highlights} onChange={e => setForm(p => ({ ...p, highlights: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Care instructions <span className="text-gray-400 font-normal">— optional, one per line; standard cake care is shown if left empty</span></label>
                  <textarea className="input-field h-20 resize-none"
                    value={form.careInstructions} onChange={e => setForm(p => ({ ...p, careInstructions: e.target.value }))} />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Product Images {images.length > 0 && <span className="text-gray-400 font-normal">({images.length}) — first is the cover; square photos look best</span>}
                  </label>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFilesChange} />

                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {images.map((img, i) => (
                        <div key={img.url} className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 group">
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="w-5 h-5 bg-black/60 text-white rounded text-[10px] disabled:opacity-30">‹</button>
                            <button type="button" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} className="w-5 h-5 bg-black/60 text-white rounded text-[10px] disabled:opacity-30">›</button>
                          </div>
                          <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3" />
                          </button>
                          {i === 0 && <span className="absolute top-1 left-1 text-[9px] bg-black/60 text-white px-1 rounded">Cover</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full h-20 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:border-rose-300 hover:bg-rose-50/50 transition-all text-gray-400 hover:text-rose-500">
                    <Upload className="w-5 h-5" />
                    <div className="text-sm">
                      <span className="font-medium">{images.length > 0 ? 'Add more images' : 'Upload images'}</span>
                      <span className="text-xs block text-gray-400">JPG, PNG, WebP up to 5MB each</span>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Sizes & Pricing</label>
                <div className="grid grid-cols-2 gap-3">
                  {form.variants.map((v, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="text" className="input-field py-2 text-sm w-24 shrink-0" value={v.name}
                        onChange={e => setForm(p => ({ ...p, variants: p.variants.map((vv, ii) => ii === i ? { ...vv, name: e.target.value } : vv) }))} />
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                        <input type="number" min="0" placeholder="Price" className="input-field pl-7 py-2 text-sm"
                          value={v.price}
                          onChange={e => setForm(p => ({ ...p, variants: p.variants.map((vv, ii) => ii === i ? { ...vv, price: e.target.value } : vv) }))} />
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setForm(p => ({ ...p, variants: [...p.variants, { name: '', price: '' }] }))}
                  className="mt-2 text-xs font-semibold text-rose-600 hover:text-rose-700">+ Add size</button>
                <p className="text-xs text-gray-400 mt-1">Leave a price empty to skip that size.</p>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded text-rose-600" checked={form.featured}
                    onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} />
                  <span className="text-sm font-medium text-gray-700">Featured product</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded text-rose-600" checked={form.available}
                    onChange={e => setForm(p => ({ ...p, available: e.target.checked }))} />
                  <span className="text-sm font-medium text-gray-700">Available for sale</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={close} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
