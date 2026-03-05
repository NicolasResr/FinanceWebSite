import { useState, useEffect } from 'react'
import { categoryService } from '../services/finance'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'
import CategoryModal from '../components/categories/CategoryModal'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('')

  useEffect(() => { loadCategories() }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const res = await categoryService.getAll()
      setCategories(res.data)
    } finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Excluir esta categoria?')) return
    await categoryService.delete(id)
    loadCategories()
  }

  const income = categories.filter(c => c.type === 'INCOME')
  const expense = categories.filter(c => c.type === 'EXPENSE')

  const CategoryGroup = ({ title, items, type }) => (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${type === 'INCOME' ? 'bg-brand-500' : 'bg-red-500'}`} />
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <span className="text-xs text-gray-500 bg-surface-hover px-2 py-0.5 rounded-full">{items.length}</span>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
          <Tag size={24} className="mb-2 opacity-30" />
          <p className="text-sm">Nenhuma categoria</p>
        </div>
      ) : (
        <div className="divide-y divide-surface-border">
          {items.map(cat => (
            <div key={cat.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-hover transition-colors">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: (cat.color || '#22c55e') + '20', border: `1px solid ${cat.color || '#22c55e'}30` }}>
                <span className="text-base">{cat.icon || '📁'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{cat.name}</p>
                <p className="text-xs text-gray-500">{cat.color || 'Sem cor'}</p>
              </div>
              <div className={`w-3 h-3 rounded-full flex-shrink-0`} style={{ backgroundColor: cat.color || '#6b7280' }} />
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditing(cat); setShowModal(true) }} className="p-1.5 text-gray-400 hover:text-white hover:bg-surface-hover rounded-lg transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categorias</h1>
          <p className="text-gray-400 text-sm mt-0.5">{categories.length} categorias cadastradas</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setEditing(null); setShowModal(true) }}>
          <Plus size={16} /> Nova
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <CategoryGroup title="Receitas" items={income} type="INCOME" />
          <CategoryGroup title="Despesas" items={expense} type="EXPENSE" />
        </div>
      )}

      {showModal && (
        <CategoryModal
          category={editing}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSaved={() => { setShowModal(false); setEditing(null); loadCategories() }}
        />
      )}
    </div>
  )
}
