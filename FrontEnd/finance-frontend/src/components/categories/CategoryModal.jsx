import { useState, useEffect } from 'react'
import { categoryService } from '../../services/finance'
import { X } from 'lucide-react'

const COLORS = ['#22c55e','#ef4444','#3b82f6','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#84cc16']
const ICONS = ['🍔','🚗','🏠','💊','🎓','🎉','✈️','👗','💻','💰','📦','🐾','🎮','⚽','📚','🎵']

export default function CategoryModal({ category, onClose, onSaved }) {
  const [form, setForm] = useState({ name: '', type: 'EXPENSE', color: '#22c55e', icon: '📁' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (category) setForm({ name: category.name, type: category.type, color: category.color || '#22c55e', icon: category.icon || '📁' })
  }, [category])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (category) await categoryService.update(category.id, form)
      else await categoryService.create(form)
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar categoria')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">{category ? 'Editar' : 'Nova'} Categoria</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1"><X size={20} /></button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 p-1 bg-surface rounded-xl">
            {['EXPENSE', 'INCOME'].map(t => (
              <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${form.type === t ? (t === 'INCOME' ? 'bg-brand-500 text-white' : 'bg-red-500 text-white') : 'text-gray-400 hover:text-white'}`}>
                {t === 'INCOME' ? 'Receita' : 'Despesa'}
              </button>
            ))}
          </div>

          <div>
            <label className="label">Nome</label>
            <input className="input" placeholder="Ex: Alimentação" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>

          <div>
            <label className="label">Cor</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-8 h-8 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-card scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>

          <div>
            <label className="label">Ícone</label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map(icon => (
                <button key={icon} type="button" onClick={() => setForm(f => ({ ...f, icon }))}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${form.icon === icon ? 'bg-brand-500/20 ring-1 ring-brand-500' : 'bg-surface hover:bg-surface-hover'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={loading}>
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
