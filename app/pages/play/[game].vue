<template>
  <div class="min-h-screen bg-gray-900 flex flex-col">
    <!-- Dark Header -->
    <header class="flex items-center justify-between px-4 h-12 bg-gray-950 border-b border-gray-800">
      <div class="flex items-center gap-4">
        <UButton icon="i-lucide-arrow-left" variant="ghost" class="text-white" @click="$router.back()" />
        <SharedLogo :light="true" />
      </div>
      <UButton variant="ghost" class="text-gray-300 text-sm">
        <UIcon name="i-lucide-repeat" class="w-4 h-4 mr-1" />
        {{ $t('sportsbook.change_game') }}
      </UButton>
    </header>

    <!-- Game Area -->
    <div class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="w-80 h-60 bg-gray-800 rounded-xl flex items-center justify-center mb-4 mx-auto border border-gray-700">
          <div class="text-center">
            <UIcon name="i-lucide-gamepad-2" class="w-16 h-16 text-gray-600 mx-auto mb-3" />
            <p class="text-2xl font-bold text-white capitalize">{{ gameName }}</p>
            <p class="text-sm text-gray-500 mt-1">Game loading area</p>
          </div>
        </div>
        <UButton color="primary" size="lg">
          <UIcon name="i-lucide-play" class="w-5 h-5 mr-2" />
          Play {{ gameName }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const gameName = computed(() => (route.params.game as string).replace(/-/g, ' '))
</script>
