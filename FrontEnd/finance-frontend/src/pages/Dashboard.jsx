import { useState, useEffect } from 'react'
import { transactionService } from '../services/finance'
import { formatCurrency, formatDate } from '../utils/format'
import { useAuth } from '../context/AuthContext'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [sumRes, txRes] = await Promise.all([
        transactionService.getSummary({ startDate, endDate }),
        transactionService.getAll({ page: 0, size: 5 })
      ])
      setSummary(sumRes.data)
      setTransactions(txRes.data.content || [])

      // Build last 6 months chart data
      const months = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
        months.push({ label: d.toLocaleDateString('pt-BR', { month: 'short' }), start, end })
      }

      const chartResults = await Promise.all(
        months.map(m => transactionService.getSummary({ startDate: m.start, endDate: m.end }))
      )

      setChartData(months.map((m, i) => ({
        month: m.label,
        receitas: Number(chartResults[i].data.totalIncome || 0),
        despesas: Number(chartResults[i].data.totalExpense || 0),
      })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const pieData = transactions.reduce((acc, tx) => {
    const name = tx.category?.name || 'Sem categoria'
    const existing = acc.find(i => i.name === name)
    if (existing) existing.value += Number(tx.amount)
    else acc.push({ name, value: Number(tx.amount) })
    return acc
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Olá, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-400 mt-1">Aqui está o resumo do mês atual</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400 font-medium">Saldo</span>
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <Wallet size={18} className="text-brand-400" />
            </div>
          </div>
          <p className={`text-2xl font-bold font-mono ${Number(summary?.balance) >= 0 ? 'text-brand-400' : 'text-red-400'}`}>
            {formatCurrency(summary?.balance)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Este mês</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400 font-medium">Receitas</span>
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 flex items-center justify-center">
              <TrendingUp size={18} className="text-brand-400" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-brand-400">{formatCurrency(summary?.totalIncome)}</p>
          <p className="text-xs text-gray-500 mt-1">Este mês</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400 font-medium">Despesas</span>
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
              <TrendingDown size={18} className="text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold font-mono text-red-400">{formatCurrency(summary?.totalExpense)}</p>
          <p className="text-xs text-gray-500 mt-1">Este mês</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-white mb-5">Evolução dos últimos 6 meses</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#161b27', border: '1px solid #1e2535', borderRadius: 12, color: '#fff' }}
                formatter={(v, n) => [formatCurrency(v), n === 'receitas' ? 'Receitas' : 'Despesas']}
              />
              <Area type="monotone" dataKey="receitas" stroke="#22c55e" strokeWidth={2} fill="url(#income)" />
              <Area type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} fill="url(#expense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-white mb-5">Por categoria</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#161b27', border: '1px solid #1e2535', borderRadius: 12, color: '#fff' }}
                  formatter={v => formatCurrency(v)}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm">Sem dados</div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-white mb-5">Últimas transações</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">Nenhuma transação encontrada</p>
        ) : (
          <div className="space-y-3">
            {transactions.map(tx => (
              <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-hover transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${tx.type === 'INCOME' ? 'bg-brand-500/10' : 'bg-red-500/10'}`}>
                  {tx.type === 'INCOME'
                    ? <ArrowUpRight size={16} className="text-brand-400" />
                    : <ArrowDownRight size={16} className="text-red-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                  <p className="text-xs text-gray-500">{tx.category?.name || 'Sem categoria'} · {formatDate(tx.date)}</p>
                </div>
                <span className={`text-sm font-semibold font-mono flex-shrink-0 ${tx.type === 'INCOME' ? 'text-brand-400' : 'text-red-400'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
