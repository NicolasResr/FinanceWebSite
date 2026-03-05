export const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0)

export const formatDate = (date) =>
  new Intl.DateTimeFormat('pt-BR').format(new Date(date + 'T00:00:00'))

export const clsx = (...classes) => classes.filter(Boolean).join(' ')
