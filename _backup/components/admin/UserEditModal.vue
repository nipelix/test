<template>
  <UModal v-model:open="isOpen" :title="t('modals.edit_title')" :description="t('modals.edit_title')">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">{{ t('modals.edit_title') }}</h3>
            <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="isOpen = false" />
          </div>
        </template>

        <div class="space-y-4">
          <!-- Parent selection dropdowns -->
          <template v-if="showAdminSelect">
            <UFormField :label="t('modals.select_admin')" name="adminId" required :error="visibleErrors.adminId">
              <USelectMenu v-model="parentState.adminId" :items="adminOptions" value-key="value" :placeholder="t('modals.select_admin')" class="w-full" @update:model-value="touch('adminId')" />
            </UFormField>
          </template>

          <template v-if="showAgentSelect">
            <UFormField :label="`${t('modals.select_agent')} (${t('modals.optional')})`" name="agentId">
              <USelectMenu v-model="parentState.agentId" :items="agentOptions" value-key="value" :placeholder="t('modals.select_agent')" class="w-full" />
            </UFormField>
          </template>

          <template v-if="showMainDealerSelect">
            <UFormField :label="t('modals.select_main_dealer')" name="mainDealerId" required :error="visibleErrors.mainDealerId">
              <USelectMenu v-model="parentState.mainDealerId" :items="mainDealerOptions" value-key="value" :placeholder="t('modals.select_main_dealer')" class="w-full" @update:model-value="touch('mainDealerId')" />
            </UFormField>
          </template>

          <template v-if="showSubDealerSelect">
            <UFormField :label="t('modals.select_sub_dealer')" name="subDealerId" required :error="visibleErrors.subDealerId">
              <USelectMenu v-model="parentState.subDealerId" :items="subDealerOptions" value-key="value" :placeholder="t('modals.select_sub_dealer')" class="w-full" @update:model-value="touch('subDealerId')" />
            </UFormField>
          </template>

          <UFormField :label="t('common.username')" name="username" required :error="visibleErrors.username">
            <UInput v-model="formState.username" :placeholder="t('common.username')" class="w-full" :loading="checkingUsername" autocomplete="off" @blur="touch('username')" />
          </UFormField>

          <UFormField label="Email" name="email" required :error="visibleErrors.email">
            <UInput v-model="formState.email" type="email" placeholder="Email" class="w-full" :loading="checkingEmail" autocomplete="off" @blur="touch('email')" />
          </UFormField>

          <UFormField :label="t('common.status')" name="status">
            <USelectMenu v-model="formState.status" :items="statusOptions" value-key="value" class="w-full" />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" color="neutral" @click="isOpen = false">
              {{ t('common.cancel') }}
            </UButton>
            <UButton color="primary" :loading="loading" @click="handleSubmit">
              {{ t('common.save') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  user: { id: number, username: string, email: string, status: string, role?: string, parentId?: number | null } | null
}>()

const emit = defineEmits<{ success: [] }>()
const isOpen = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const toast = useToast()
const auth = useAuthStore()
const loading = ref(false)
const submitted = ref(false)
const touched = reactive<Record<string, boolean>>({})
const initializing = ref(false)

const currentRole = computed(() => auth.user?.role || '')
const isSuperAdmin = computed(() => currentRole.value === 'SUPER_ADMIN')
const userRole = computed(() => props.user?.role?.toUpperCase() || '')

const formState = reactive({
  username: '',
  email: '',
  status: 'ACTIVE'
})

const parentState = reactive({
  adminId: null as number | null,
  agentId: null as number | null,
  mainDealerId: null as number | null,
  subDealerId: null as number | null
})

// Which parent dropdowns to show based on current user role + target user role
const ROLE_HIERARCHY = ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER', 'SUB_DEALER', 'PLAYER']
const targetRoleIndex = computed(() => ROLE_HIERARCHY.indexOf(userRole.value))

const showAdminSelect = computed(() =>
  isSuperAdmin.value && targetRoleIndex.value >= 2
)

const showAgentSelect = computed(() => {
  if (userRole.value !== 'DEALER') return false
  if (isSuperAdmin.value) return parentState.adminId != null
  if (currentRole.value === 'ADMIN') return true
  return false
})

const showMainDealerSelect = computed(() => {
  if (!['SUB_DEALER', 'PLAYER'].includes(userRole.value)) return false
  if (isSuperAdmin.value) return parentState.adminId != null
  if (['ADMIN', 'AGENT'].includes(currentRole.value)) return true
  return false
})

const showSubDealerSelect = computed(() => {
  if (userRole.value !== 'PLAYER') return false
  if (isSuperAdmin.value) return parentState.mainDealerId != null
  if (['ADMIN', 'AGENT', 'DEALER'].includes(currentRole.value)) return parentState.mainDealerId != null
  return false
})

// Fetch lists for dropdowns
const adminList = ref<Array<{ id: number, username: string }>>([])
const agentList = ref<Array<{ id: number, username: string }>>([])
const mainDealerList = ref<Array<{ id: number, username: string }>>([])
const subDealerList = ref<Array<{ id: number, username: string }>>([])

// Computed options for USelectMenu
const adminOptions = computed(() => adminList.value.map(a => ({ label: a.username, value: a.id })))
const agentOptions = computed(() => agentList.value.map(a => ({ label: a.username, value: a.id })))
const mainDealerOptions = computed(() => mainDealerList.value.map(d => ({ label: d.username, value: d.id })))
const subDealerOptions = computed(() => subDealerList.value.map(sd => ({ label: sd.username, value: sd.id })))
const statusOptions = computed(() => [
  { label: t('common.active'), value: 'ACTIVE' },
  { label: t('common.inactive'), value: 'PASSIVE' }
])

async function fetchAdmins() {
  try {
    const res = await $fetch<{ data: Array<{ id: number, username: string }> }>('/api/users', { query: { role: 'ADMIN', limit: 100 } })
    adminList.value = res.data
  } catch { adminList.value = [] }
}

async function fetchAgents(parentId?: number | null) {
  try {
    const query: Record<string, any> = { role: 'AGENT', limit: 100 }
    if (parentId != null) query.parentId = parentId
    const res = await $fetch<{ data: Array<{ id: number, username: string }> }>('/api/users', { query })
    agentList.value = res.data
  } catch { agentList.value = [] }
}

async function fetchMainDealers(subtreeOf?: number | null) {
  try {
    const query: Record<string, any> = { role: 'DEALER', limit: 100 }
    if (subtreeOf != null) query.subtreeOf = subtreeOf
    const res = await $fetch<{ data: Array<{ id: number, username: string }> }>('/api/users', { query })
    mainDealerList.value = res.data
  } catch { mainDealerList.value = [] }
}

async function fetchSubDealers(mainDealerId: number | null) {
  if (mainDealerId == null) { subDealerList.value = []; return }
  try {
    const res = await $fetch<{ data: Array<{ id: number, username: string }> }>('/api/users', { query: { role: 'SUB_DEALER', parentId: mainDealerId, limit: 100 } })
    subDealerList.value = res.data
  } catch { subDealerList.value = [] }
}

// Cascade watchers (skip during initialization to avoid clearing pre-filled values)
watch(() => parentState.adminId, (val) => {
  if (initializing.value) return
  parentState.agentId = null
  parentState.mainDealerId = null
  parentState.subDealerId = null
  agentList.value = []
  mainDealerList.value = []
  subDealerList.value = []
  if (val != null) {
    if (userRole.value === 'DEALER') fetchAgents(val)
    if (['SUB_DEALER', 'PLAYER'].includes(userRole.value)) fetchMainDealers(val)
  }
})

watch(() => parentState.mainDealerId, (val) => {
  if (initializing.value) return
  parentState.subDealerId = null
  subDealerList.value = []
  if (val != null && userRole.value === 'PLAYER') fetchSubDealers(val)
})

// Compute final parentId
const resolvedParentId = computed(() => {
  switch (userRole.value) {
    case 'AGENT': return parentState.adminId ?? undefined
    case 'DEALER': return parentState.agentId ?? parentState.adminId ?? undefined
    case 'SUB_DEALER': return parentState.mainDealerId ?? undefined
    case 'PLAYER': return parentState.subDealerId ?? undefined
    default: return undefined
  }
})

// Async availability state
const checkingUsername = ref(false)
const checkingEmail = ref(false)
const usernameTaken = ref(false)
const emailTaken = ref(false)
let usernameTimer: ReturnType<typeof setTimeout> | null = null
let emailTimer: ReturnType<typeof setTimeout> | null = null

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateUsername(val: string): string | undefined {
  if (!val.trim()) return t('validation.required')
  if (val.trim().length < 3) return t('validation.min_length', { min: 3 })
  if (val.trim().length > 50) return t('validation.max_length', { max: 50 })
  if (usernameTaken.value) return t('validation.username_taken')
  return undefined
}

function validateEmail(val: string): string | undefined {
  if (!val.trim()) return t('validation.required')
  if (!emailRegex.test(val)) return t('validation.invalid_email')
  if (val.length > 255) return t('validation.max_length', { max: 255 })
  if (emailTaken.value) return t('validation.email_taken')
  return undefined
}

const errors = computed(() => {
  const e: Record<string, string | undefined> = {
    username: validateUsername(formState.username),
    email: validateEmail(formState.email)
  }

  if (showAdminSelect.value && parentState.adminId == null) e.adminId = t('validation.required')
  if (showMainDealerSelect.value && parentState.mainDealerId == null) e.mainDealerId = t('validation.required')
  if (showSubDealerSelect.value && parentState.subDealerId == null) e.subDealerId = t('validation.required')

  return e
})

const visibleErrors = computed(() => {
  const result: Record<string, string | undefined> = {}
  for (const key of Object.keys(errors.value)) {
    result[key] = (submitted.value || touched[key]) ? errors.value[key] : undefined
  }
  return result
})

const hasErrors = computed(() => {
  return Object.values(errors.value).some(e => !!e)
})

function touch(field: string) {
  touched[field] = true
}

// Debounced availability checks (excludeId to skip current user)
async function checkUsername(username: string) {
  if (!username.trim() || username.trim().length < 3 || !props.user) {
    usernameTaken.value = false
    return
  }
  if (username.trim() === props.user.username) {
    usernameTaken.value = false
    return
  }
  checkingUsername.value = true
  try {
    const res = await $fetch<{ usernameAvailable?: boolean }>('/api/users/check-availability', {
      query: { username: username.trim(), excludeId: props.user.id }
    })
    usernameTaken.value = res.usernameAvailable === false
  } catch {
    usernameTaken.value = false
  } finally {
    checkingUsername.value = false
  }
}

async function checkEmail(email: string) {
  if (!email.trim() || !emailRegex.test(email) || !props.user) {
    emailTaken.value = false
    return
  }
  if (email.trim() === props.user.email) {
    emailTaken.value = false
    return
  }
  checkingEmail.value = true
  try {
    const res = await $fetch<{ emailAvailable?: boolean }>('/api/users/check-availability', {
      query: { email: email.trim(), excludeId: props.user.id }
    })
    emailTaken.value = res.emailAvailable === false
  } catch {
    emailTaken.value = false
  } finally {
    checkingEmail.value = false
  }
}

watch(() => formState.username, (val) => {
  usernameTaken.value = false
  if (usernameTimer) clearTimeout(usernameTimer)
  usernameTimer = setTimeout(() => checkUsername(val), 500)
})

watch(() => formState.email, (val) => {
  emailTaken.value = false
  if (emailTimer) clearTimeout(emailTimer)
  emailTimer = setTimeout(() => checkEmail(val), 500)
})

async function handleSubmit() {
  submitted.value = true
  if (!props.user || hasErrors.value) return

  loading.value = true
  try {
    const body: Record<string, any> = {
      username: formState.username,
      email: formState.email,
      status: formState.status
    }

    if (resolvedParentId.value) {
      body.parentId = resolvedParentId.value
    }

    await $fetch(`/api/users/${props.user.id}`, {
      method: 'PATCH',
      body
    })
    toast.add({ title: t('modals.success_updated'), color: 'success' })
    isOpen.value = false
    emit('success')
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage ?? 'Failed', color: 'error' })
  } finally {
    loading.value = false
  }
}

// Resolve parent chain from parentId when modal opens
async function resolveParentChain(user: NonNullable<typeof props.user>) {
  if (!user.parentId) return

  const role = user.role?.toUpperCase() || ''
  if (role === 'ADMIN') return

  initializing.value = true
  try {
    // Fetch the direct parent to start resolving
    const parent = await $fetch<{ id: number, username: string, role: string, parentId: number | null }>(`/api/users/${user.parentId}`)

    if (role === 'AGENT') {
      // Parent is ADMIN
      await fetchAdmins()
      parentState.adminId = parent.id
    } else if (role === 'DEALER') {
      await fetchAdmins()
      if (parent.role === 'AGENT') {
        // Parent is agent, grandparent is admin
        parentState.adminId = parent.parentId ?? null
        await fetchAgents(parentState.adminId)
        parentState.agentId = parent.id
      } else {
        // Parent is admin directly
        parentState.adminId = parent.id
        await fetchAgents(parentState.adminId)
      }
    } else if (role === 'SUB_DEALER') {
      // Parent is DEALER, need to find which admin
      const dealer = parent
      // Find admin ancestor: go up from dealer
      let adminId: number | null = null
      if (dealer.parentId) {
        const dealerParent = await $fetch<{ id: number, role: string, parentId: number | null }>(`/api/users/${dealer.parentId}`)
        if (dealerParent.role === 'AGENT' && dealerParent.parentId) {
          adminId = dealerParent.parentId
        } else if (dealerParent.role === 'ADMIN') {
          adminId = dealerParent.id
        }
      }
      await fetchAdmins()
      parentState.adminId = adminId
      await fetchMainDealers(adminId)
      parentState.mainDealerId = dealer.id
    } else if (role === 'PLAYER') {
      // Parent is SUB_DEALER
      const subDealer = parent
      // Go up: subDealer -> dealer -> agent/admin -> admin
      let dealerId: number | null = null
      let adminId: number | null = null
      if (subDealer.parentId) {
        const dealer = await $fetch<{ id: number, role: string, parentId: number | null }>(`/api/users/${subDealer.parentId}`)
        dealerId = dealer.id
        if (dealer.parentId) {
          const dealerParent = await $fetch<{ id: number, role: string, parentId: number | null }>(`/api/users/${dealer.parentId}`)
          if (dealerParent.role === 'AGENT' && dealerParent.parentId) {
            adminId = dealerParent.parentId
          } else if (dealerParent.role === 'ADMIN') {
            adminId = dealerParent.id
          }
        }
      }
      await fetchAdmins()
      parentState.adminId = adminId
      await fetchMainDealers(adminId)
      parentState.mainDealerId = dealerId
      await fetchSubDealers(dealerId)
      parentState.subDealerId = subDealer.id
    }
  } catch {
    // Silent — dropdowns will just be empty
  } finally {
    initializing.value = false
  }
}

watch(isOpen, async (val) => {
  if (val && props.user) {
    formState.username = props.user.username
    formState.email = props.user.email
    formState.status = props.user.status?.toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'PASSIVE'
    submitted.value = false
    usernameTaken.value = false
    emailTaken.value = false
    parentState.adminId = null
    parentState.agentId = null
    parentState.mainDealerId = null
    parentState.subDealerId = null
    Object.keys(touched).forEach(k => delete touched[k])

    // Wait for next tick to ensure auth store is hydrated
    await nextTick()
    // Resolve parent chain for pre-filling dropdowns
    await resolveParentChain(props.user)
  }
})
</script>
