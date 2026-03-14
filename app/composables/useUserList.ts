import type { Role } from '~~/shared/types/roles'

interface UserRow {
  id: number
  username: string
  email: string
  role: string
  parentId: number | null
  status: string
  walletType: string
  createdAt: string
  balance: string | null
}

interface UserListResponse {
  data: UserRow[]
  total: number
  page: number
  limit: number
}

export function useUserList(role: Role, pageKey: string, columns: Array<{ accessorKey: string; header: string }>, defaultSort = 'createdAt') {
  const searchQuery = ref('')
  const currentPage = ref(1)
  const pageSize = ref(20)
  const selectedIds = ref(new Set<number>())

  const tableStore = useTableStore(pageKey, columns, defaultSort)

  const queryParams = computed(() => ({
    role,
    page: currentPage.value,
    limit: pageSize.value,
    sortBy: tableStore.sortBy.value,
    sortDirection: tableStore.sortDirection.value,
    ...(searchQuery.value.trim() ? { search: searchQuery.value.trim() } : {})
  }))

  const { data: response, refresh, status } = useAsyncData(
    `${pageKey}-list`,
    () => $fetch<UserListResponse>('/api/users', { query: queryParams.value }),
    { watch: [queryParams] }
  )

  const rows = computed(() => response.value?.data ?? [])
  const total = computed(() => response.value?.total ?? 0)
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

  // Selection
  const selectedRows = computed(() => rows.value.filter(r => selectedIds.value.has(r.id)))
  const allSelected = computed(() => rows.value.length > 0 && rows.value.every(r => selectedIds.value.has(r.id)))
  const someSelected = computed(() => !allSelected.value && rows.value.some(r => selectedIds.value.has(r.id)))

  function toggleAll() {
    if (allSelected.value) {
      rows.value.forEach(r => selectedIds.value.delete(r.id))
    } else {
      rows.value.forEach(r => selectedIds.value.add(r.id))
    }
  }

  function toggleRow(id: number) {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id)
    } else {
      selectedIds.value.add(id)
    }
  }

  function clearSelection() {
    selectedIds.value.clear()
  }

  function handleRefresh() {
    clearSelection()
    refresh()
  }

  function handleModalSuccess() {
    clearSelection()
    refresh()
  }

  // Reset page on search/pageSize change
  watch(searchQuery, () => { currentPage.value = 1 })
  watch(pageSize, () => { currentPage.value = 1 })

  return {
    // Data
    rows,
    total,
    totalPages,
    status,
    refresh,

    // Search & pagination
    searchQuery,
    currentPage,
    pageSize,

    // Selection
    selectedIds,
    selectedRows,
    allSelected,
    someSelected,
    toggleAll,
    toggleRow,
    clearSelection,

    // Actions
    handleRefresh,
    handleModalSuccess,

    // Table store (passthrough)
    ...tableStore
  }
}
