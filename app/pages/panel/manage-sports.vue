<template>
  <AdminEntityManagementPage
    :title="t('dashboard.manage_sports')"
    endpoint="/api/sports"
    page-key="manage-sports"
    :columns="columns"
    :form-fields="formFields"
    :search-placeholder="t('sports.search')"
    :add-label="t('sports.add_sport')"
    :edit-title="t('sports.edit_sport')"
    mapping-entity-type="SPORT"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN'] })
const { t } = useI18n()

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'id', header: t('common.id') },
  { accessorKey: 'name', header: t('common.name') },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'active', header: t('common.status') }
]

const formFields = computed(() => [
  { key: 'name', label: t('common.name'), type: 'text' as const, required: true },
  { key: 'slug', label: 'Slug', type: 'text' as const, required: true }
])
</script>
