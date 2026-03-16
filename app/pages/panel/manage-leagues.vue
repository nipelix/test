<template>
  <div class="space-y-4">
    <UCard>
      <template #header>
        <h1 class="text-xl font-bold">{{ t('dashboard.manage_leagues') }}</h1>
      </template>
      <div class="space-y-4">
        <AdminEntityToolbar
          :search="searchQuery" :search-placeholder="t('leagues.search')" :add-label="t('leagues.add_league')"
          :selected-count="selectedRows.length" show-add show-delete
          @create="openCreate" @edit="openEdit" @refresh="handleRefresh"
          @activate="handleActivate" @deactivate="handleDeactivate" @delete="handleBulkDelete"
          @update:search="searchQuery = $event"
        >
          <template #extra-actions>
            <UButton icon="i-lucide-link" variant="outline" color="neutral" size="sm" :disabled="selectedRows.length !== 1" @click="openMapping">{{ t('mappings.provider_mappings') }}</UButton>
          </template>
        </AdminEntityToolbar>
        <AdminUserTable :data="rows" :columns="filteredColumns" :loading="status === 'pending'" :selected-ids="selectedIds"
          :all-selected="allSelected" :some-selected="someSelected" :selected-count="selectedRows.length"
          :total="total" :current-page="currentPage" :total-pages="totalPages" :page-size="pageSize"
          @toggle-row="toggleRow" @toggle-all="toggleAll" @update:current-page="currentPage = $event" @update:page-size="pageSize = $event"
        />
      </div>
    </UCard>

    <!-- League Form Slideover -->
    <USlideover v-model:open="formOpen" :title="editItem ? t('leagues.edit_league') : t('leagues.add_league')">
      <template #body>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <UFormField :label="t('common.name')" required><UInput v-model="form.name" :placeholder="t('common.name')" class="w-full" /></UFormField>
          <UFormField :label="t('common.sport') + ' ID'" required><UInput v-model="form.sportId" type="number" class="w-full" /></UFormField>
          <UFormField :label="t('countries.country') + ' ID'" required><UInput v-model="form.countryId" type="number" class="w-full" /></UFormField>
          <UFormField :label="t('common.category')"><UInput v-model="form.category" :placeholder="t('common.category')" class="w-full" /></UFormField>
          <UFormField :label="t('common.type')"><UInput v-model="form.type" :placeholder="t('common.type')" class="w-full" /></UFormField>
          <UFormField label="MBS"><UInput v-model="form.mbs" type="number" class="w-full" /></UFormField>
          <UFormField :label="t('common.sort_order')"><UInput v-model="form.sortOrder" type="number" class="w-full" /></UFormField>
          <div class="flex items-center justify-between"><span class="text-sm font-medium">{{ t('leagues.popular') }}</span><USwitch v-model="form.popular" /></div>
          <div class="flex items-center justify-between"><span class="text-sm font-medium">{{ t('leagues.most_popular') }}</span><USwitch v-model="form.mostPopular" /></div>
          <div class="flex items-center justify-between"><span class="text-sm font-medium">{{ t('common.active') }}</span><USwitch v-model="form.active" /></div>

          <USeparator />
          <h3 class="text-sm font-semibold text-muted">{{ t('common.translations') }}</h3>
          <div v-for="lang in LANGS" :key="lang.code" class="space-y-2">
            <p class="text-xs font-medium text-muted flex items-center gap-2"><UBadge variant="subtle" size="xs">{{ lang.code }}</UBadge>{{ lang.name }}</p>
            <UFormField :label="`${t('common.name')} (${lang.code})`"><UInput v-model="tr[`${lang.code}:name`]" :placeholder="`${t('common.name')} — ${lang.name}`" class="w-full" /></UFormField>
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

    <AdminMappingSlideover v-model:open="mappingOpen" entity-type="LEAGUE" :entity-id="mappingEntityId" :entity-name="mappingEntityName" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN'] })
const { t } = useI18n()
const toast = useToast()
const { languages: LANGS } = useLanguages()

const columns = [
  { accessorKey: 'select', header: '' }, { accessorKey: 'id', header: t('common.id') },
  { accessorKey: 'name', header: t('common.name') }, { accessorKey: 'sportName', header: t('common.sport') },
  { accessorKey: 'countryName', header: t('countries.country') }, { accessorKey: 'category', header: t('common.category') },
  { accessorKey: 'popular', header: t('leagues.popular') }, { accessorKey: 'mbs', header: 'MBS' },
  { accessorKey: 'sortOrder', header: t('common.sort_order') }, { accessorKey: 'active', header: t('common.status') }
]

const { rows, total, totalPages, status, searchQuery, currentPage, pageSize, selectedIds, selectedRows, allSelected, someSelected, toggleAll, toggleRow, handleRefresh, filteredColumns, bulkPatch, bulkDelete } = useEntityList<any>('/api/leagues', 'manage-leagues', columns)

const formOpen = ref(false); const saving = ref(false); const editItem = ref<any>(null)
const form = reactive({ name: '', sportId: 0, countryId: 0, category: '', type: '', mbs: 1, sortOrder: 0, popular: false, mostPopular: false, active: true })
const tr = reactive<Record<string, string>>({})

function openCreate() {
  editItem.value = null
  Object.assign(form, { name: '', sportId: 0, countryId: 0, category: '', type: '', mbs: 1, sortOrder: 0, popular: false, mostPopular: false, active: true })
  Object.keys(tr).forEach(k => delete tr[k]); formOpen.value = true
}

async function openEdit() {
  if (selectedRows.value.length !== 1) return; const row = selectedRows.value[0]; editItem.value = row
  Object.assign(form, { name: row.name ?? '', sportId: row.sportId ?? 0, countryId: row.countryId ?? 0, category: row.category ?? '', type: row.type ?? '', mbs: row.mbs ?? 1, sortOrder: row.sortOrder ?? 0, popular: row.popular ?? false, mostPopular: row.mostPopular ?? false, active: row.active ?? true })
  Object.keys(tr).forEach(k => delete tr[k])
  try { const res = await $fetch<{ data: any[] }>('/api/translations', { query: { entityType: 'LEAGUE', entityId: row.id } }); for (const t of res.data ?? []) tr[`${t.lang}:${t.field}`] = t.value } catch {}
  formOpen.value = true
}

async function handleSubmit() {
  if (!form.name.trim() || !form.sportId || !form.countryId) { toast.add({ title: t('validation.required'), color: 'error' }); return }
  saving.value = true
  try {
    let id = editItem.value?.id
    if (id) { await $fetch(`/api/leagues/${id}`, { method: 'PATCH', body: { ...form } }) }
    else { const c = await $fetch<{ id: number }>('/api/leagues', { method: 'POST', body: { ...form } }); id = c.id }
    const trList = Object.entries(tr).filter(([, v]) => v?.trim()).map(([key, value]) => { const [lang, field] = key.split(':'); return { entityType: 'LEAGUE', entityId: id!, lang: lang!, field: field!, value: value.trim() } })
    if (trList.length > 0) await $fetch('/api/translations', { method: 'POST', body: { translations: trList } })
    toast.add({ title: t('modals.success_updated'), color: 'success' }); formOpen.value = false; handleRefresh()
  } catch (err: any) { toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'error' }) }
  finally { saving.value = false }
}

const mappingOpen = ref(false); const mappingEntityId = ref<number | null>(null); const mappingEntityName = ref('')
function openMapping() { if (selectedRows.value.length !== 1) return; mappingEntityId.value = selectedRows.value[0].id; mappingEntityName.value = selectedRows.value[0].name; mappingOpen.value = true }
async function handleActivate() { const { failed } = await bulkPatch({ active: true }); toast.add({ title: failed === 0 ? t('modals.success_updated') : t('common.error'), color: failed === 0 ? 'success' : 'warning' }) }
async function handleDeactivate() { const { failed } = await bulkPatch({ active: false }); toast.add({ title: failed === 0 ? t('modals.success_updated') : t('common.error'), color: failed === 0 ? 'success' : 'warning' }) }
async function handleBulkDelete() { const { failed } = await bulkDelete(); toast.add({ title: failed === 0 ? t('modals.success_deleted') : t('common.error'), color: failed === 0 ? 'success' : 'warning' }) }
</script>
