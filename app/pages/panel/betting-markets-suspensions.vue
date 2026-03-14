<template>
  <div class="space-y-4">
    <h1 class="text-xl font-bold">{{ t('dashboard.betting_markets_suspensions') }}</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Markets Column -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">{{ t('suspensions.markets') }}</h2>
            <div class="flex gap-1.5">
              <UButton icon="i-lucide-refresh-cw" size="xs" variant="outline" @click="loadMarkets" />
              <UButton icon="i-lucide-x-circle" size="xs" variant="outline" color="error" @click="clearMarketSuspensions">
                {{ t('suspensions.reset_all') }}
              </UButton>
            </div>
          </div>
        </template>
        <AdminSuspensionToggleList
          :items="markets"
          :suspended-ids="suspendedMarketIds"
          :loading="loadingMarkets"
          @toggle="toggleMarket"
        />
      </UCard>

      <!-- Selections Column -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">{{ t('suspensions.selections') }}</h2>
            <div class="flex gap-1.5">
              <UButton icon="i-lucide-refresh-cw" size="xs" variant="outline" @click="loadSelections" />
              <UButton icon="i-lucide-x-circle" size="xs" variant="outline" color="error" @click="clearSelectionSuspensions">
                {{ t('suspensions.reset_all') }}
              </UButton>
            </div>
          </div>
        </template>
        <AdminSuspensionToggleList
          :items="selections"
          :suspended-ids="suspendedSelectionIds"
          :loading="loadingSelections"
          @toggle="toggleSelection"
        />
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'panel', middleware: 'panel', allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'DEALER'] })

const { t } = useI18n()
const toast = useToast()

const markets = ref<Array<{ id: number; name: string; description?: string }>>([])
const selections = ref<Array<{ id: number; name: string; description?: string }>>([])
const suspendedMarketIds = reactive(new Set<number>())
const suspendedSelectionIds = reactive(new Set<number>())
const loadingMarkets = ref(false)
const loadingSelections = ref(false)

async function loadMarkets() {
  loadingMarkets.value = true
  try {
    const [marketsRes, suspRes] = await Promise.all([
      $fetch<{ data: any[] }>('/api/market-types', { query: { limit: 500 } }),
      $fetch<{ data: any[] }>('/api/market-types/suspensions').catch(() => ({ data: [] }))
    ])
    markets.value = (marketsRes.data ?? []).map((m: any) => ({ id: m.id, name: m.name, description: `ID: ${m.id}` }))
    suspendedMarketIds.clear()
    for (const s of suspRes.data ?? []) suspendedMarketIds.add(s.entityId ?? s.id)
  } catch { /* silent */ }
  finally { loadingMarkets.value = false }
}

async function loadSelections() {
  loadingSelections.value = true
  try {
    const [selRes, suspRes] = await Promise.all([
      $fetch<{ data: any[] }>('/api/selection-templates', { query: { limit: 500 } }),
      $fetch<{ data: any[] }>('/api/selection-templates/suspensions').catch(() => ({ data: [] }))
    ])
    selections.value = (selRes.data ?? []).map((s: any) => ({ id: s.id, name: s.name, description: `Group: ${s.groupId ?? '-'}` }))
    suspendedSelectionIds.clear()
    for (const s of suspRes.data ?? []) suspendedSelectionIds.add(s.entityId ?? s.id)
  } catch { /* silent */ }
  finally { loadingSelections.value = false }
}

async function toggleMarket(id: number, suspended: boolean) {
  try {
    if (suspended) {
      await $fetch('/api/market-types/suspensions', { method: 'POST', body: { entityId: id } })
      suspendedMarketIds.add(id)
    } else {
      await $fetch(`/api/market-types/suspensions/${id}`, { method: 'DELETE' })
      suspendedMarketIds.delete(id)
    }
  } catch {
    toast.add({ title: t('common.error'), color: 'error' })
  }
}

async function toggleSelection(id: number, suspended: boolean) {
  try {
    if (suspended) {
      await $fetch('/api/selection-templates/suspensions', { method: 'POST', body: { entityId: id } })
      suspendedSelectionIds.add(id)
    } else {
      await $fetch(`/api/selection-templates/suspensions/${id}`, { method: 'DELETE' })
      suspendedSelectionIds.delete(id)
    }
  } catch {
    toast.add({ title: t('common.error'), color: 'error' })
  }
}

async function clearMarketSuspensions() {
  try {
    await $fetch('/api/market-types/suspensions', { method: 'DELETE' })
    suspendedMarketIds.clear()
    toast.add({ title: t('suspensions.all_cleared'), color: 'success' })
  } catch { toast.add({ title: t('common.error'), color: 'error' }) }
}

async function clearSelectionSuspensions() {
  try {
    await $fetch('/api/selection-templates/suspensions', { method: 'DELETE' })
    suspendedSelectionIds.clear()
    toast.add({ title: t('suspensions.all_cleared'), color: 'success' })
  } catch { toast.add({ title: t('common.error'), color: 'error' }) }
}

onMounted(() => { loadMarkets(); loadSelections() })
</script>
