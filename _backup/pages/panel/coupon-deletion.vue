<template>
  <div class="space-y-4">
    <h1 class="text-xl font-bold uppercase">{{ t('dashboard.coupon_deletion') }}</h1>

    <!-- Filter Section -->
    <div class="border border-gray-200 dark:border-gray-800 rounded-lg p-4 space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <USelectMenu
          :items="[{ label: 'All (Live + Pre-match)', value: 'all' }]"
          value-key="value"
          placeholder="All (Live + Pre-match)"
        >
          <template #leading>
            <UIcon name="i-lucide-arrow-up-down" class="w-4 h-4" />
          </template>
        </USelectMenu>
        <USelectMenu
          :items="[{ label: 'Dealer Selection', value: '' }]"
          value-key="value"
          placeholder="Dealer Selection"
        >
          <template #leading>
            <UIcon name="i-lucide-user" class="w-4 h-4" />
          </template>
        </USelectMenu>
        <USelectMenu
          :items="[{ label: 'Dealer Selection', value: '' }]"
          value-key="value"
          placeholder="Dealer Selection"
        >
          <template #leading>
            <UIcon name="i-lucide-users" class="w-4 h-4" />
          </template>
        </USelectMenu>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <USelectMenu
          :items="[{ label: 'Player Selection', value: '' }]"
          value-key="value"
          placeholder="Player Selection"
        >
          <template #leading>
            <UIcon name="i-lucide-user-round" class="w-4 h-4" />
          </template>
        </USelectMenu>
        <USelectMenu
          :items="[{ label: 'Coupon Name', value: '' }]"
          value-key="value"
          placeholder="Coupon Name"
        >
          <template #leading>
            <UIcon name="i-lucide-ticket" class="w-4 h-4" />
          </template>
        </USelectMenu>
        <USelectMenu
          :items="statusOptions"
          value-key="value"
          placeholder="Status"
        >
          <template #leading>
            <UIcon name="i-lucide-circle-dot" class="w-4 h-4" />
          </template>
        </USelectMenu>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <USelectMenu
          :items="[{ label: 'Date Range', value: '' }]"
          value-key="value"
          placeholder="Date Range"
        >
          <template #leading>
            <UIcon name="i-lucide-calendar" class="w-4 h-4" />
          </template>
        </USelectMenu>
        <UButton color="primary" size="lg" class="w-full">
          {{ t('common.search') }}
        </UButton>
        <UButton color="error" size="lg" variant="soft" class="w-full">
          Clear All Coupons
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel' })

const { t } = useI18n()

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Winning', value: 'winning' },
  { label: 'Losing', value: 'losing' },
  { label: 'Refunded', value: 'refunded' }
]
</script>
