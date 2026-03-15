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
  { accessorKey: 'active', header: t('common.status') }
]

const formFields = computed(() => [
  { key: 'name', label: t('common.name'), type: 'text' as const, required: true }
])
</script>
