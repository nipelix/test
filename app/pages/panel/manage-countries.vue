<template>
  <AdminEntityManagementPage
    :title="t('dashboard.manage_countries')"
    endpoint="/api/countries"
    page-key="manage-countries"
    :columns="columns"
    :form-fields="formFields"
    :search-placeholder="t('countries.search')"
    :add-label="t('countries.add_country')"
    :edit-title="t('countries.edit_country')"
    mapping-entity-type="COUNTRY"
    translation-entity-type="COUNTRY"
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
  { accessorKey: 'code', header: t('countries.code') },
  { accessorKey: 'slug', header: 'Slug' },
  { accessorKey: 'flag', header: t('countries.flag') },
  { accessorKey: 'active', header: t('common.status') }
]

const formFields = computed(() => [
  { key: 'name', label: t('common.name'), type: 'text' as const, required: true },
  { key: 'code', label: t('countries.code'), type: 'text' as const, required: true },
  { key: 'slug', label: 'Slug', type: 'text' as const },
  { key: 'flag', label: t('countries.flag'), type: 'text' as const },
  { key: 'active', label: t('common.active'), type: 'boolean' as const }
])
</script>
