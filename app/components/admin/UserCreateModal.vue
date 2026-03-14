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
          <!-- Parent Selection -->
          <AdminParentSelectionFields
            :show-admin="showAdminSelect"
            :show-agent="showAgentSelect"
            :show-dealer="showDealerSelect"
            :show-sub-dealer="showSubDealerSelect"
            :admin-options="adminOptions"
            :agent-options="agentOptions"
            :dealer-options="dealerOptions"
            :sub-dealer-options="subDealerOptions"
            :parent-state="parentState"
            :visible-errors="visibleErrors"
            @touch="touch"
          />

          <UFormField :label="t('common.username')" name="username" required :error="visibleErrors.username">
            <UInput v-model="form.username" :placeholder="t('common.username')" class="w-full" :loading="checkingUsername" autocomplete="off" @blur="touch('username')" />
          </UFormField>

          <UFormField label="Email" name="email" required :error="visibleErrors.email">
            <UInput v-model="form.email" type="email" placeholder="Email" class="w-full" autocomplete="off" @blur="touch('email')" />
          </UFormField>

          <UFormField :label="t('common.password')" name="password" required :error="visibleErrors.password">
            <UInput v-model="form.password" type="password" :placeholder="t('common.password')" class="w-full" autocomplete="new-password" @blur="touch('password')" />
          </UFormField>

          <UFormField :label="t('common.confirm_password')" name="confirmPassword" required :error="visibleErrors.confirmPassword">
            <UInput v-model="form.confirmPassword" type="password" :placeholder="t('common.confirm_password')" class="w-full" autocomplete="new-password" @blur="touch('confirmPassword')" />
          </UFormField>

          <UFormField v-if="showBalance" :label="t('modals.initial_balance')" name="initialBalance">
            <UInput v-model="form.initialBalance" type="number" :placeholder="t('modals.initial_balance')" class="w-full" autocomplete="off" />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" color="neutral" @click="isOpen = false">{{ t('common.cancel') }}</UButton>
            <UButton color="primary" :loading="loading" @click="handleSubmit">{{ t('common.submit') }}</UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ROLE_WALLET_TYPE } from '~~/shared/types/roles'
import type { Role } from '~~/shared/types/roles'
import { EMAIL_REGEX } from '~~/shared/utils/validation'

const props = defineProps<{
  role: Role
}>()

const emit = defineEmits<{ success: [] }>()
const isOpen = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const toast = useToast()
const loading = ref(false)

const targetRole = computed(() => props.role)

// ── Parent selection ──
const {
  parentState, adminOptions, agentOptions, dealerOptions, subDealerOptions,
  showAdminSelect, showAgentSelect, showDealerSelect, showSubDealerSelect,
  resolvedParentId, parentErrors, initForCreate
} = useParentSelection(targetRole)

// ── Form ──
const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  initialBalance: 0
})

const showBalance = computed(() => ['DEALER', 'SUB_DEALER', 'PLAYER'].includes(props.role))
const walletType = computed(() => ROLE_WALLET_TYPE[props.role])

// ── Availability check ──
const checkingUsername = ref(false)
const usernameTaken = ref(false)
let usernameTimer: ReturnType<typeof setTimeout> | null = null

watch(() => form.username, (val) => {
  usernameTaken.value = false
  if (usernameTimer) clearTimeout(usernameTimer)
  if (val.trim().length >= 3) {
    usernameTimer = setTimeout(async () => {
      checkingUsername.value = true
      try {
        const res = await $fetch<{ usernameAvailable?: boolean }>('/api/users/check-availability', {
          query: { username: val.trim() }
        })
        usernameTaken.value = res.usernameAvailable === false
      } catch { /* ignore */ } finally {
        checkingUsername.value = false
      }
    }, 500)
  }
})

onBeforeUnmount(() => {
  if (usernameTimer) clearTimeout(usernameTimer)
})

// ── Validation ──
const { visibleErrors, hasErrors, touch, reset: resetValidation, submit: validateForm } = useFormValidation(() => ({
  username: !form.username.trim() ? t('validation.required')
    : form.username.trim().length < 3 ? t('validation.min_length', { min: 3 })
    : usernameTaken.value ? t('validation.username_taken')
    : undefined,
  email: !form.email.trim() ? t('validation.required')
    : !EMAIL_REGEX.test(form.email) ? t('validation.invalid_email')
    : undefined,
  password: !form.password ? t('validation.required')
    : form.password.length < 4 ? t('validation.min_length', { min: 4 })
    : undefined,
  confirmPassword: !form.confirmPassword ? t('validation.required')
    : form.password !== form.confirmPassword ? t('modals.error_passwords_mismatch')
    : undefined,
  ...parentErrors.value
}))

const modalTitle = computed(() => {
  const titles: Record<string, string> = {
    ADMIN: t('admins.add_admin'),
    AGENT: t('agents.add_agent'),
    DEALER: t('dealers.add_dealer'),
    SUB_DEALER: t('dealers.add_sub_dealer'),
    PLAYER: t('players.add_user')
  }
  return titles[props.role] || t('common.add')
})

// ── Submit ──
async function handleSubmit() {
  if (!validateForm()) return

  loading.value = true
  try {
    const body: Record<string, any> = {
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      role: props.role,
      walletType: walletType.value
    }
    if (resolvedParentId.value) body.parentId = resolvedParentId.value

    const user = await $fetch<{ id: number }>('/api/users', { method: 'POST', body })

    if (showBalance.value && form.initialBalance > 0) {
      await $fetch(`/api/wallets/${user.id}/deposit`, {
        method: 'POST',
        body: { amount: form.initialBalance }
      })
    }

    toast.add({ title: t('modals.success_created'), color: 'success' })
    isOpen.value = false
    emit('success')
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage ?? 'Failed', color: 'error' })
  } finally {
    loading.value = false
  }
}

// ── Reset on open ──
watch(isOpen, async (val) => {
  if (val) {
    form.username = ''
    form.email = ''
    form.password = ''
    form.confirmPassword = ''
    form.initialBalance = 0
    usernameTaken.value = false
    resetValidation()
    await nextTick()
    await initForCreate()
  }
})
</script>
