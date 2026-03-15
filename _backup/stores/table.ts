import { defineStore, storeToRefs } from 'pinia'

interface Column {
  accessorKey: string
  header: string
  sortable?: boolean
}

export interface SortItem {
  key: string
  direction: 'asc' | 'desc'
}

export function useTableStore(pageKey: string, allColumns: Column[], defaultSort: string) {
  const store = defineStore(`table-${pageKey}`, () => {
    const auth = useAuthStore()

    // ── Sort state ──
    const sorts = ref<SortItem[]>(getInitialSorts())

    const sortBy = computed(() => sorts.value.map(s => s.key).join(',') || defaultSort)
    const sortDirection = computed(() => sorts.value.map(s => s.direction).join(',') || 'desc')

    const availableSortColumns = computed(() => {
      const usedKeys = new Set(sorts.value.map(s => s.key))
      return allColumns
        .filter(c => c.accessorKey !== 'select' && c.accessorKey !== 'process' && !usedKeys.has(c.accessorKey))
        .map(c => ({ key: c.accessorKey, label: c.header }))
    })

    const sortableColumns = computed(() =>
      allColumns
        .filter(c => c.accessorKey !== 'select' && c.accessorKey !== 'process')
        .map(c => ({ key: c.accessorKey, label: c.header }))
    )

    function addSort() {
      const usedKeys = new Set(sorts.value.map(s => s.key))
      const available = allColumns.filter(c => c.accessorKey !== 'select' && c.accessorKey !== 'process' && !usedKeys.has(c.accessorKey))
      if (available.length === 0) return
      sorts.value.push({ key: available[0].accessorKey, direction: 'asc' })
    }

    function removeSort(index: number) {
      sorts.value.splice(index, 1)
    }

    function updateSortColumn(index: number, key: string) {
      sorts.value[index] = { ...sorts.value[index], key }
    }

    function updateSortDirection(index: number, direction: 'asc' | 'desc') {
      sorts.value[index] = { ...sorts.value[index], direction }
    }

    function clearSorts() {
      sorts.value = []
    }

    function getColumnLabel(key: string): string {
      return allColumns.find(c => c.accessorKey === key)?.header ?? key
    }

    // ── Column visibility ──
    const storageKey = `table-columns-${pageKey}`
    const allKeys = allColumns.map(c => c.accessorKey)

    const visibleColumnKeys = ref<string[]>(getInitialColumns())

    const filteredColumns = computed(() =>
      allColumns.filter(c => visibleColumnKeys.value.includes(c.accessorKey))
    )

    const toggleableColumns = computed(() =>
      allColumns.filter(c => c.accessorKey !== 'select' && c.accessorKey !== 'process')
    )

    function toggleColumn(key: string) {
      const idx = visibleColumnKeys.value.indexOf(key)
      if (idx !== -1) {
        if (visibleColumnKeys.value.length > 1) {
          visibleColumnKeys.value.splice(idx, 1)
        }
      } else {
        visibleColumnKeys.value.push(key)
      }
      if (import.meta.client) {
        localStorage.setItem(storageKey, JSON.stringify(visibleColumnKeys.value))
      }
      if (auth.preferencesLoaded) {
        auth.saveTablePrefs(pageKey, { columns: [...visibleColumnKeys.value] })
      }
    }

    // Watch sorts and save to DB
    watch(sorts, (newSorts) => {
      if (auth.preferencesLoaded) {
        auth.saveTablePrefs(pageKey, { sorts: [...newSorts] })
      }
    }, { deep: true })

    // ── Init helpers ──

    function getInitialColumns(): string[] {
      const dbPrefs = auth.getTablePrefs(pageKey)
      if (dbPrefs?.columns && dbPrefs.columns.length > 0) {
        const dbSet = new Set(dbPrefs.columns)
        const allKeySet = new Set(allKeys)
        const knownInDb = dbPrefs.columns.filter(k => allKeySet.has(k))
        const newColumns = allKeys.filter(k => !dbSet.has(k) && k !== 'select' && k !== 'process')
        return [...knownInDb, ...newColumns]
      }

      if (import.meta.client) {
        try {
          const raw = localStorage.getItem(storageKey)
          if (raw) {
            const parsed = JSON.parse(raw) as string[]
            if (Array.isArray(parsed) && parsed.length > 0) return parsed
          }
        } catch {}
      }

      return allKeys
    }

    function getInitialSorts(): SortItem[] {
      const dbPrefs = auth.getTablePrefs(pageKey)
      if (dbPrefs?.sorts && dbPrefs.sorts.length > 0) {
        return dbPrefs.sorts
      }
      return []
    }

    return {
      sorts,
      sortBy,
      sortDirection,
      addSort,
      removeSort,
      updateSortColumn,
      updateSortDirection,
      clearSorts,
      availableSortColumns,
      getColumnLabel,
      visibleColumnKeys,
      toggleColumn,
      filteredColumns,
      sortableColumns,
      toggleableColumns
    }
  })()

  // Return refs with reactivity preserved + plain functions
  const {
    sorts, sortBy, sortDirection, availableSortColumns,
    visibleColumnKeys, filteredColumns, sortableColumns, toggleableColumns
  } = storeToRefs(store)

  return {
    sorts,
    sortBy,
    sortDirection,
    availableSortColumns,
    visibleColumnKeys,
    filteredColumns,
    sortableColumns,
    toggleableColumns,
    addSort: store.addSort,
    removeSort: store.removeSort,
    updateSortColumn: store.updateSortColumn,
    updateSortDirection: store.updateSortDirection,
    clearSorts: store.clearSorts,
    getColumnLabel: store.getColumnLabel,
    toggleColumn: store.toggleColumn
  }
}
