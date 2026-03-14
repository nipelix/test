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
  const debouncedSearch = ref('')
  const currentPage = ref(1)
  const pageSize = ref(20)
  const selectedIds = reactive(new Set<number>())

  // Debounce search to avoid excessive API calls
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
    role,
    page: currentPage.value,
    limit: pageSize.value,
    sortBy: tableStore.sortBy.value,
    sortDirection: tableStore.sortDirection.value,
    ...(debouncedSearch.value.trim() ? { search: debouncedSearch.value.trim() } : {})
  }))

  const { data: response, refresh, status } = useAsyncData(
    `${pageKey}-list`,
    () => $fetch<UserListResponse>('/api/users', { query: queryParams.value }),
    { watch: [queryParams] }
  )

  const rows = computed(() => response.value?.data ?? [])
  const total = computed(() => response.value?.total ?? 0)
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

  // Selection (reactive Set — Vue 3 tracks add/delete/has natively)
  const selectedRows = computed(() => rows.value.filter(r => selectedIds.has(r.id)))
  const allSelected = computed(() => rows.value.length > 0 && rows.value.every(r => selectedIds.has(r.id)))
  const someSelected = computed(() => !allSelected.value && rows.value.some(r => selectedIds.has(r.id)))

  function toggleAll() {
    if (allSelected.value) {
      rows.value.forEach(r => selectedIds.delete(r.id))
    } else {
      rows.value.forEach(r => selectedIds.add(r.id))
    }
  }

  function toggleRow(id: number) {
    if (selectedIds.has(id)) {
      selectedIds.delete(id)
    } else {
      selectedIds.add(id)
    }
  }

  function clearSelection() {
    selectedIds.clear()
  }

  function handleRefresh() {
    clearSelection()
    refresh()
  }

  function handleModalSuccess() {
    clearSelection()
    refresh()
  }

  watch(pageSize, () => { currentPage.value = 1 })

  return {
    rows,
    total,
    totalPages,
    status,
    refresh,

    searchQuery,
    currentPage,
    pageSize,

    selectedIds,
    selectedRows,
    allSelected,
    someSelected,
    toggleAll,
    toggleRow,
    clearSelection,

    handleRefresh,
    handleModalSuccess,

    ...tableStore
  }
}
