<template>
  <AdminEntityManagementPage
    :title="t('dashboard.manage_leagues')"
    endpoint="/api/leagues"
    page-key="manage-leagues"
    :columns="columns"
    :form-fields="formFields"
    :search-placeholder="t('leagues.search')"
    :add-label="t('leagues.add_league')"
    :edit-title="t('leagues.edit_league')"
    mapping-entity-type="LEAGUE"
    translation-entity-type="LEAGUE"
    :translation-fields="['name']"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN'] })
const { t } = useI18n()

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'id', header: t('common.id') },
  { accessorKey: 'name', header: t('common.name') },
  { accessorKey: 'sportName', header: t('common.sport') },
  { accessorKey: 'countryName', header: t('countries.country') },
  { accessorKey: 'category', header: t('common.category') },
  { accessorKey: 'popular', header: t('leagues.popular') },
  { accessorKey: 'mbs', header: 'MBS' },
  { accessorKey: 'sortOrder', header: t('common.sort_order') },
  { accessorKey: 'active', header: t('common.status') }
]

const formFields = computed(() => [
  { key: 'name', label: t('common.name'), type: 'text' as const, required: true },
  { key: 'sportId', label: t('common.sport') + ' ID', type: 'number' as const, required: true },
  { key: 'countryId', label: t('countries.country') + ' ID', type: 'number' as const, required: true },
  { key: 'category', label: t('common.category'), type: 'text' as const },
  { key: 'type', label: t('common.type'), type: 'text' as const },
  { key: 'mbs', label: 'MBS', type: 'number' as const },
  { key: 'sortOrder', label: t('common.sort_order'), type: 'number' as const },
  { key: 'popular', label: t('leagues.popular'), type: 'boolean' as const },
  { key: 'mostPopular', label: t('leagues.most_popular'), type: 'boolean' as const },
  { key: 'active', label: t('common.active'), type: 'boolean' as const }
])
</script>
