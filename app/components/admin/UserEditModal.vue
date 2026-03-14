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
            <UInput v-model="form.username" :placeholder="t('common.username')" class="w-full" autocomplete="off" @blur="touch('username')" />
          </UFormField>

          <UFormField label="Email" name="email" required :error="visibleErrors.email">
            <UInput v-model="form.email" type="email" placeholder="Email" class="w-full" autocomplete="off" @blur="touch('email')" />
          </UFormField>

          <UFormField :label="t('common.status')" name="status">
            <USelectMenu v-model="form.status" :items="statusOptions" value-key="value" class="w-full" />
          </UFormField>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton variant="outline" color="neutral" @click="isOpen = false">{{ t('common.cancel') }}</UButton>
            <UButton color="primary" :loading="loading" @click="handleSubmit">{{ t('common.save') }}</UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { isRole } from '~~/shared/types/roles'
import type { Role } from '~~/shared/types/roles'

const props = defineProps<{
  user: { id: number; username: string; email: string; status: string; role?: string; parentId?: number | null } | null
}>()

const emit = defineEmits<{ success: [] }>()
const isOpen = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const toast = useToast()
const loading = ref(false)

const userRole = computed<Role>(() => {
  const r = props.user?.role?.toUpperCase()
  return (r && isRole(r)) ? r : 'PLAYER'
})

// ── Parent selection ──
const {
  parentState, adminOptions, agentOptions, dealerOptions, subDealerOptions,
  showAdminSelect, showAgentSelect, showDealerSelect, showSubDealerSelect,
  resolvedParentId, parentErrors, initForEdit
} = useParentSelection(userRole)

// ── Form ──
const form = reactive({
  username: '',
  email: '',
  status: 'ACTIVE'
})

const statusOptions = computed(() => [
  { label: t('common.active'), value: 'ACTIVE' },
  { label: t('common.inactive'), value: 'PASSIVE' }
])

// ── Validation ──
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const { visibleErrors, touch, reset: resetValidation, submit: validateForm } = useFormValidation(() => ({
  username: !form.username.trim() ? t('validation.required')
    : form.username.trim().length < 3 ? t('validation.min_length', { min: 3 })
    : undefined,
  email: !form.email.trim() ? t('validation.required')
    : !emailRegex.test(form.email) ? t('validation.invalid_email')
    : undefined,
  ...parentErrors.value
}))

// ── Submit ──
async function handleSubmit() {
  if (!props.user || !validateForm()) return

  loading.value = true
  try {
    const body: Record<string, any> = {
      username: form.username.trim(),
      email: form.email.trim(),
      status: form.status
    }
    if (resolvedParentId.value) body.parentId = resolvedParentId.value

    await $fetch(`/api/users/${props.user.id}`, { method: 'PATCH', body })
    toast.add({ title: t('modals.success_updated'), color: 'success' })
    isOpen.value = false
    emit('success')
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage ?? 'Failed', color: 'error' })
  } finally {
    loading.value = false
  }
}

// ── Populate on open ──
watch(isOpen, async (val) => {
  if (val && props.user) {
    form.username = props.user.username
    form.email = props.user.email
    form.status = props.user.status?.toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'PASSIVE'
    resetValidation()
    await nextTick()
    await initForEdit(props.user.parentId ?? null)
  }
})
</script>
