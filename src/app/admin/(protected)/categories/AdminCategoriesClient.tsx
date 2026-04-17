'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, X, Loader2, Grid3X3 } from 'lucide-react'
import toast from 'react-hot-toast'

export function AdminCategoriesClient({ categories }: { categories: any[] }) {
  const router  = useRouter()
  const [modal, setModal]   = useState<'add' | 'edit' | null>(null)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', description: '', image: '' })

  const openAdd  = () => { setForm({ name: '', description: '', image: '' }); setEditing(null); setModal('add') }
  const openEdit = (c: any) => { setForm({ name: c.name, description: c.description || '', image: c.image || '' }); setEditing(c); setModal('edit') }
  const up = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const slug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const url    = modal === 'edit' ? `/api/categories/${editing.id}` : '/api/categories'
      const method = modal === 'edit' ? 'PATCH' : 'POST'
      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, slug }),
      })
      if (res.ok) {
        toast.success(modal === 'edit' ? 'Category updated!' : 'Category created!')
        setModal(null)
        router.refresh()
      } else {
        const d = await res.json()
        toast.error(d.error || 'Failed')
      }
    } catch { toast.error('Something went wrong') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Products in it will become uncategorised.')) return
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Deleted'); router.refresh() }
    else toast.error('Cannot delete — category may have products')
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
              <div className="absolute bottom-3 left-3">
                <h3 className="font-display font-bold text-white">{c.name}</h3>
                <p className="text-white/70 text-xs">{c._count.products} products</p>
              </div>
            </div>
            <div className="p-3">
              {c.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{c.description}</p>}
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(c.id)} className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
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
                <input required type="text" className="input-field" placeholder="e.g., Birthday Cakes" value={form.name} onChange={e => up('name', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea className="input-field h-20 resize-none" placeholder="Short description..." value={form.description} onChange={e => up('description', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Image URL</label>
                <input type="url" className="input-field" placeholder="https://..." value={form.image} onChange={e => up('image', e.target.value)} />
                {form.image && (
                  <div className="mt-2 h-24 rounded-lg overflow-hidden bg-gray-50">
                    <img src={form.image} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
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
