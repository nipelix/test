<template>
  <div
    class="user-avatar"
    :class="[`user-avatar--${size}`, { 'user-avatar--editable': editable }]"
    :style="{ width: pixelSize + 'px', height: pixelSize + 'px' }"
    @click="openPicker"
  >
    <!-- Avatar Image -->
    <img
      v-if="avatarSrc"
      :src="avatarSrc"
      :alt="username || 'Avatar'"
      class="user-avatar__img"
    >
    <!-- Fallback Initials -->
    <span v-else class="user-avatar__fallback">
      {{ initials }}
    </span>

    <!-- Edit Overlay -->
    <div v-if="editable" class="user-avatar__edit-overlay">
      <UIcon name="i-lucide-pencil" />
    </div>


  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  username?: string
  avatarId?: number | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  editable?: boolean
}>(), {
  username: '',
  avatarId: null,
  size: 'md',
  editable: false
})

const emit = defineEmits<{
  'avatar-change': [id: number]
  'picker-open': []
}>()

const { t } = useI18n()

const sizeMap: Record<string, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80
}

const pixelSize = computed(() => sizeMap[props.size] || 40)

const avatarSrc = computed(() => {
  if (props.avatarId && props.avatarId >= 1 && props.avatarId <= 60) {
    return `/avatars/${props.avatarId}.png`
  }
  return null
})

const initials = computed(() => {
  if (!props.username) return '?'
  return props.username
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

function getAvatarUrl(id: number) {
  return `/avatars/${id}.png`
}

function openPicker() {
  if (!props.editable) return
  emit('picker-open')
}
</script>

<style scoped>
.user-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  cursor: default;
  transition: transform 0.2s, box-shadow 0.2s;
}
.user-avatar--editable {
  cursor: pointer;
}
.user-avatar--editable:hover {
  transform: scale(1.05);
}
.user-avatar--editable:hover .user-avatar__edit-overlay {
  opacity: 1;
}

/* Image */
.user-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

/* Fallback Initials */
.user-avatar__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--accent-500);
  color: #fdfdfd;
  font-weight: 700;
}
.user-avatar--xs .user-avatar__fallback { font-size: 10px; }
.user-avatar--sm .user-avatar__fallback { font-size: 12px; }
.user-avatar--md .user-avatar__fallback { font-size: 14px; }
.user-avatar--lg .user-avatar__fallback { font-size: 16px; }
.user-avatar--xl .user-avatar__fallback { font-size: 24px; }

/* Edit Overlay */
.user-avatar__edit-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s;
  color: white;
}
.user-avatar__edit-overlay svg {
  width: 40%;
  height: 40%;
  max-width: 24px;
  max-height: 24px;
}


</style>

<!-- Avatar Picker styles (global because UModal is teleported to body) -->
<style>
.avatar-picker {
  display: flex;
  flex-direction: column;
}
.avatar-picker__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-gray-200, #e5e7eb);
}
:root.dark .avatar-picker__header {
  border-bottom-color: #414141;
}
.avatar-picker__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-gray-900, #111827);
}
:root.dark .avatar-picker__title {
  color: #fdfdfd;
}
.avatar-picker__close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-gray-400, #9ca3af);
}
.avatar-picker__body {
  padding: 12px 16px;
}
.avatar-picker__grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}
.avatar-picker__option {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 2px solid transparent;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  background: none;
  transition: border-color 0.2s, transform 0.2s;
}
.avatar-picker__option:hover {
  transform: scale(1.1);
}
.avatar-picker__option--selected {
  border-color: var(--accent-500);
  box-shadow: 0 0 0 1px var(--accent-500);
}
.avatar-picker__option-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.avatar-picker__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid var(--color-gray-200, #e5e7eb);
}
:root.dark .avatar-picker__footer {
  border-top-color: #414141;
}
</style>
