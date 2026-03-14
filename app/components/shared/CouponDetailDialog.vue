<template>
  <UModal v-model:open="isOpen" :title="'Coupon #' + coupon?.betSlipNo">
    <template #content>
      <UCard v-if="coupon">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">{{ coupon.betSlipNo }}</h3>
            <UBadge :color="statusColor" variant="subtle">{{ coupon.status }}</UBadge>
          </div>
        </template>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div><span class="text-muted">{{ $t('dashboard.player') }}:</span> <strong>{{ coupon.player }}</strong></div>
            <div><span class="text-muted">{{ $t('dashboard.agent') }}:</span> <strong>{{ coupon.agent }}</strong></div>
            <div><span class="text-muted">{{ $t('dashboard.total_stake') }}:</span> <strong>{{ coupon.totalStake }} TL</strong></div>
            <div><span class="text-muted">{{ $t('dashboard.potential_payout') }}:</span> <strong>{{ coupon.potentialPayout }} TL</strong></div>
            <div><span class="text-muted">{{ $t('dashboard.total_odds') }}:</span> <strong>{{ coupon.totalOdds }}</strong></div>
            <div><span class="text-muted">{{ $t('common.type') }}:</span> <strong>{{ coupon.type }}</strong></div>
          </div>
          <USeparator />
          <div class="space-y-3">
            <h4 class="font-medium text-sm">Selections ({{ coupon.selections.length }})</h4>
            <div
              v-for="sel in coupon.selections"
              :key="sel.id"
              class="p-3 rounded-lg border border-default"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium">{{ sel.homeTeam }} vs {{ sel.awayTeam }}</span>
                <UBadge
                  :color="sel.status === 'won' ? 'success' : sel.status === 'lost' ? 'error' : 'neutral'"
                  variant="subtle"
                  size="xs"
                >
                  {{ sel.status }}
                </UBadge>
              </div>
              <div class="text-xs text-muted">{{ sel.leagueName }} &bull; {{ sel.marketName }}</div>
              <div class="flex items-center justify-between mt-1">
                <span class="text-sm">{{ sel.selectionName }}</span>
                <span class="text-sm font-semibold">{{ sel.odds }}</span>
              </div>
              <div v-if="sel.score" class="text-xs text-muted mt-1">Score: {{ sel.score }}</div>
            </div>
          </div>
        </div>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { Coupon } from '@mock/coupons'

const props = defineProps<{
  coupon: Coupon | null
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const statusColor = computed(() => {
  if (!props.coupon) return 'neutral' as const
  const map: Record<string, 'success' | 'error' | 'warning' | 'info' | 'neutral'> = {
    ongoing: 'info',
    winning: 'success',
    losing: 'error',
    won: 'success',
    lost: 'error',
    refunded: 'warning',
    cancelled: 'neutral',
    deleted: 'neutral'
  }
  return map[props.coupon.status] || 'neutral'
})
</script>
