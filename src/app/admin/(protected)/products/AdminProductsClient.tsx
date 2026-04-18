'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, ToggleLeft, ToggleRight, Star, Package, Search, X, Loader2, ImageIcon, Upload, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function AdminProductsClient({ products, categories }: { products: any[]; categories: any[] }) {
  const router   = useRouter()
  const fileRef  = useRef<HTMLInputElement>(null)
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving]       = useState(false)
  const [imageFiles, setImageFiles]       = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [form, setForm] = useState({
    name: '', description: '', basePrice: '', categoryId: '',
    featured: false, available: true,
    variants: [
      { name: 'Half kg', price: '' },
      { name: '1 kg',    price: '' },
      { name: '1.5 kg',  price: '' },
      { name: '2 kg',    price: '' },
    ],
  })

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )

  const resetForm = () => {
    setForm({ name: '', description: '', basePrice: '', categoryId: '', featured: false, available: true,
      variants: [{ name: 'Half kg', price: '' }, { name: '1 kg', price: '' }, { name: '1.5 kg', price: '' }, { name: '2 kg', price: '' }] })
    setImageFiles([])
    setImagePreviews([])
  }

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setImageFiles(prev => [...prev, ...files])
    setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
    e.target.value = ''
  }

  const removeImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx))
    setImagePreviews(prev => prev.filter((_, i) => i !== idx))
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

  const toggleAvailable = async (id: string, current: boolean) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !current }),
    })
    if (res.ok) { toast.success('Updated!'); router.refresh() }
    else toast.error('Failed to update')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Upload all images first
      const uploadedUrls: string[] = []
      for (const file of imageFiles) {
        const fd = new FormData()
        fd.append('file', file)
        const up = await fetch('/api/upload', { method: 'POST', body: fd })
        const upData = await up.json()
        if (!up.ok) throw new Error(upData.error || 'Image upload failed')
        uploadedUrls.push(upData.url)
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:        form.name,
          description: form.description,
          basePrice:   parseFloat(form.basePrice),
          categoryId:  form.categoryId,
          featured:    form.featured,
          available:   form.available,
          images:      uploadedUrls,
          variants:    form.variants
            .filter(v => v.price)
            .map(v => ({ name: v.name, price: parseFloat(v.price) })),
        }),
      })

      if (res.ok) {
        toast.success('Product created!')
        setShowModal(false)
        resetForm()
        router.refresh()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed to create product')
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
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search products..." value={search}
          onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-sm" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative aspect-video bg-rose-50">
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
              <p className="text-xs text-rose-500 font-medium">{p.category?.name}</p>
              <h3 className="font-display font-semibold text-gray-900 truncate">{p.name}</h3>
              <p className="text-sm font-bold text-rose-600 mt-1">₹{p.basePrice}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Package className="w-3 h-3" />{p.variants.length} variants</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3" />{p._count.reviews} reviews</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => toggleAvailable(p.id, p.available)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${p.available ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                >
                  {p.available ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                  {p.available ? 'Active' : 'Hidden'}
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  className="flex items-center justify-center px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-display font-bold text-xl text-gray-900">Add New Product</h2>
              <button onClick={() => { setShowModal(false); resetForm() }}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
                  <input required type="text" className="input-field" placeholder="e.g., Classic Chocolate Truffle"
                    value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                  <select required className="input-field" value={form.categoryId}
                    onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Base Price (₹) *</label>
                  <input required type="number" min="0" className="input-field" placeholder="499"
                    value={form.basePrice} onChange={e => setForm(p => ({ ...p, basePrice: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                  <textarea required className="input-field h-24 resize-none" placeholder="Describe this cake..."
                    value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>

                {/* Image Upload */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Product Images {imagePreviews.length > 0 && <span className="text-gray-400 font-normal">({imagePreviews.length} selected)</span>}
                  </label>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFilesChange} />

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {imagePreviews.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-50 group">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3" />
                          </button>
                          {i === 0 && (
                            <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1 rounded">Cover</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full h-20 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:border-rose-300 hover:bg-rose-50/50 transition-all text-gray-400 hover:text-rose-500">
                    <Upload className="w-5 h-5" />
                    <div className="text-sm">
                      <span className="font-medium">{imagePreviews.length > 0 ? 'Add more images' : 'Upload images'}</span>
                      <span className="text-xs block text-gray-400">JPG, PNG, WebP up to 5MB each</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Variants */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Variants & Pricing</label>
                <div className="grid grid-cols-2 gap-3">
                  {form.variants.map((v, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 w-16 shrink-0">{v.name}</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                        <input type="number" min="0" placeholder="Price" className="input-field pl-7 py-2 text-sm"
                          value={v.price}
                          onChange={e => setForm(p => ({
                            ...p,
                            variants: p.variants.map((vv, ii) => ii === i ? { ...vv, price: e.target.value } : vv)
                          }))} />
                      </div>
                    </div>
                  ))}
                </div>
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
                <button type="button" onClick={() => { setShowModal(false); resetForm() }} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
