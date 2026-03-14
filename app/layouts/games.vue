<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Dark Header -->
    <header class="flex items-center justify-between px-4 h-12 bg-gray-950 border-b border-gray-800">
      <div class="flex items-center gap-4">
        <UButton icon="i-lucide-arrow-left" variant="ghost" class="text-white" @click="$router.back()" />
        <SharedLogo :light="true" />
      </div>
      <div class="flex items-center gap-3">
        <UButton variant="ghost" class="text-gray-300 text-sm">
          <UIcon name="i-lucide-repeat" class="w-4 h-4 mr-1" />
          {{ $t('sportsbook.change_game') }}
        </UButton>
      </div>
    </header>
    <slot />
  </div>
</template>
