'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, X, Loader2, Grid3X3, Upload, ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name: '', description: '', group: 'TYPE', sortOrder: '0', showOnHome: true }

const GROUP_LABELS: Record<string, string> = { TYPE: 'Cake type', OCCASION: 'Occasion', FLAVOUR: 'Flavour' }

export function AdminCategoriesClient({ categories }: { categories: any[] }) {
  const router    = useRouter()
  const fileRef   = useRef<HTMLInputElement>(null)
  const [modal, setModal]     = useState<'add' | 'edit' | null>(null)
  const [saving, setSaving]   = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [imageFile, setImageFile]       = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditing(null)
    setImageFile(null)
    setImagePreview('')
    setModal('add')
  }

  const openEdit = (c: any) => {
    setForm({ name: c.name, description: c.description || '', group: c.group, sortOrder: String(c.sortOrder), showOnHome: c.showOnHome })
    setEditing(c)
    setImageFile(null)
    setImagePreview(c.image || '')
    setModal('edit')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      let imageUrl = imagePreview

      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        const up = await fetch('/api/upload', { method: 'POST', body: fd })
        const upData = await up.json()
        if (!up.ok) throw new Error(upData.error || 'Upload failed')
        imageUrl = upData.url
      }

      // Keep an existing category's slug so links to it (navbar, banners, shared URLs) keep working
      const slug   = modal === 'edit' ? editing.slug : form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const url    = modal === 'edit' ? `/api/categories/${editing.id}` : '/api/categories'
      const method = modal === 'edit' ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug, image: imageUrl || null }),
      })

      if (res.ok) {
        toast.success(modal === 'edit' ? 'Category updated!' : 'Category created!')
        setModal(null)
        router.refresh()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string, productCount: number) => {
    if (productCount > 0) {
      toast.error(`Move or delete the ${productCount} product(s) in "${name}" first`)
      return
    }
    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Category deleted'); router.refresh() }
    else {
      const d = await res.json()
      toast.error(d.error || 'Failed to delete')
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">{categories.length} categories</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {categories.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative h-36 bg-rose-50">
              {c.image
                ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><Grid3X3 className="w-10 h-10 text-rose-200" /></div>
              }
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              {!c.showOnHome && (
                <span className="absolute top-2 right-2 badge bg-white/90 text-gray-600 text-[10px]">Hidden on homepage</span>
              )}
              <div className="absolute bottom-3 left-3">
                <h3 className="font-display font-bold text-white">{c.name}</h3>
                <p className="text-white/70 text-xs">{c.productCount} products · {GROUP_LABELS[c.group] || c.group}</p>
              </div>
            </div>
            <div className="p-3">
              {c.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{c.description}</p>}
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(c.id, c.name, c._count.products)} className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-display font-bold text-xl">{modal === 'edit' ? 'Edit' : 'Add'} Category</h2>
              <button onClick={() => setModal(null)} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name *</label>
                <input required type="text" className="input-field" placeholder="e.g., Birthday Cakes"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea className="input-field h-20 resize-none" placeholder="Short description..."
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Homepage group</label>
                  <select className="input-field" value={form.group} onChange={e => setForm(p => ({ ...p, group: e.target.value }))}>
                    {Object.entries(GROUP_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort order</label>
                  <input type="number" className="input-field" value={form.sortOrder}
                    onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))} />
                </div>
                <label className="col-span-2 flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded text-rose-600" checked={form.showOnHome}
                    onChange={e => setForm(p => ({ ...p, showOnHome: e.target.checked }))} />
                  <span className="text-sm text-gray-700">Show on homepage <span className="text-gray-400">(only once it has products)</span></span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Image</label>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                {imagePreview ? (
                  <div className="relative h-36 rounded-xl overflow-hidden bg-gray-50 group">
                    <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" /> Change
                      </button>
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview('') }}
                        className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full h-28 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-rose-300 hover:bg-rose-50/50 transition-all text-gray-400 hover:text-rose-500">
                    <ImageIcon className="w-7 h-7" />
                    <span className="text-sm font-medium">Click to upload image</span>
                    <span className="text-xs">JPG, PNG, WebP up to 5MB</span>
                  </button>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
