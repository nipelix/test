<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('rules.dealer_rules') }}</h1>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Left Side: Sports List -->
      <div class="lg:col-span-1">
        <UCard>
          <template #header>
            <h3 class="text-sm font-semibold uppercase">{{ t('common.sports') }}</h3>
          </template>
          <div class="space-y-2">
            <div
              v-for="sport in sports"
              :key="sport.id"
              class="flex items-center justify-between p-2 rounded-lg cursor-pointer transition"
              :class="selectedSportId === sport.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800'"
              @click="selectedSportId = sport.id"
            >
              <div class="flex items-center gap-2">
                <UIcon :name="sport.icon" class="w-4 h-4" />
                <span class="text-sm font-medium">{{ sport.name }}</span>
              </div>
              <USwitch
                :model-value="sport.active"
                size="sm"
                @click.stop
              />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Right Side: Betting Rules Form for Selected Sport -->
      <div class="lg:col-span-3">
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon :name="selectedSport.icon" class="w-5 h-5 text-primary" />
              <h3 class="text-sm font-semibold uppercase">
                {{ selectedSport.name }} - {{ t('rules.betting_rules') }}
              </h3>
            </div>
          </template>

          <UForm :state="formState" @submit="handleSave">
            <div class="space-y-6">
              <h4 class="text-sm font-semibold text-muted uppercase">{{ t('rules.limits') }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UFormField :label="t('rules.max_bet_amount')" name="maxBetAmount">
                  <UInput
                    v-model="formState.maxBetAmount"
                    type="number"
                    class="w-full"
                  />
                </UFormField>

                <UFormField :label="t('rules.max_potential_payout')" name="maxPotentialPayout">
                  <UInput
                    v-model="formState.maxPotentialPayout"
                    type="number"
                    class="w-full"
                  />
                </UFormField>

                <UFormField :label="t('rules.min_stake')" name="minStake">
                  <UInput
                    v-model="formState.minStake"
                    type="number"
                    class="w-full"
                  />
                </UFormField>

                <UFormField :label="t('rules.min_selections')" name="bettingMinSelections">
                  <UInput
                    v-model="formState.bettingMinSelections"
                    type="number"
                    class="w-full"
                  />
                </UFormField>

                <UFormField :label="t('rules.max_selections')" name="bettingMaxSelections">
                  <UInput
                    v-model="formState.bettingMaxSelections"
                    type="number"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <USeparator />

              <h4 class="text-sm font-semibold text-muted uppercase">{{ t('rules.odds') }}</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UFormField :label="t('rules.betting_min_odds')" name="bettingMinOdds">
                  <UInput
                    v-model="formState.bettingMinOdds"
                    type="number"
                    step="0.01"
                    class="w-full"
                  />
                </UFormField>

                <UFormField :label="t('rules.betting_max_odds')" name="bettingMaxOdds">
                  <UInput
                    v-model="formState.bettingMaxOdds"
                    type="number"
                    step="0.01"
                    class="w-full"
                  />
                </UFormField>

                <UFormField :label="t('rules.line_betting_min_odds')" name="lineBettingMinOdds">
                  <UInput
                    v-model="formState.lineBettingMinOdds"
                    type="number"
                    step="0.01"
                    class="w-full"
                  />
                </UFormField>

                <UFormField :label="t('rules.line_betting_max_odds')" name="lineBettingMaxOdds">
                  <UInput
                    v-model="formState.lineBettingMaxOdds"
                    type="number"
                    step="0.01"
                    class="w-full"
                  />
                </UFormField>

                <UFormField :label="t('rules.live_betting_min_odds')" name="liveBettingMinOdds">
                  <UInput
                    v-model="formState.liveBettingMinOdds"
                    type="number"
                    step="0.01"
                    class="w-full"
                  />
                </UFormField>

                <UFormField :label="t('rules.live_betting_max_odds')" name="liveBettingMaxOdds">
                  <UInput
                    v-model="formState.liveBettingMaxOdds"
                    type="number"
                    step="0.01"
                    class="w-full"
                  />
                </UFormField>
              </div>

              <USeparator />

              <h4 class="text-sm font-semibold text-muted uppercase">{{ t('rules.features') }}</h4>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">{{ t('rules.extra_combination') }}</span>
                  <USwitch v-model="formState.extraCombination" />
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">{{ t('rules.insurance') }}</span>
                  <USwitch v-model="formState.insurance" />
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">{{ t('rules.live_betting_allowed') }}</span>
                  <USwitch v-model="formState.liveBettingAllowed" />
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">{{ t('rules.line_betting_allowed') }}</span>
                  <USwitch v-model="formState.lineBettingAllowed" />
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">{{ t('rules.system_bets_offer_allowed') }}</span>
                  <USwitch v-model="formState.systemBetsOfferAllowed" />
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">{{ t('rules.casino_games_offer_allowed') }}</span>
                  <USwitch v-model="formState.casinoGamesOfferAllowed" />
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">{{ t('rules.combine_live_and_line_allowed') }}</span>
                  <USwitch v-model="formState.combineLiveAndLineAllowed" />
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">{{ t('rules.allow_same_event_selections') }}</span>
                  <USwitch v-model="formState.allowSameEventSelections" />
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">{{ t('rules.odd_change') }}</span>
                  <USwitch v-model="formState.oddChange" />
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium">{{ t('rules.coupon_preview') }}</span>
                  <USwitch v-model="formState.couponPreview" />
                </div>
              </div>

              <div class="flex justify-end">
                <UButton type="submit" color="primary">
                  {{ t('common.save') }}
                </UButton>
              </div>
            </div>
          </UForm>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel' })

const { t } = useI18n()
const toast = useToast()

const { data: sportsData } = await useAsyncData('dealer-sports', () =>
  $fetch<{ data: any[], total: number }>('/api/sports', { query: { limit: 100 } })
)

const sports = computed(() => sportsData.value?.data ?? [])

const selectedSportId = ref<string | null>(null)

watch(sports, (val) => {
  if (val.length > 0 && !selectedSportId.value) {
    selectedSportId.value = val[0].id
  }
}, { immediate: true })

const selectedSport = computed(() => {
  return sports.value.find(s => s.id === selectedSportId.value) ?? sports.value[0] ?? { id: '', name: '', icon: 'i-lucide-circle', active: false }
})

const formState = reactive({
  maxBetAmount: 0,
  maxPotentialPayout: 0,
  minStake: 0,
  bettingMinSelections: 0,
  bettingMaxSelections: 0,
  bettingMinOdds: 0,
  bettingMaxOdds: 0,
  lineBettingMinOdds: 0,
  lineBettingMaxOdds: 0,
  liveBettingMinOdds: 0,
  liveBettingMaxOdds: 0,
  extraCombination: false,
  insurance: false,
  liveBettingAllowed: false,
  lineBettingAllowed: false,
  systemBetsOfferAllowed: false,
  casinoGamesOfferAllowed: false,
  combineLiveAndLineAllowed: false,
  allowSameEventSelections: false,
  oddChange: false,
  couponPreview: false
})

const { data: dealerSettings } = await useAsyncData('dealer-betting-settings', () =>
  $fetch<Record<string, any>>('/api/settings/ROLE/DEALER').catch(() => null)
)

watch(dealerSettings, (val) => {
  if (!val) return
  const s = val.settings ?? val
  const limits = s.betting_limits ?? {}
  const odds = s.odds_limits ?? {}
  const features = s.features ?? {}

  formState.maxBetAmount = limits.maxBetAmount ?? 0
  formState.maxPotentialPayout = limits.maxPotentialPayout ?? 0
  formState.minStake = limits.minStake ?? 0
  formState.bettingMinSelections = limits.minSelections ?? 0
  formState.bettingMaxSelections = limits.maxSelections ?? 0
  formState.bettingMinOdds = odds.normalMinOdds ?? 0
  formState.bettingMaxOdds = odds.normalMaxOdds ?? 0
  formState.lineBettingMinOdds = odds.normalMinOdds ?? 0
  formState.lineBettingMaxOdds = odds.normalMaxOdds ?? 0
  formState.liveBettingMinOdds = odds.liveMinOdds ?? 0
  formState.liveBettingMaxOdds = odds.liveMaxOdds ?? 0
  formState.extraCombination = features.combinationBoost ?? false
  formState.insurance = features.combinationInsurance ?? false
  formState.liveBettingAllowed = features.liveBettingAllowed ?? false
  formState.lineBettingAllowed = features.lineBettingAllowed ?? false
  formState.systemBetsOfferAllowed = features.systemBetsAllowed ?? false
  formState.casinoGamesOfferAllowed = features.casinoGamesAllowed ?? false
  formState.combineLiveAndLineAllowed = features.combineLiveAndLine ?? false
  formState.allowSameEventSelections = features.allowSameEvent ?? false
  formState.oddChange = features.oddChangeAutoAccept ?? false
  formState.couponPreview = features.couponPreview ?? false
}, { immediate: true })

async function handleSave() {
  try {
    await Promise.all([
      $fetch('/api/settings/ROLE/DEALER/betting_limits', {
        method: 'PUT',
        body: {
          value: {
            maxBetAmount: formState.maxBetAmount,
            maxPotentialPayout: formState.maxPotentialPayout,
            minStake: formState.minStake,
            minSelections: formState.bettingMinSelections,
            maxSelections: formState.bettingMaxSelections
          }
        }
      }),
      $fetch('/api/settings/ROLE/DEALER/odds_limits', {
        method: 'PUT',
        body: {
          value: {
            normalMinOdds: formState.bettingMinOdds,
            normalMaxOdds: formState.bettingMaxOdds,
            liveMinOdds: formState.liveBettingMinOdds,
            liveMaxOdds: formState.liveBettingMaxOdds
          }
        }
      }),
      $fetch('/api/settings/ROLE/DEALER/features', {
        method: 'PUT',
        body: {
          value: {
            combinationBoost: formState.extraCombination,
            combinationInsurance: formState.insurance,
            liveBettingAllowed: formState.liveBettingAllowed,
            lineBettingAllowed: formState.lineBettingAllowed,
            systemBetsAllowed: formState.systemBetsOfferAllowed,
            casinoGamesAllowed: formState.casinoGamesOfferAllowed,
            combineLiveAndLine: formState.combineLiveAndLineAllowed,
            allowSameEvent: formState.allowSameEventSelections,
            oddChangeAutoAccept: formState.oddChange,
            couponPreview: formState.couponPreview
          }
        }
      })
    ])
    toast.add({ title: t('common.save'), description: 'Dealer settings saved successfully', color: 'green' })
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'red' })
  }
}
</script>
