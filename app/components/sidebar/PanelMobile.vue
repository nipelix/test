<template>
  <div class="lg:hidden">
    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/50 z-[60]"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Drawer -->
    <aside
      class="fixed top-0 left-0 z-[70] h-screen w-[75vw] max-w-[280px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-200"
      :class="open ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Logo -->
      <div class="shrink-0 flex items-center justify-center h-[3.75rem] border-b border-gray-200 dark:border-gray-800">
        <SharedLogo />
      </div>

      <SidebarPanelNavContent @navigate="$emit('close')" />
    </aside>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

defineEmits<{
  close: []
}>()

watch(() => props.open, (val) => {
  if (import.meta.client) {
    document.body.style.overflow = val ? 'hidden' : ''
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
