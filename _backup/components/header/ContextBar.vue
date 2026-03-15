<template>
  <div class="hidden lg:flex items-center justify-between h-11 px-1.5 bg-white dark:bg-gray-900 shadow-[0_3px_1px_-2px_#0003,0_2px_2px_#00000024,0_1px_5px_#0000001f]">
    <!-- Left: Sidebar trigger + Breadcrumb -->
    <div class="flex items-center gap-6 w-full">
      <!-- Sidebar trigger -->
      <button
        class="w-[230px] h-9 flex items-center justify-between px-2 text-sm rounded-md bg-gray-100 dark:bg-gray-800 cursor-pointer"
        @click="$emit('toggle-sidebar')"
      >
        <UIcon name="i-lucide-a-large-small" class="w-5 h-5 text-gray-400 dark:text-gray-500" />
        <span class="text-gray-600 dark:text-gray-400">
          {{ sidebarOpen ? $t('navigation_sidebar.hide_sports') : $t('navigation_sidebar.show_sports') }}
        </span>
        <UIcon
          name="i-lucide-chevron-right"
          class="w-5 h-5 text-primary transition-transform duration-200"
          :class="sidebarOpen ? 'rotate-180' : ''"
        />
      </button>

      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb">
        <ol class="flex flex-wrap items-center gap-1.5 text-sm leading-relaxed text-gray-400 dark:text-gray-500">
          <li class="inline-flex items-center gap-1.5">
            <NuxtLink :to="localePath('/sportsbook')" class="hover:text-primary transition">
              {{ $t('sportsbook.home') }}
            </NuxtLink>
          </li>
          <template v-for="(crumb, i) in breadcrumbs" :key="i">
            <li role="presentation" aria-hidden="true" class="leading-none">
              <UIcon name="i-lucide-chevron-right" class="w-3.5 h-3.5" />
            </li>
            <li class="inline-flex items-center gap-1.5">
              <NuxtLink v-if="crumb.to" :to="crumb.to" class="hover:text-primary transition">
                {{ crumb.label }}
              </NuxtLink>
              <span v-else class="font-normal text-gray-600 dark:text-gray-300">{{ crumb.label }}</span>
            </li>
          </template>
        </ol>
      </nav>
    </div>

    <!-- Right: Betslip trigger -->
    <button
      class="w-[360px] shrink-0 h-9 flex items-center justify-between px-2 text-sm rounded-md bg-gray-100 dark:bg-gray-800 cursor-pointer"
      @click="$emit('toggle-betslip')"
    >
      <UIcon
        name="i-lucide-chevron-right"
        class="w-5 h-5 text-primary transition-transform duration-200"
        :class="betslipOpen ? '' : 'rotate-180'"
      />
      <div class="flex items-center gap-2">
        <span class="text-gray-600 dark:text-gray-400">
          {{ betslipOpen ? $t('sportsbook.hide_betslip') : $t('sportsbook.show_betslip') }}
        </span>
      </div>
      <UIcon name="i-lucide-ticket" class="w-5 h-5 text-gray-400 dark:text-gray-500" />
    </button>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
const localePath = useLocalePath()

defineProps<{
  sidebarOpen?: boolean
  betslipOpen?: boolean
}>()

defineEmits<{
  'toggle-sidebar': []
  'toggle-betslip': []
}>()

const breadcrumbs = computed(() => {
  const path = route.path
  const crumbs: { label: string; to?: string }[] = []

  if (path.startsWith('/sportsbook/live')) {
    crumbs.push({ label: t('links.live_bet') })
  } else if (path.startsWith('/sportsbook/starting-soon')) {
    crumbs.push({ label: t('sportsbook.starting_soon') })
  } else if (path.startsWith('/sportsbook/bet-history')) {
    crumbs.push({ label: t('links.bet_history') })
  } else if (path.startsWith('/sportsbook/')) {
    const sport = route.params.sport as string
    if (sport) {
      crumbs.push({ label: sport.charAt(0).toUpperCase() + sport.slice(1) })
    }
  } else if (path.startsWith('/live/live-2')) {
    crumbs.push({ label: t('links.live_now2') })
  } else if (path.startsWith('/live')) {
    crumbs.push({ label: t('links.live_now1') })
  } else if (path.startsWith('/prematch')) {
    crumbs.push({ label: t('sportsbook.prematch') })
  } else if (path.startsWith('/games')) {
    crumbs.push({ label: t('links.games') })
  }

  return crumbs
})
</script>
