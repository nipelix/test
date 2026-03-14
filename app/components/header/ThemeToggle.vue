<template>
  <div class="theme-toggle">
    <!-- Sun Icon -->
    <svg class="theme-icon theme-icon--sun" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z" />
    </svg>

    <!-- Toggle Switch -->
    <label class="toggle-switch">
      <input
        type="checkbox" 
        v-model="isDark"
        @change="toggleTheme"
      />
      <span class="toggle-switch__track" data-off="Light" data-on="Dark" />
    </label>

    <!-- Moon Icon -->
    <svg class="theme-icon theme-icon--moon" viewBox="0 0 16 16" fill="currentColor">
      <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z" />
      <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z" />
    </svg>
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const auth = useAuthStore()

const isDark = computed(() => colorMode.value === 'dark')

function toggleTheme() {
  const newTheme = colorMode.value === 'dark' ? 'light' : 'dark'
  colorMode.preference = newTheme
  if (auth.preferencesLoaded) {
    auth.savePreferences({ theme: newTheme })
  }
}
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Sun & Moon Icons */
.theme-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.theme-icon--sun {
  color: #f59e0b;
}
.theme-icon--moon {
  color: #6366f1;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
}

.toggle-switch input[type="checkbox"] {
  cursor: pointer;
  width: 116px;
  height: 28px;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  margin: 0;
}

/* Track */
.toggle-switch__track {
  box-sizing: content-box;
  display: block;
  width: 116px;
  height: 28px;
  background: #e0e0e0;
  border-radius: 26px;
  position: relative;
  transition: background 0.3s;
  cursor: pointer;
}

/* Inactive label (right side) */
.toggle-switch__track::before {
  content: attr(data-on);
  position: absolute;
  font-size: 11px;
  font-weight: 500;
  top: 50%;
  transform: translateY(-50%);
  right: 16px;
  color: #666;
}

/* Sliding knob */
.toggle-switch__track::after {
  box-sizing: content-box;
  content: attr(data-off);
  width: 56px;
  height: 24px;
  line-height: 24px;
  background: #fff;
  border-radius: 26px;
  position: absolute;
  left: 2px;
  top: 2px;
  text-align: center;
  transition: all 0.3s;
  box-shadow: 0 0 6px -2px rgba(0, 0, 0, 0.3);
  padding: 0;
  font-size: 11px;
  font-weight: 500;
  color: #333;
}

/* ===== Dark mode checked ===== */
.toggle-switch input:checked + .toggle-switch__track {
  background: #151515;
}

.toggle-switch input:checked + .toggle-switch__track::after {
  content: attr(data-on);
  left: 58px;
  background: #3c3c3c;
  color: #fff;
}

.toggle-switch input:checked + .toggle-switch__track::before {
  content: attr(data-off);
  right: auto;
  left: 16px;
  color: #888;
}
</style>
