import { useState, useEffect, useCallback } from 'react'
import { transactionService, categoryService } from '../services/finance'
import { formatCurrency, formatDate } from '../utils/format'
import { Plus, Search, Filter, Trash2, Pencil, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight } from 'lucide-react'
import TransactionModal from '../components/transactions/TransactionModal'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filters, setFilters] = useState({ type: '', categoryId: '', description: '', startDate: '', endDate: '' })

  useEffect(() => { categoryService.getAll().then(r => setCategories(r.data)) }, [])
  useEffect(() => { loadTransactions() }, [page, filters])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const params = { page, size: 10, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) }
      const res = await transactionService.getAll(params)
      setTransactions(res.data.content || [])
      setTotalPages(res.data.totalPages || 0)
      setTotalElements(res.data.totalElements || 0)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Excluir esta transação?')) return
    await transactionService.delete(id)
    loadTransactions()
  }

  const handleSaved = () => { setShowModal(false); setEditing(null); loadTransactions() }

  const handleFilter = (key, value) => { setFilters(f => ({ ...f, [key]: value })); setPage(0) }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transações</h1>
          <p className="text-gray-400 text-sm mt-0.5">{totalElements} registros encontrados</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setEditing(null); setShowModal(true) }}>
          <Plus size={16} /> Nova
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input className="input pl-9" placeholder="Buscar..." value={filters.description} onChange={e => handleFilter('description', e.target.value)} />
          </div>
          <select className="input" value={filters.type} onChange={e => handleFilter('type', e.target.value)}>
            <option value="">Todos os tipos</option>
            <option value="INCOME">Receitas</option>
            <option value="EXPENSE">Despesas</option>
          </select>
          <select className="input" value={filters.categoryId} onChange={e => handleFilter('categoryId', e.target.value)}>
            <option value="">Todas categorias</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input type="date" className="input" value={filters.startDate} onChange={e => handleFilter('startDate', e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <ArrowUpRight size={32} className="mb-2 opacity-30" />
            <p className="text-sm">Nenhuma transação encontrada</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-border">
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-4">Descrição</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-4 hidden md:table-cell">Categoria</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-4 hidden sm:table-cell">Data</th>
                    <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-4">Tipo</th>
                    <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-4">Valor</th>
                    <th className="px-5 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tx.type === 'INCOME' ? 'bg-brand-500/10' : 'bg-red-500/10'}`}>
                            {tx.type === 'INCOME' ? <ArrowUpRight size={14} className="text-brand-400" /> : <ArrowDownRight size={14} className="text-red-400" />}
                          </div>
                          <span className="text-sm text-white font-medium">{tx.description}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-xs text-gray-400 bg-surface-hover px-2.5 py-1 rounded-lg">{tx.category?.name || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-400 hidden sm:table-cell">{formatDate(tx.date)}</td>
                      <td className="px-5 py-3.5">
                        {tx.type === 'INCOME' ? <span className="badge-income">Receita</span> : <span className="badge-expense">Despesa</span>}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`text-sm font-semibold font-mono ${tx.type === 'INCOME' ? 'text-brand-400' : 'text-red-400'}`}>
                          {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => { setEditing(tx); setShowModal(true) }} className="p-1.5 text-gray-400 hover:text-white hover:bg-surface-hover rounded-lg transition-colors">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(tx.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-surface-border">
                <span className="text-xs text-gray-400">Página {page + 1} de {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => p - 1)} disabled={page === 0} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <TransactionModal
          transaction={editing}
          categories={categories}
          onClose={() => { setShowModal(false); setEditing(null) }}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
