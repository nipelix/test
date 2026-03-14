export function useTableExport() {
  function exportToCsv(
    rows: any[],
    columns: Array<{ accessorKey: string; header: string }>,
    filename: string
  ) {
    // Filter out non-data columns
    const dataColumns = columns.filter(c => c.accessorKey !== 'select' && c.accessorKey !== 'process')

    // Header row
    const headers = dataColumns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',')

    // Data rows
    const csvRows = rows.map(row => {
      return dataColumns.map(col => {
        const val = row[col.accessorKey]
        if (val == null) return '""'
        const str = String(val).replace(/"/g, '""')
        return `"${str}"`
      }).join(',')
    })

    const csv = [headers, ...csvRows].join('\n')
    const BOM = '\uFEFF' // UTF-8 BOM for Excel Turkish char support
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

  return { exportToCsv }
}
