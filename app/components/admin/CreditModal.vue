<template>
  <USlideover v-model:open="isOpen" :title="t('modals.credit_title')">
    <template #body>
      <div class="space-y-5">
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div>
            <h3 class="text-lg font-semibold">{{ t('modals.credit_title') }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ t('modals.credit_description') }}</p>
          </div>
          <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" @click="isOpen = false">
            <UIcon name="i-lucide-x" class="w-5 h-5" />
          </button>
        </div>

        <!-- Selected User List -->
        <div v-if="selectedUsers.length > 0" class="space-y-3">
          <div v-for="user in selectedUsers" :key="user.id" class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm" :style="{ backgroundColor: getAvatarColor(user.username) }">
                {{ user.username.charAt(0).toUpperCase() }}
              </div>
              <div>
                <div class="font-medium text-sm">{{ user.username }}</div>
                <div class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full" :class="user.status === 'active' ? 'bg-green-500' : 'bg-red-500'" />
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ user.status === 'active' ? t('common.active') : t('common.inactive') }}</span>
                </div>
              </div>
            </div>
            <span class="text-xl font-bold tabular-nums">{{ user.credit ?? 0 }}</span>
          </div>
        </div>
        <div v-else class="text-center py-4 text-sm text-gray-400">
          {{ t('modals.select_users_hint') }}
        </div>

        <USeparator />

        <!-- Form -->
        <div class="space-y-3">
          <!-- User selector -->
          <USelectMenu
            v-model="pickedIds"
            :items="userOptions"
            multiple
            value-key="value"
            :placeholder="label || t('common.users')"
            class="w-full"
          />

          <!-- Mode select -->
          <USelectMenu v-model="mode" :items="modeOptions" value-key="value" class="w-full" />

          <!-- Amount -->
          <UInput v-model="amount" type="number" :placeholder="t('common.amount')" class="w-full" autocomplete="off" />
        </div>

        <!-- Submit -->
        <UButton block color="success" size="lg" :loading="loading" :disabled="selectedUsers.length === 0 || !amount || amount <= 0" @click="handleSubmit">
          {{ t('common.confirm') }}
        </UButton>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
interface CreditUser {
  id: number
  username: string
  status?: string
  credit?: number
}

const props = defineProps<{
  allUsers: CreditUser[]
  preSelectedIds?: number[]
  label?: string
}>()

const emit = defineEmits<{ success: [] }>()
const isOpen = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
const toast = useToast()
const loading = ref(false)
const mode = ref('add')
const amount = ref<number | null>(null)
const pickedIds = ref<number[]>([])

const modeOptions = computed(() => [
  { label: t('modals.credit_add'), value: 'add' },
  { label: t('modals.credit_remove'), value: 'remove' }
])

const userOptions = computed(() =>
  props.allUsers.map(u => ({ label: u.username, value: u.id }))
)

const selectedUsers = computed(() => {
  const idSet = new Set(pickedIds.value)
  return props.allUsers.filter(u => idSet.has(u.id))
})

const avatarColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

function getAvatarColor(username: string) {
  let hash = 0
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

async function handleSubmit() {
  if (!amount.value || amount.value <= 0 || selectedUsers.value.length === 0) return

  loading.value = true
  try {
    const endpoint = mode.value === 'add' ? 'credit' : 'credit-withdraw'
    const results = await Promise.allSettled(
      selectedUsers.value.map(user =>
        $fetch(`/api/wallets/${user.id}/${endpoint}`, {
          method: 'POST',
          body: { amount: amount.value }
        })
      )
    )

    const failed = results.filter(r => r.status === 'rejected').length
    if (failed === 0) {
      toast.add({ title: t('modals.success_credit'), color: 'success' })
    } else {
      toast.add({ title: `${results.length - failed}/${results.length} ${t('modals.success_credit')}`, color: 'warning' })
    }

    isOpen.value = false
    emit('success')
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage ?? 'Failed', color: 'error' })
  } finally {
    loading.value = false
  }
}

watch(isOpen, (val) => {
  if (val) {
    mode.value = 'add'
    amount.value = null
    pickedIds.value = props.preSelectedIds?.length ? [...props.preSelectedIds] : []
  }
})
</script>
