/**
 * Generic composable for CRUD entity lists (sports, countries, leagues, etc.)
 * Handles: fetch, search, pagination, selection, refresh
 */
export function useEntityList<T extends { id: number }>(
  endpoint: string,
  pageKey: string,
  columns: Array<{ accessorKey: string; header: string }>,
  defaultSort = 'id'
) {
  const searchQuery = ref('')
  const debouncedSearch = ref('')
  const currentPage = ref(1)
  const pageSize = ref(20)
  const selectedIds = reactive(new Set<number>())

  let searchTimer: ReturnType<typeof setTimeout> | null = null
  watch(searchQuery, (val) => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      debouncedSearch.value = val
      currentPage.value = 1
    }, 300)
  })

  onBeforeUnmount(() => {
    if (searchTimer) clearTimeout(searchTimer)
  })

  const tableStore = useTableStore(pageKey, columns, defaultSort)

  const queryParams = computed(() => ({
    page: currentPage.value,
    limit: pageSize.value,
    ...(debouncedSearch.value.trim() ? { search: debouncedSearch.value.trim() } : {})
  }))

  const { data: response, refresh, status } = useAsyncData(
    `${pageKey}-list`,
    () => $fetch<{ data: T[]; total: number }>(endpoint, { query: queryParams.value }),
    { watch: [queryParams] }
  )

  const rows = computed(() => response.value?.data ?? [])
  const total = computed(() => response.value?.total ?? 0)
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

  const selectedRows = computed(() => rows.value.filter(r => selectedIds.has(r.id)))
  const allSelected = computed(() => rows.value.length > 0 && rows.value.every(r => selectedIds.has(r.id)))
  const someSelected = computed(() => !allSelected.value && rows.value.some(r => selectedIds.has(r.id)))

  function toggleAll() {
    if (allSelected.value) rows.value.forEach(r => selectedIds.delete(r.id))
    else rows.value.forEach(r => selectedIds.add(r.id))
  }
  function toggleRow(id: number) {
    selectedIds.has(id) ? selectedIds.delete(id) : selectedIds.add(id)
  }
  function clearSelection() { selectedIds.clear() }
  function handleRefresh() { clearSelection(); refresh() }

  // Bulk operations — returns { succeeded, failed } counts
  async function bulkPatch(body: Record<string, any>): Promise<{ succeeded: number; failed: number }> {
    if (selectedRows.value.length === 0) return { succeeded: 0, failed: 0 }
    const results = await Promise.allSettled(
      selectedRows.value.map(r => $fetch(`${endpoint}/${r.id}`, { method: 'PATCH', body }))
    )
    const failed = results.filter(r => r.status === 'rejected').length
    handleRefresh()
    return { succeeded: results.length - failed, failed }
  }

  async function bulkDelete(): Promise<{ succeeded: number; failed: number }> {
    if (selectedRows.value.length === 0) return { succeeded: 0, failed: 0 }
    const results = await Promise.allSettled(
      selectedRows.value.map(r => $fetch(`${endpoint}/${r.id}`, { method: 'DELETE' }))
    )
    const failed = results.filter(r => r.status === 'rejected').length
    handleRefresh()
    return { succeeded: results.length - failed, failed }
  }

  watch(pageSize, () => { currentPage.value = 1 })

  return {
    rows, total, totalPages, status, refresh,
    searchQuery, currentPage, pageSize,
    selectedIds, selectedRows, allSelected, someSelected,
    toggleAll, toggleRow, clearSelection, handleRefresh,
    bulkPatch, bulkDelete,
    ...tableStore
  }
}
