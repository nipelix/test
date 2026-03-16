<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">{{ t('dashboard.manage_sports') }}</h1>
      </template>

      <div class="space-y-4">
        <AdminEntityToolbar
          :search="searchQuery"
          :search-placeholder="t('sports.search')"
          :add-label="t('sports.add_sport')"
          :selected-count="selectedRows.length"
          show-add
          show-delete
          @create="openCreate"
          @edit="openEdit"
          @refresh="handleRefresh"
          @activate="handleActivate"
          @deactivate="handleDeactivate"
          @delete="handleBulkDelete"
          @update:search="searchQuery = $event"
        >
          <template #extra-actions>
            <UButton icon="i-lucide-link" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length !== 1" @click="openMapping">
              {{ t('mappings.provider_mappings') }}
            </UButton>
          </template>
        </AdminEntityToolbar>

        <AdminUserTable
          :data="rows"
          :columns="filteredColumns"
          :loading="status === 'pending'"
          :selected-ids="selectedIds"
          :all-selected="allSelected"
          :some-selected="someSelected"
          :selected-count="selectedRows.length"
          :total="total"
          :current-page="currentPage"
          :total-pages="totalPages"
          :page-size="pageSize"
          @toggle-row="toggleRow"
          @toggle-all="toggleAll"
          @update:current-page="currentPage = $event"
          @update:page-size="pageSize = $event"
        />
      </div>
    </UCard>

    <!-- Sport Form Slideover -->
    <USlideover v-model:open="formOpen" :title="editItem ? t('sports.edit_sport') : t('sports.add_sport')">
      <template #body>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <UFormField :label="t('common.name')" required>
            <UInput v-model="form.name" :placeholder="t('common.name')" class="w-full" />
          </UFormField>
          <UFormField label="Slug" required>
            <UInput v-model="form.slug" placeholder="Slug" class="w-full" />
          </UFormField>
          <UFormField :label="t('common.icon')">
            <UInput v-model="form.icon" :placeholder="t('common.icon')" class="w-full" />
          </UFormField>
          <UFormField :label="t('common.category')">
            <UInput v-model="form.category" :placeholder="t('common.category')" class="w-full" />
          </UFormField>
          <UFormField label="Banner URL">
            <UInput v-model="form.banner" placeholder="Banner URL" class="w-full" />
          </UFormField>
          <UFormField :label="t('common.sort_order')">
            <UInput v-model="form.sortOrder" type="number" class="w-full" />
          </UFormField>
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">{{ t('common.active') }}</span>
            <USwitch v-model="form.active" />
          </div>

          <!-- Translations -->
          <USeparator />
          <h3 class="text-sm font-semibold text-muted">{{ t('common.translations') }}</h3>
          <div v-for="locale in allLocales" :key="locale.code" class="space-y-2">
            <p class="text-xs font-medium text-muted flex items-center gap-2">
              <UBadge variant="subtle" size="xs">{{ locale.code }}</UBadge>
              {{ locale.name }}
            </p>
            <UFormField :label="`${t('common.name')} (${locale.code})`">
              <UInput v-model="translations[`${locale.code}:name`]" :placeholder="`${t('common.name')} — ${locale.name}`" class="w-full" />
            </UFormField>
          </div>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="outline" color="neutral" @click="formOpen = false">{{ t('common.cancel') }}</UButton>
          <UButton color="primary" :loading="saving" @click="handleSubmit">{{ t('common.save') }}</UButton>
        </div>
      </template>
    </USlideover>

    <!-- Mapping Slideover -->
    <AdminMappingSlideover v-model:open="mappingOpen" entity-type="SPORT" :entity-id="mappingEntityId" :entity-name="mappingEntityName" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN'] })

const { t, locales } = useI18n()
const toast = useToast()
const allLocales = computed(() => locales.value as Array<{ code: string; name?: string }>)

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'id', header: t('common.id') },
  { accessorKey: 'name', header: t('common.name') },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'icon', header: t('common.icon') },
  { accessorKey: 'category', header: t('common.category') },
  { accessorKey: 'sortOrder', header: t('common.sort_order') },
  { accessorKey: 'active', header: t('common.status') }
]

const {
  rows, total, totalPages, status, searchQuery, currentPage, pageSize,
  selectedIds, selectedRows, allSelected, someSelected, toggleAll, toggleRow,
  handleRefresh, filteredColumns, bulkPatch, bulkDelete
} = useEntityList<any>('/api/sports', 'manage-sports', columns)

// Form state
const formOpen = ref(false)
const saving = ref(false)
const editItem = ref<any>(null)
const form = reactive({ name: '', slug: '', icon: '', category: '', banner: '', sortOrder: 0, active: true })
const translations = reactive<Record<string, string>>({})

function openCreate() {
  editItem.value = null
  Object.assign(form, { name: '', slug: '', icon: '', category: '', banner: '', sortOrder: 0, active: true })
  Object.keys(translations).forEach(k => delete translations[k])
  formOpen.value = true
}

async function openEdit() {
  if (selectedRows.value.length !== 1) return
  const row = selectedRows.value[0]
  editItem.value = row
  Object.assign(form, { name: row.name ?? '', slug: row.slug ?? '', icon: row.icon ?? '', category: row.category ?? '', banner: row.banner ?? '', sortOrder: row.sortOrder ?? 0, active: row.active ?? true })
  Object.keys(translations).forEach(k => delete translations[k])
  // Load translations
  try {
    const res = await $fetch<{ data: any[] }>('/api/translations', { query: { entityType: 'SPORT', entityId: row.id } })
    for (const tr of res.data ?? []) translations[`${tr.lang}:${tr.field}`] = tr.value
  } catch { /* silent */ }
  formOpen.value = true
}

async function handleSubmit() {
  if (!form.name.trim()) { toast.add({ title: t('validation.required'), color: 'error' }); return }
  saving.value = true
  try {
    let entityId = editItem.value?.id
    if (entityId) {
      await $fetch(`/api/sports/${entityId}`, { method: 'PATCH', body: { ...form } })
    } else {
      const created = await $fetch<{ id: number }>('/api/sports', { method: 'POST', body: { ...form } })
      entityId = created.id
    }
    // Save translations
    const trList = Object.entries(translations).filter(([, v]) => v?.trim()).map(([key, value]) => {
      const [lang, field] = key.split(':')
      return { entityType: 'SPORT', entityId: entityId!, lang: lang!, field: field!, value: value.trim() }
    })
    if (trList.length > 0) await $fetch('/api/translations', { method: 'POST', body: { translations: trList } })

    toast.add({ title: t('modals.success_updated'), color: 'success' })
    formOpen.value = false
    handleRefresh()
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'error' })
  } finally { saving.value = false }
}

// Mapping
const mappingOpen = ref(false)
const mappingEntityId = ref<number | null>(null)
const mappingEntityName = ref('')

function openMapping() {
  if (selectedRows.value.length !== 1) return
  mappingEntityId.value = selectedRows.value[0].id
  mappingEntityName.value = selectedRows.value[0].name
  mappingOpen.value = true
}

// Bulk actions
async function handleActivate() { const { failed } = await bulkPatch({ active: true }); toast.add({ title: failed === 0 ? t('modals.success_updated') : t('common.error'), color: failed === 0 ? 'success' : 'warning' }) }
async function handleDeactivate() { const { failed } = await bulkPatch({ active: false }); toast.add({ title: failed === 0 ? t('modals.success_updated') : t('common.error'), color: failed === 0 ? 'success' : 'warning' }) }
async function handleBulkDelete() { const { failed } = await bulkDelete(); toast.add({ title: failed === 0 ? t('modals.success_deleted') : t('common.error'), color: failed === 0 ? 'success' : 'warning' }) }
</script>
