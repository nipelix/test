export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatBalance(val: string | number | null | undefined): string {
  if (val == null) return '0.00'
  return Number(val).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

export function getCouponStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'info',
    ONGOING: 'info',
    WINNING: 'success',
    LOSING: 'error',
    WON: 'success',
    LOST: 'error',
    CANCELLED: 'neutral',
    REFUNDED: 'warning'
  }
  return colors[status.toUpperCase()] || 'neutral'
}
