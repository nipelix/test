<template>
  <div class="space-y-4">
    <h1 class="text-xl font-bold">{{ t('dashboard.admin_activity_logs') }}</h1>

    <UCard>
      <div class="space-y-4">
        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-3">
          <UInput v-model="searchQuery" icon="i-lucide-search" :placeholder="t('logs.search_actions')" class="max-w-xs" />
          <USelectMenu v-model="actionFilter" :items="actionOptions" :placeholder="t('logs.filter_action')" class="w-48" />
          <UButton icon="i-lucide-refresh-cw" variant="outline" size="sm" @click="handleRefresh">{{ t('common.refresh') }}</UButton>
        </div>

        <!-- Table -->
        <div class="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <UTable :data="rows" :columns="columns" :loading="status === 'pending'">
            <template #action-cell="{ row }">
              <UBadge :color="actionColor(row.original.action)" variant="subtle" size="sm">
                {{ row.original.action }}
              </UBadge>
            </template>
            <template #createdAt-cell="{ row }">
              {{ formatDate(row.original.createdAt) }}
            </template>
            <template #details-cell="{ row }">
              <span class="text-xs text-muted truncate max-w-[200px] block">
                {{ row.original.details ? JSON.stringify(row.original.details).slice(0, 80) : '-' }}
              </span>
            </template>
          </UTable>

          <!-- Pagination -->
          <div class="flex items-center justify-between px-3 py-2.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30">
            <span class="text-sm text-muted">{{ t('common.total') }}: {{ total }}</span>
            <div class="flex items-center gap-1">
              <UButton icon="i-lucide-chevron-left" variant="outline" color="neutral" size="xs" :disabled="currentPage === 1" @click="currentPage--" />
              <span class="text-sm mx-2">{{ currentPage }} / {{ totalPages }}</span>
              <UButton icon="i-lucide-chevron-right" variant="outline" color="neutral" size="xs" :disabled="currentPage === totalPages" @click="currentPage++" />
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~~/shared/utils/formatters'

definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN', 'ADMIN'] })

const { t } = useI18n()

const searchQuery = ref('')
const actionFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(50)

const actionOptions = ['LOGIN', 'LOGOUT', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'BALANCE_CHANGE', 'COUPON_CANCEL', 'SETTINGS_CHANGE', 'IMPERSONATE']

const queryParams = computed(() => ({
  page: currentPage.value,
  limit: pageSize.value,
  ...(searchQuery.value.trim() ? { search: searchQuery.value.trim() } : {}),
  ...(actionFilter.value ? { action: actionFilter.value } : {})
}))

const { data: response, refresh, status } = await useAsyncData(
  'admin-logs',
  () => $fetch<{ data: any[]; total: number }>('/api/admin/logs', { query: queryParams.value }),
  { watch: [queryParams] }
)

const rows = computed(() => response.value?.data ?? [])
const total = computed(() => response.value?.total ?? 0)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

const columns = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'username', header: t('common.user') },
  { accessorKey: 'action', header: t('logs.action') },
  { accessorKey: 'entityType', header: t('logs.entity_type') },
  { accessorKey: 'entityId', header: t('logs.entity_id') },
  { accessorKey: 'details', header: t('common.details') },
  { accessorKey: 'ipAddress', header: 'IP' },
  { accessorKey: 'createdAt', header: t('common.time') }
]

function actionColor(action: string): string {
  const colors: Record<string, string> = {
    LOGIN: 'info', LOGOUT: 'neutral', USER_CREATE: 'success', USER_UPDATE: 'warning',
    USER_DELETE: 'error', BALANCE_CHANGE: 'warning', COUPON_CANCEL: 'error',
    SETTINGS_CHANGE: 'info', IMPERSONATE: 'error'
  }
  return colors[action] || 'neutral'
}

function handleRefresh() { refresh() }
</script>
