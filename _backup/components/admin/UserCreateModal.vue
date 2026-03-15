<template>
  <UModal v-model:open="isOpen" :title="modalTitle" :description="modalTitle">
    <template #content>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">{{ modalTitle }}</h3>
            <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" @click="isOpen = false" />
          </div>
        </template>

        <div class="space-y-4">
          <!-- Admin select: only SUPER_ADMIN sees this -->
          <template v-if="showAdminSelect">
            <UFormField :label="t('modals.select_admin')" name="adminId" required :error="visibleErrors.adminId">
              <USelectMenu v-model="parentState.adminId" :items="adminOptions" value-key="value" :placeholder="t('modals.select_admin')" class="w-full" @update:model-value="touch('adminId')" />
            </UFormField>
          </template>

          <!-- Agent select: optional for DEALER creation -->
          <template v-if="showAgentSelect">
            <UFormField :label="`${t('modals.select_agent')} (${t('modals.optional')})`" name="agentId">
              <USelectMenu v-model="parentState.agentId" :items="agentOptions" value-key="value" :placeholder="t('modals.select_agent')" class="w-full" />
            </UFormField>
          </template>

          <!-- Main Dealer select -->
          <template v-if="showMainDealerSelect">
            <UFormField :label="t('modals.select_main_dealer')" name="mainDealerId" required :error="visibleErrors.mainDealerId">
              <USelectMenu v-model="parentState.mainDealerId" :items="mainDealerOptions" value-key="value" :placeholder="t('modals.select_main_dealer')" class="w-full" @update:model-value="touch('mainDealerId')" />
            </UFormField>
          </template>

          <!-- Sub Dealer select -->
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

          <UFormField :label="t('common.password')" name="password" required :error="visibleErrors.password">
            <UInput v-model="formState.password" type="password" :placeholder="t('common.password')" class="w-full" autocomplete="new-password" @blur="touch('password')" />
          </UFormField>

          <UFormField :label="t('common.confirm_password')" name="confirmPassword" required :error="visibleErrors.confirmPassword">
            <UInput v-model="formState.confirmPassword" type="password" :placeholder="t('common.confirm_password')" class="w-full" autocomplete="new-password" @blur="touch('confirmPassword')" />
          </UFormField>

          <UFormField v-if="showInitialBalance" :label="t('modals.initial_balance')" name="initialBalance" :error="visibleErrors.initialBalance">
            <UInput v-model="formState.initialBalance" type="number" :placeholder="t('modals.initial_balance')" class="w-full" autocomplete="off" @blur="touch('initialBalance')" />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" color="neutral" @click="isOpen = false">
              {{ t('common.cancel') }}
            </UButton>
            <UButton color="primary" :loading="loading" @click="handleSubmit">
              {{ t('common.submit') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const ROLE_HIERARCHY = ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER', 'SUB_DEALER', 'PLAYER']

const props = defineProps<{
  role: 'ADMIN' | 'AGENT' | 'DEALER' | 'SUB_DEALER' | 'PLAYER'
}>()

const emit = defineEmits<{ success: [] }>()
const isOpen = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const toast = useToast()
const auth = useAuthStore()
const loading = ref(false)
const submitted = ref(false)
const touched = reactive<Record<string, boolean>>({})

const currentRole = computed(() => auth.user?.role || '')
const currentRoleIndex = computed(() => ROLE_HIERARCHY.indexOf(currentRole.value))
const targetRoleIndex = computed(() => ROLE_HIERARCHY.indexOf(props.role))
const isSuperAdmin = computed(() => currentRole.value === 'SUPER_ADMIN')

const formState = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  initialBalance: 0
})

const parentState = reactive({
  adminId: null as number | null,
  agentId: null as number | null,
  mainDealerId: null as number | null,
  subDealerId: null as number | null
})

// ---- Which dropdowns to show ----
// Admin select: only SUPER_ADMIN, when target is AGENT or below
const showAdminSelect = computed(() =>
  isSuperAdmin.value && targetRoleIndex.value >= 2 // AGENT=2, DEALER=3, etc.
)

// Agent select: optional, only for DEALER creation
// SUPER_ADMIN: after admin selected; ADMIN: show own agents
const showAgentSelect = computed(() => {
  if (props.role !== 'DEALER') return false
  if (isSuperAdmin.value) return parentState.adminId != null
  if (currentRole.value === 'ADMIN') return true
  return false
})

// Main Dealer select: for SUB_DEALER/PLAYER creation
// SUPER_ADMIN: after admin selected; ADMIN: from own subtree; AGENT: from own subtree
const showMainDealerSelect = computed(() => {
  if (!['SUB_DEALER', 'PLAYER'].includes(props.role)) return false
  if (isSuperAdmin.value) return parentState.adminId != null
  if (['ADMIN', 'AGENT'].includes(currentRole.value)) return true
  return false
})

// Sub Dealer select: only for PLAYER creation
const showSubDealerSelect = computed(() => {
  if (props.role !== 'PLAYER') return false
  if (isSuperAdmin.value) return parentState.mainDealerId != null
  // DEALER: sub dealer dropdown shows immediately (no need to select main dealer - they ARE the main dealer)
  if (currentRole.value === 'DEALER') return true
  // ADMIN/AGENT: after main dealer selected
  if (['ADMIN', 'AGENT'].includes(currentRole.value)) return parentState.mainDealerId != null
  return false
})

// ---- Fetch lists ----
const adminList = ref<Array<{ id: number, username: string }>>([])
const agentList = ref<Array<{ id: number, username: string }>>([])
const mainDealerList = ref<Array<{ id: number, username: string }>>([])
const subDealerList = ref<Array<{ id: number, username: string }>>([])

const adminOptions = computed(() => adminList.value.map(a => ({ label: a.username, value: a.id })))
const agentOptions = computed(() => agentList.value.map(a => ({ label: a.username, value: a.id })))
const mainDealerOptions = computed(() => mainDealerList.value.map(d => ({ label: d.username, value: d.id })))
const subDealerOptions = computed(() => subDealerList.value.map(sd => ({ label: sd.username, value: sd.id })))

async function fetchAdmins() {
  try {
    const res = await $fetch<{ data: Array<{ id: number, username: string }> }>('/api/users', { query: { role: 'ADMIN', limit: 100 } })
    adminList.value = res.data
  } catch { adminList.value = [] }
}

// For non-SUPER_ADMIN, fetch agents from own subtree (API auto-filters by session user's descendants)
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

async function fetchSubDealers(parentId: number | null) {
  if (parentId == null) { subDealerList.value = []; return }
  try {
    const res = await $fetch<{ data: Array<{ id: number, username: string }> }>('/api/users', { query: { role: 'SUB_DEALER', parentId, limit: 100 } })
    subDealerList.value = res.data
  } catch { subDealerList.value = [] }
}

// ---- Cascade watchers ----
watch(() => parentState.adminId, (val) => {
  parentState.agentId = null
  parentState.mainDealerId = null
  parentState.subDealerId = null
  agentList.value = []
  mainDealerList.value = []
  subDealerList.value = []
  if (val != null) {
    if (props.role === 'DEALER') fetchAgents(val)
    if (['SUB_DEALER', 'PLAYER'].includes(props.role)) fetchMainDealers(val)
  }
})

watch(() => parentState.mainDealerId, (val) => {
  parentState.subDealerId = null
  subDealerList.value = []
  if (val != null && props.role === 'PLAYER') fetchSubDealers(val)
})

// ---- Compute final parentId ----
const resolvedParentId = computed(() => {
  // Immediate child role → no parentId needed, server auto-assigns to self
  const immediateChild = ({
    SUPER_ADMIN: 'ADMIN',
    ADMIN: 'AGENT',
    AGENT: 'DEALER',
    DEALER: 'SUB_DEALER',
    SUB_DEALER: 'PLAYER'
  } as Record<string, string>)[currentRole.value]

  if (props.role === immediateChild) return undefined

  // For deeper roles, resolve from the deepest selected dropdown
  // Then fall back up the chain, ultimately to current user's own ID
  const myId = auth.user?.id

  switch (props.role) {
    case 'AGENT':
      return parentState.adminId ?? undefined
    case 'DEALER':
      // agentId (if selected) > adminId (SUPER_ADMIN) > self (non-SUPER_ADMIN)
      return parentState.agentId ?? parentState.adminId ?? (isSuperAdmin.value ? undefined : myId)
    case 'SUB_DEALER':
      // mainDealerId (required in dropdown)
      return parentState.mainDealerId ?? undefined
    case 'PLAYER':
      // subDealerId (required in dropdown)
      return parentState.subDealerId ?? undefined
    default:
      return undefined
  }
})

// ---- Validation ----
const checkingUsername = ref(false)
const checkingEmail = ref(false)
const usernameTaken = ref(false)
const emailTaken = ref(false)
let usernameTimer: ReturnType<typeof setTimeout> | null = null
let emailTimer: ReturnType<typeof setTimeout> | null = null

const modalTitle = computed(() => {
  switch (props.role) {
    case 'ADMIN': return t('admins.add_admin')
    case 'AGENT': return t('agents.add_agent')
    case 'DEALER': return t('dealers.add_dealer')
    case 'SUB_DEALER': return t('dealers.add_sub_dealer')
    case 'PLAYER': return t('players.add_user')
    default: return t('common.add')
  }
})

const walletType = computed(() => {
  switch (props.role) {
    case 'DEALER': return 'CREDIT'
    case 'SUB_DEALER':
    case 'PLAYER': return 'MONEY'
    default: return 'NONE'
  }
})

const showInitialBalance = computed(() => {
  return ['DEALER', 'SUB_DEALER', 'PLAYER'].includes(props.role)
})

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

function validatePassword(val: string): string | undefined {
  if (!val) return t('validation.required')
  if (val.length < 4) return t('validation.min_length', { min: 4 })
  return undefined
}

function validateConfirmPassword(val: string): string | undefined {
  if (!val) return t('validation.required')
  if (formState.password !== val) return t('modals.error_passwords_mismatch')
  return undefined
}

const errors = computed(() => {
  const e: Record<string, string | undefined> = {
    username: validateUsername(formState.username),
    email: validateEmail(formState.email),
    password: validatePassword(formState.password),
    confirmPassword: validateConfirmPassword(formState.confirmPassword),
    initialBalance: showInitialBalance.value && formState.initialBalance < 0 ? 'Min 0' : undefined
  }

  // Parent selection validation
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

// Debounced availability checks
async function checkUsername(username: string) {
  if (!username.trim() || username.trim().length < 3) {
    usernameTaken.value = false
    return
  }
  checkingUsername.value = true
  try {
    const res = await $fetch<{ usernameAvailable?: boolean }>('/api/users/check-availability', {
      query: { username: username.trim() }
    })
    usernameTaken.value = res.usernameAvailable === false
  } catch {
    usernameTaken.value = false
  } finally {
    checkingUsername.value = false
  }
}

async function checkEmail(email: string) {
  if (!email.trim() || !emailRegex.test(email)) {
    emailTaken.value = false
    return
  }
  checkingEmail.value = true
  try {
    const res = await $fetch<{ emailAvailable?: boolean }>('/api/users/check-availability', {
      query: { email: email.trim() }
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

function resetForm() {
  formState.username = ''
  formState.email = ''
  formState.password = ''
  formState.confirmPassword = ''
  formState.initialBalance = 0
  parentState.adminId = null
  parentState.agentId = null
  parentState.mainDealerId = null
  parentState.subDealerId = null
  adminList.value = []
  agentList.value = []
  mainDealerList.value = []
  subDealerList.value = []
  submitted.value = false
  usernameTaken.value = false
  emailTaken.value = false
  Object.keys(touched).forEach(k => delete touched[k])
}

async function handleSubmit() {
  submitted.value = true
  if (hasErrors.value) return

  loading.value = true
  try {
    const parentId = resolvedParentId.value
    const body: Record<string, any> = {
      username: formState.username,
      email: formState.email,
      password: formState.password,
      role: props.role,
      walletType: walletType.value
    }
    if (parentId != null) body.parentId = parentId

    const user = await $fetch<{ id: number }>('/api/users', {
      method: 'POST',
      body
    })

    if (showInitialBalance.value && formState.initialBalance > 0) {
      await $fetch(`/api/wallets/${user.id}/deposit`, {
        method: 'POST',
        body: { amount: formState.initialBalance }
      })
    }

    toast.add({ title: t('modals.success_created'), color: 'success' })
    resetForm()
    isOpen.value = false
    emit('success')
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage ?? 'Failed', color: 'error' })
  } finally {
    loading.value = false
  }
}

// ---- Modal open: fetch initial data ----
watch(isOpen, async (val) => {
  if (val) {
    resetForm()
    await nextTick()

    if (isSuperAdmin.value && showAdminSelect.value) {
      // SUPER_ADMIN: fetch admin list first
      fetchAdmins()
    } else if (!isSuperAdmin.value) {
      // Non-SUPER_ADMIN: fetch relevant lists from own subtree
      if (showAgentSelect.value) fetchAgents()
      if (showMainDealerSelect.value) fetchMainDealers()
      // DEALER creating PLAYER: fetch own sub-dealers directly
      if (currentRole.value === 'DEALER' && props.role === 'PLAYER') {
        fetchSubDealers(auth.user!.id)
      }
    }
  }
})
</script>
