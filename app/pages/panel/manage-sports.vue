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
    translation-entity-type="SPORT"
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
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'icon', header: t('common.icon') },
  { accessorKey: 'category', header: t('common.category') },
  { accessorKey: 'sortOrder', header: t('common.sort_order') },
  { accessorKey: 'active', header: t('common.status') }
]

const formFields = computed(() => [
  { key: 'name', label: t('common.name'), type: 'text' as const, required: true },
  { key: 'slug', label: 'Slug', type: 'text' as const, required: true },
  { key: 'icon', label: t('common.icon'), type: 'text' as const },
  { key: 'category', label: t('common.category'), type: 'text' as const },
  { key: 'banner', label: 'Banner URL', type: 'text' as const },
  { key: 'sortOrder', label: t('common.sort_order'), type: 'number' as const },
  { key: 'active', label: t('common.active'), type: 'boolean' as const }
])
</script>
