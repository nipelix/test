<template>
  <AdminEntityManagementPage
    :title="t('dashboard.manage_betting_groups')"
    endpoint="/api/betting-groups"
    page-key="manage-betting-groups"
    :columns="columns"
    :form-fields="formFields"
    :search-placeholder="t('betting_groups.search')"
    :add-label="t('betting_groups.add_group')"
    :edit-title="t('betting_groups.edit_group')"
    mapping-entity-type="BETTING_GROUP"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN'] })
const { t } = useI18n()

const columns = [
  { accessorKey: 'select', header: '' },
  { accessorKey: 'id', header: t('common.id') },
  { accessorKey: 'name', header: t('common.name') },
  { accessorKey: 'active', header: t('common.status') }
]

const formFields = computed(() => [
  { key: 'name', label: t('common.name'), type: 'text' as const, required: true }
])
</script>
