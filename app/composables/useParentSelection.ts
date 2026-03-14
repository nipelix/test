import { isRole } from '~~/shared/types/roles'
import type { Role } from '~~/shared/types/roles'

interface SimpleUser {
  id: number
  username: string
}

interface FetchResult {
  data: SimpleUser[]
}

export function useParentSelection(targetRole: Ref<Role> | ComputedRef<Role>) {
  const auth = useAuthStore()

  const currentRole = computed<Role>(() => {
    const r = auth.user?.role
    return (r && isRole(r)) ? r : 'PLAYER'
  })
  const isSuperAdmin = computed(() => currentRole.value === 'SUPER_ADMIN')

  // ── State ──
  const parentState = reactive({
    adminId: null as number | null,
    agentId: null as number | null,
    dealerId: null as number | null,
    subDealerId: null as number | null
  })

  const adminList = ref<SimpleUser[]>([])
  const agentList = ref<SimpleUser[]>([])
  const dealerList = ref<SimpleUser[]>([])
  const subDealerList = ref<SimpleUser[]>([])

  // ── Options for select menus ──
  const adminOptions = computed(() => adminList.value.map(u => ({ label: u.username, value: u.id })))
  const agentOptions = computed(() => agentList.value.map(u => ({ label: u.username, value: u.id })))
  const dealerOptions = computed(() => dealerList.value.map(u => ({ label: u.username, value: u.id })))
  const subDealerOptions = computed(() => subDealerList.value.map(u => ({ label: u.username, value: u.id })))

  // ── Visibility rules ──
  const role = targetRole

  const showAdminSelect = computed(() =>
    isSuperAdmin.value && ['AGENT', 'DEALER', 'SUB_DEALER', 'PLAYER'].includes(role.value)
  )

  const showAgentSelect = computed(() => {
    if (role.value !== 'DEALER') return false
    if (isSuperAdmin.value) return parentState.adminId != null
    if (currentRole.value === 'ADMIN') return true
    return false
  })

  const showDealerSelect = computed(() => {
    if (!['SUB_DEALER', 'PLAYER'].includes(role.value)) return false
    if (isSuperAdmin.value) return parentState.adminId != null
    if (['ADMIN', 'AGENT'].includes(currentRole.value)) return true
    return false
  })

  const showSubDealerSelect = computed(() => {
    if (role.value !== 'PLAYER') return false
    if (isSuperAdmin.value) return parentState.dealerId != null
    if (currentRole.value === 'DEALER') return true
    if (['ADMIN', 'AGENT'].includes(currentRole.value)) return parentState.dealerId != null
    return false
  })

  // ── Fetch helpers ──
  async function fetchUsers(fetchRole: Role, parentId?: number | null): Promise<SimpleUser[]> {
    try {
      const query: Record<string, any> = { role: fetchRole, limit: 200 }
      if (parentId != null) query.parentId = parentId
      const res = await $fetch<FetchResult>('/api/users', { query })
      return res.data
    } catch {
      return []
    }
  }

  async function fetchAdmins() { adminList.value = await fetchUsers('ADMIN') }
  async function fetchAgents(parentId?: number | null) { agentList.value = await fetchUsers('AGENT', parentId) }
  async function fetchDealers(parentId?: number | null) { dealerList.value = await fetchUsers('DEALER', parentId) }
  async function fetchSubDealers(parentId: number | null) {
    subDealerList.value = parentId != null ? await fetchUsers('SUB_DEALER', parentId) : []
  }

  // ── Cascade watchers ──
  const initializing = ref(false)

  watch(() => parentState.adminId, (val) => {
    if (initializing.value) return
    parentState.agentId = null
    parentState.dealerId = null
    parentState.subDealerId = null
    agentList.value = []
    dealerList.value = []
    subDealerList.value = []
    if (val != null) {
      if (role.value === 'DEALER') fetchAgents(val)
      if (['SUB_DEALER', 'PLAYER'].includes(role.value)) fetchDealers(val)
    }
  })

  watch(() => parentState.dealerId, (val) => {
    if (initializing.value) return
    parentState.subDealerId = null
    subDealerList.value = []
    if (val != null && role.value === 'PLAYER') fetchSubDealers(val)
  })

  // ── Resolve final parentId ──
  const resolvedParentId = computed<number | undefined>(() => {
    switch (role.value) {
      case 'AGENT': return parentState.adminId ?? undefined
      case 'DEALER': return parentState.agentId ?? parentState.adminId ?? undefined
      case 'SUB_DEALER': return parentState.dealerId ?? undefined
      case 'PLAYER': return parentState.subDealerId ?? undefined
      default: return undefined
    }
  })

  // ── Validation errors for required parent fields ──
  const parentErrors = computed(() => {
    const e: Record<string, string | undefined> = {}
    if (showAdminSelect.value && parentState.adminId == null) e.adminId = 'Required'
    if (showDealerSelect.value && parentState.dealerId == null) e.dealerId = 'Required'
    if (showSubDealerSelect.value && parentState.subDealerId == null) e.subDealerId = 'Required'
    return e
  })

  // ── Reset ──
  function resetParents() {
    parentState.adminId = null
    parentState.agentId = null
    parentState.dealerId = null
    parentState.subDealerId = null
    adminList.value = []
    agentList.value = []
    dealerList.value = []
    subDealerList.value = []
  }

  // ── Pre-fill from existing parent chain (for edit mode) ──
  async function resolveParentChain(parentId: number) {
    initializing.value = true
    try {
      const parent = await $fetch<{ id: number; username: string; role: string; parentId: number | null }>(`/api/users/${parentId}`)
      const pRole = parent.role.toUpperCase()

      if (pRole === 'ADMIN') {
        await fetchAdmins()
        parentState.adminId = parent.id
      } else if (pRole === 'AGENT') {
        await fetchAdmins()
        parentState.adminId = parent.parentId
        await fetchAgents(parentState.adminId)
        parentState.agentId = parent.id
      } else if (pRole === 'DEALER') {
        // Find admin ancestor
        let adminId: number | null = null
        if (parent.parentId) {
          const dealerParent = await $fetch<{ id: number; role: string; parentId: number | null }>(`/api/users/${parent.parentId}`)
          adminId = dealerParent.role.toUpperCase() === 'AGENT' ? dealerParent.parentId : dealerParent.id
        }
        await fetchAdmins()
        parentState.adminId = adminId
        await fetchDealers(adminId)
        parentState.dealerId = parent.id
      } else if (pRole === 'SUB_DEALER') {
        // SubDealer -> Dealer -> Agent/Admin -> Admin
        const subDealer = parent
        let dealerId: number | null = null
        let adminId: number | null = null
        if (subDealer.parentId) {
          const dealer = await $fetch<{ id: number; role: string; parentId: number | null }>(`/api/users/${subDealer.parentId}`)
          dealerId = dealer.id
          if (dealer.parentId) {
            const dealerParent = await $fetch<{ id: number; role: string; parentId: number | null }>(`/api/users/${dealer.parentId}`)
            adminId = dealerParent.role.toUpperCase() === 'AGENT' ? dealerParent.parentId : dealerParent.id
          }
        }
        await fetchAdmins()
        parentState.adminId = adminId
        await fetchDealers(adminId)
        parentState.dealerId = dealerId
        await fetchSubDealers(dealerId)
        parentState.subDealerId = subDealer.id
      }
    } catch {
      // Silent — dropdowns stay empty
    } finally {
      initializing.value = false
    }
  }

  // ── Init on open ──
  async function initForCreate() {
    resetParents()
    if (isSuperAdmin.value && showAdminSelect.value) {
      await fetchAdmins()
    } else if (!isSuperAdmin.value) {
      const fetches: Promise<void>[] = []
      if (showAgentSelect.value) fetches.push(fetchAgents())
      if (showDealerSelect.value) fetches.push(fetchDealers())
      const userId = auth.user?.id
      if (currentRole.value === 'DEALER' && role.value === 'PLAYER' && userId) {
        fetches.push(fetchSubDealers(userId))
      }
      await Promise.all(fetches)
    }
  }

  async function initForEdit(parentId: number | null) {
    resetParents()
    if (parentId) {
      await resolveParentChain(parentId)
    }
  }

  return {
    parentState,
    adminOptions,
    agentOptions,
    dealerOptions,
    subDealerOptions,
    showAdminSelect,
    showAgentSelect,
    showDealerSelect,
    showSubDealerSelect,
    resolvedParentId,
    parentErrors,
    resetParents,
    initForCreate,
    initForEdit
  }
}
