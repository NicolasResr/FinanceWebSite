import { useState, useEffect } from 'react'
import { transactionService } from '../../services/finance'
import { X } from 'lucide-react'

export default function TransactionModal({ transaction, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    description: '', amount: '', type: 'EXPENSE',
    date: new Date().toISOString().split('T')[0], notes: '', categoryId: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (transaction) {
      setForm({
        description: transaction.description || '',
        amount: transaction.amount || '',
        type: transaction.type || 'EXPENSE',
        date: transaction.date || '',
        notes: transaction.notes || '',
        categoryId: transaction.category?.id || ''
      })
    }
  }, [transaction])

  const filteredCategories = categories.filter(c => c.type === form.type)

  const handleChange = (key, value) => {
    setForm(f => ({ ...f, [key]: value }))
    if (key === 'type') setForm(f => ({ ...f, type: value, categoryId: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        categoryId: form.categoryId ? Number(form.categoryId) : null
      }
      if (transaction) await transactionService.update(transaction.id, payload)
      else await transactionService.create(payload)
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar transação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">{transaction ? 'Editar' : 'Nova'} Transação</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2 p-1 bg-surface rounded-xl">
            {['EXPENSE', 'INCOME'].map(t => (
              <button key={t} type="button" onClick={() => handleChange('type', t)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${form.type === t ? (t === 'INCOME' ? 'bg-brand-500 text-white' : 'bg-red-500 text-white') : 'text-gray-400 hover:text-white'}`}>
                {t === 'INCOME' ? 'Receita' : 'Despesa'}
              </button>
            ))}
          </div>

          <div>
            <label className="label">Descrição</label>
            <input className="input" placeholder="Ex: Mercado" value={form.description} onChange={e => handleChange('description', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Valor (R$)</label>
              <input type="number" step="0.01" min="0.01" className="input" placeholder="0,00" value={form.amount} onChange={e => handleChange('amount', e.target.value)} required />
            </div>
            <div>
              <label className="label">Data</label>
              <input type="date" className="input" value={form.date} onChange={e => handleChange('date', e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="label">Categoria</label>
            <select className="input" value={form.categoryId} onChange={e => handleChange('categoryId', e.target.value)}>
              <option value="">Sem categoria</option>
              {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Observações</label>
            <input className="input" placeholder="Opcional" value={form.notes} onChange={e => handleChange('notes', e.target.value)} />
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
