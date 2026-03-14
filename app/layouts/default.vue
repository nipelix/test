<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 px-4">
    <slot />
    <!-- Customer Service link bottom-right -->
    <div class="fixed bottom-4 right-4">
      <button class="flex items-center gap-2 text-sm text-green-600 hover:text-green-700">
        {{ $t('common.customer_service') }}
        <UIcon name="i-lucide-send" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
