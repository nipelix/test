<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold">{{ t('dashboard.betting_rules') }}</h1>

    <UTabs :items="mainTabs" class="w-full">
      <template #content="{ item }">
        <div v-if="item.value === 'system'" class="mt-4">
          <UTabs :items="systemSubTabs" class="w-full">
            <template #content="{ item: subItem }">
              <!-- Limits Tab -->
              <div v-if="subItem.value === 'limits'" class="mt-4">
                <UCard>
                  <UForm :state="formState" @submit="handleSave">
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

                      <UFormField :label="t('rules.line_bulk_odds')" name="lineBulkOdds">
                        <UInput
                          v-model="formState.lineBulkOdds"
                          type="number"
                          class="w-full"
                        />
                      </UFormField>

                      <UFormField :label="t('rules.live_bulk_odds')" name="liveBulkOdds">
                        <UInput
                          v-model="formState.liveBulkOdds"
                          type="number"
                          class="w-full"
                        />
                      </UFormField>
                    </div>

                    <div class="flex justify-end mt-6">
                      <UButton type="submit" color="primary">
                        {{ t('common.save') }}
                      </UButton>
                    </div>
                  </UForm>
                </UCard>
              </div>

              <!-- Odds Tab -->
              <div v-if="subItem.value === 'odds'" class="mt-4">
                <UCard>
                  <UForm :state="formState" @submit="handleSave">
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

                    <div class="flex justify-end mt-6">
                      <UButton type="submit" color="primary">
                        {{ t('common.save') }}
                      </UButton>
                    </div>
                  </UForm>
                </UCard>
              </div>

              <!-- Features Tab -->
              <div v-if="subItem.value === 'features'" class="mt-4">
                <UCard>
                  <UForm :state="formState" @submit="handleSave">
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

                    <div class="flex justify-end mt-6">
                      <UButton type="submit" color="primary">
                        {{ t('common.save') }}
                      </UButton>
                    </div>
                  </UForm>
                </UCard>
              </div>
            </template>
          </UTabs>
        </div>

        <div v-if="item.value === 'dealer'" class="mt-4">
          <UCard>
            <p class="text-muted text-sm">
              {{ t('rules.dealer_rules_description') }}
            </p>
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
definePageMeta({ layout: 'panel' })

const { t } = useI18n()
const localePath = useLocalePath()
const toast = useToast()

const mainTabs = [
  { label: t('rules.system_rules'), value: 'system' },
  { label: t('rules.dealer_rules'), value: 'dealer' }
]

const systemSubTabs = [
  { label: t('rules.limits'), value: 'limits' },
  { label: t('rules.odds'), value: 'odds' },
  { label: t('rules.features'), value: 'features' }
]

const formState = reactive({
  maxBetAmount: 0,
  maxPotentialPayout: 0,
  minStake: 0,
  bettingMinSelections: 0,
  bettingMaxSelections: 0,
  bettingMaxOdds: 0,
  bettingMinOdds: 0,
  lineBettingMinOdds: 0,
  lineBettingMaxOdds: 0,
  liveBettingMinOdds: 0,
  liveBettingMaxOdds: 0,
  lineBulkOdds: 0,
  liveBulkOdds: 0,
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

const { data: settingsData } = await useAsyncData('betting-rules-settings', () =>
  $fetch<Record<string, any>>('/api/settings')
)

watch(settingsData, (val) => {
  if (!val) return
  const limits = val.betting_limits ?? {}
  const odds = val.odds_limits ?? {}
  const features = val.features ?? {}

  // Limits
  formState.maxBetAmount = limits.maxBetAmount ?? 0
  formState.maxPotentialPayout = limits.maxPotentialPayout ?? 0
  formState.minStake = limits.minStake ?? 0
  formState.bettingMinSelections = limits.minSelections ?? 0
  formState.bettingMaxSelections = limits.maxSelections ?? 0
  formState.lineBulkOdds = limits.lineBulkOdds ?? 0
  formState.liveBulkOdds = limits.liveBulkOdds ?? 0

  // Odds
  formState.bettingMinOdds = odds.normalMinOdds ?? 0
  formState.bettingMaxOdds = odds.normalMaxOdds ?? 0
  formState.lineBettingMinOdds = odds.normalMinOdds ?? 0
  formState.lineBettingMaxOdds = odds.normalMaxOdds ?? 0
  formState.liveBettingMinOdds = odds.liveMinOdds ?? 0
  formState.liveBettingMaxOdds = odds.liveMaxOdds ?? 0

  // Features
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
      $fetch('/api/settings/GLOBAL/system/betting_limits', {
        method: 'PUT',
        body: {
          value: {
            maxBetAmount: formState.maxBetAmount,
            maxPotentialPayout: formState.maxPotentialPayout,
            minStake: formState.minStake,
            minSelections: formState.bettingMinSelections,
            maxSelections: formState.bettingMaxSelections,
            lineBulkOdds: formState.lineBulkOdds,
            liveBulkOdds: formState.liveBulkOdds
          }
        }
      }),
      $fetch('/api/settings/GLOBAL/system/odds_limits', {
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
      $fetch('/api/settings/GLOBAL/system/features', {
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
    toast.add({ title: t('common.save'), description: 'Settings saved successfully', color: 'green' })
  } catch (err: any) {
    toast.add({ title: t('common.error'), description: err.data?.statusMessage, color: 'red' })
  }
}
</script>
