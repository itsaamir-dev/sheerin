'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, X, Loader2, Upload, ImageIcon, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { heading: '', description: '', ctaLabel: '', ctaUrl: '', sortOrder: '0', active: true }

export function AdminBannersClient({ banners }: { banners: any[] }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState<any | null>(null)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')

  const openAdd = () => {
    setEditing(null)
    setForm({ ...EMPTY, sortOrder: String(banners.length) })
    setImageFile(null)
    setImagePreview('')
    setOpen(true)
  }

  const openEdit = (b: any) => {
    setEditing(b)
    setForm({ heading: b.heading, description: b.description || '', ctaLabel: b.ctaLabel || '', ctaUrl: b.ctaUrl || '', sortOrder: String(b.sortOrder), active: b.active })
    setImageFile(null)
    setImagePreview(b.image)
    setOpen(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imagePreview) { toast.error('Please upload a banner image'); return }
    setSaving(true)
    try {
      let image = imagePreview
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        const up = await fetch('/api/upload', { method: 'POST', body: fd })
        const d = await up.json()
        if (!up.ok) throw new Error(d.error || 'Upload failed')
        image = d.url
      }
      const res = await fetch(editing ? `/api/banners/${editing.id}` : '/api/banners', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, image }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed to save')
      toast.success(editing ? 'Banner updated' : 'Banner added')
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (b: any) => {
    const res = await fetch(`/api/banners/${b.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !b.active }),
    })
    if (res.ok) { toast.success(b.active ? 'Banner hidden' : 'Banner live'); router.refresh() }
    else toast.error('Failed to update')
  }

  const remove = async (b: any) => {
    if (!confirm(`Delete banner "${b.heading}"?`)) return
    const res = await fetch(`/api/banners/${b.id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Banner deleted'); router.refresh() }
    else toast.error('Failed to delete')
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Homepage Banners</h1>
          <p className="text-gray-500 mt-1">{banners.filter((b) => b.active).length} live of {banners.length}. Slides rotate in sort order.</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Banner</button>
      </div>
      <p className="text-sm text-gray-400 mb-8">Use wide images (at least 1600 × 600). Text sits on the left, so keep the subject on the right. Without any live banners, the homepage shows default slides.</p>

      {banners.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-600">No banners yet</p>
          <button onClick={openAdd} className="btn-primary mt-4 inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add your first banner</button>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((b) => (
            <div key={b.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col md:flex-row ${b.active ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
              <div className="relative md:w-80 aspect-[16/6] md:aspect-auto bg-rose-50 shrink-0">
                <img src={b.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="flex-1 p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-400">#{b.sortOrder}</p>
                    <h3 className="font-display font-bold text-lg text-gray-900">{b.heading}</h3>
                    {b.description && <p className="text-sm text-gray-500 mt-1">{b.description}</p>}
                  </div>
                  <span className={`badge text-[10px] ${b.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{b.active ? 'Live' : 'Hidden'}</span>
                </div>
                {b.ctaUrl && <p className="text-xs text-gray-500 mt-2">Button: <strong>{b.ctaLabel || 'Shop Now'}</strong> → <code>{b.ctaUrl}</code></p>}
                <div className="flex gap-2 mt-auto pt-4">
                  <button onClick={() => openEdit(b)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                  <button onClick={() => toggle(b)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100">
                    {b.active ? <><EyeOff className="w-3.5 h-3.5" /> Hide</> : <><Eye className="w-3.5 h-3.5" /> Publish</>}
                  </button>
                  <button onClick={() => remove(b)} className="flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-display font-bold text-xl">{editing ? 'Edit' : 'Add'} Banner</h2>
              <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Banner image *</label>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)) } }} />
                {imagePreview ? (
                  <button type="button" onClick={() => fileRef.current?.click()} className="relative block w-full aspect-[16/6] rounded-xl overflow-hidden group">
                    <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                    <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-sm font-semibold gap-1.5"><Upload className="w-4 h-4" /> Change</span>
                  </button>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full aspect-[16/6] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-rose-300 hover:text-rose-500">
                    <Upload className="w-6 h-6" /><span className="text-sm font-medium">Upload image</span><span className="text-xs">JPG, PNG, WebP up to 5MB</span>
                  </button>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Heading *</label>
                <input required maxLength={120} className="input-field" placeholder="e.g. Diwali Specials are here" value={form.heading} onChange={(e) => setForm((p) => ({ ...p, heading: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea maxLength={240} className="input-field h-20 resize-none" placeholder="One short line that supports the heading" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Button label</label>
                  <input maxLength={40} className="input-field" placeholder="Shop Now" value={form.ctaLabel} onChange={(e) => setForm((p) => ({ ...p, ctaLabel: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Target URL</label>
                  <input className="input-field" placeholder="/products?category=cakes" value={form.ctaUrl} onChange={(e) => setForm((p) => ({ ...p, ctaUrl: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort order</label>
                  <input type="number" className="input-field" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))} />
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-7">
                  <input type="checkbox" className="w-4 h-4 rounded text-rose-600" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
                  <span className="text-sm text-gray-700">Live on homepage</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
