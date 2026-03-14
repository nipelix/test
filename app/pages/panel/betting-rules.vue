<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('dashboard.betting_rules') }}</h1>

    <UTabs :items="mainTabs" class="w-full">
      <template #content="{ item }">
        <!-- System Rules -->
        <div v-if="item.value === 'system'" class="mt-4 space-y-4">
          <UTabs :items="systemSubTabs" class="w-full">
            <template #content="{ item: subItem }">
              <div class="mt-4">
                <AdminBettingRulesLimitsForm
                  v-if="subItem.value === 'limits'"
                  :state="limits"
                  @update="updateField('limits', $event)"
                />
                <AdminBettingRulesOddsForm
                  v-if="subItem.value === 'odds'"
                  :state="odds"
                  @update="updateField('odds', $event)"
                />
                <AdminBettingRulesFeaturesForm
                  v-if="subItem.value === 'features'"
                  :state="features"
                  @update="updateField('features', $event)"
                />
              </div>
            </template>
          </UTabs>

          <div class="flex justify-end">
            <UButton color="primary" :loading="saving" @click="handleSave">
              {{ t('common.save') }}
            </UButton>
          </div>
        </div>

        <!-- Dealer Rules -->
        <div v-if="item.value === 'dealer'" class="mt-4">
          <UCard>
            <p class="text-muted text-sm">{{ t('rules.dealer_rules_description') }}</p>
            <div class="mt-4">
              <UButton color="primary" :to="localePath('/panel/dealer-betting-rules')">
                {{ t('rules.manage_dealer_rules') }}
              </UButton>
            </div>
          </UCard>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()
const saving = ref(false)

const mainTabs = [
  { label: t('rules.system_rules'), value: 'system' },
  { label: t('rules.dealer_rules'), value: 'dealer' }
]

const systemSubTabs = [
  { label: t('rules.limits'), value: 'limits' },
  { label: t('rules.odds'), value: 'odds' },
  { label: t('rules.features'), value: 'features' }
]

// ── Form State ──
const limits = reactive({
  minStake: 0,
  maxBetAmount: 0,
  maxPotentialPayout: 0,
  minSelections: 0,
  maxSelections: 0,
  lineBulkOdds: 0,
  liveBulkOdds: 0,
  couponCancelMinutes: 15,
  liveDelaySeconds: 0
})

const odds = reactive({
  lineMinOdds: 0,
  lineMaxOdds: 0,
  liveMinOdds: 0,
  liveMaxOdds: 0
})

const features = reactive({
  liveBettingAllowed: false,
  lineBettingAllowed: false,
  combineLiveAndLine: false,
  systemBetsAllowed: false,
  combinationBoost: false,
  combinationInsurance: false,
  oddChangeAutoAccept: false,
  allowSameEvent: false,
  couponPreview: false
})

// ── Generic field updater ──
function updateField(section: 'limits' | 'odds' | 'features', field: string, value: any) {
  const target = section === 'limits' ? limits : section === 'odds' ? odds : features
  ;(target as any)[field] = value
}

// ── Load settings ──
const { data: settingsData } = await useAsyncData('betting-rules-settings', () =>
  $fetch<Record<string, any>>('/api/settings')
)

watch(settingsData, (val) => {
  if (!val) return
  const l = val.betting_limits ?? {}
  const o = val.odds_limits ?? {}
  const f = val.features ?? {}

  Object.assign(limits, {
    minStake: l.minStake ?? 0,
    maxBetAmount: l.maxBetAmount ?? 0,
    maxPotentialPayout: l.maxPotentialPayout ?? 0,
    minSelections: l.minSelections ?? 0,
    maxSelections: l.maxSelections ?? 0,
    lineBulkOdds: l.lineBulkOdds ?? 0,
    liveBulkOdds: l.liveBulkOdds ?? 0,
    couponCancelMinutes: l.couponCancelMinutes ?? 15,
    liveDelaySeconds: l.liveDelaySeconds ?? 0
  })

  Object.assign(odds, {
    lineMinOdds: o.normalMinOdds ?? 0,
    lineMaxOdds: o.normalMaxOdds ?? 0,
    liveMinOdds: o.liveMinOdds ?? 0,
    liveMaxOdds: o.liveMaxOdds ?? 0
  })

  Object.assign(features, {
    liveBettingAllowed: f.liveBettingAllowed ?? false,
    lineBettingAllowed: f.lineBettingAllowed ?? false,
    combineLiveAndLine: f.combineLiveAndLine ?? false,
    systemBetsAllowed: f.systemBetsAllowed ?? false,
    combinationBoost: f.combinationBoost ?? false,
    combinationInsurance: f.combinationInsurance ?? false,
    oddChangeAutoAccept: f.oddChangeAutoAccept ?? false,
    allowSameEvent: f.allowSameEvent ?? false,
    couponPreview: f.couponPreview ?? false
  })
}, { immediate: true })

// ── Save ──
async function handleSave() {
  saving.value = true
  try {
    await Promise.all([
      $fetch('/api/settings/GLOBAL/system/betting_limits', {
        method: 'PUT',
        body: { value: { ...limits } }
      }),
      $fetch('/api/settings/GLOBAL/system/odds_limits', {
        method: 'PUT',
        body: {
          value: {
            normalMinOdds: odds.lineMinOdds,
            normalMaxOdds: odds.lineMaxOdds,
            liveMinOdds: odds.liveMinOdds,
            liveMaxOdds: odds.liveMaxOdds
          }
        }
      }),
      $fetch('/api/settings/GLOBAL/system/features', {
        method: 'PUT',
        body: { value: { ...features } }
      })
    ])
    toast.add({ title: t('common.saved'), color: 'success' })
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>
