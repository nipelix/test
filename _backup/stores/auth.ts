import { defineStore } from 'pinia'

interface AuthUser {
  id: number
  username: string
  email: string
  role: string
  parentId: number | null
  status: string
  walletType: string
  createdAt: string
  updatedAt: string
  isImpersonating?: boolean
  preferences?: UserPreferences | null
}

export interface TablePrefs {
  columns?: string[]
  sorts?: SortItem[]
}

export interface UserPreferences {
  theme?: 'light' | 'dark'
  accentColor?: 'green' | 'purple' | 'orange' | 'red'
  avatarId?: number
  tables?: Record<string, TablePrefs>
}

type AccentColor = 'green' | 'purple' | 'orange' | 'red'

export const useAuthStore = defineStore('auth', () => {
  // ── Auth state ──
  const user = ref<AuthUser | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isImpersonating = computed(() => !!user.value?.isImpersonating)

  // ── Preferences state ──
  const preferences = ref<UserPreferences>({})
  const preferencesLoaded = ref(false)
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  const currentAvatarId = computed(() => preferences.value.avatarId ?? 1)

  // ── Avatar picker state ──
  const avatarPickerOpen = ref(false)
  const selectedAvatar = ref(1)

  // ── Accent color state ──
  const accentColorCookie = useCookie<AccentColor>('accent-color', {
    default: () => 'green',
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax'
  })

  const accentColor = computed(() => accentColorCookie.value)

  function setAccentColor(color: AccentColor) {
    accentColorCookie.value = color
    if (preferencesLoaded.value) {
      savePreferences({ accentColor: color })
    }
  }

  // ── Socket helpers (safe for SSR + plugin ordering) ──

  function connectSocket() {
    if (!import.meta.client) return
    try {
      const { $socket } = useNuxtApp()
      if ($socket && !$socket.connected) $socket.connect()
    } catch {
      // socket plugin not yet initialized
    }
  }

  function disconnectSocket() {
    if (!import.meta.client) return
    try {
      const { $socket } = useNuxtApp()
      if ($socket?.connected) $socket.disconnect()
    } catch {
      // socket plugin not yet initialized
    }
  }

  // ── Auth actions ──

  async function login(identifier: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<AuthUser>('/api/auth/login', {
        method: 'POST',
        body: { identifier, password }
      })
      user.value = data
      applyPreferences(data.preferences ?? {})
      connectSocket()
      return data
    } catch (err: any) {
      error.value = err.data?.statusMessage || err.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore errors on logout
    } finally {
      user.value = null
      resetPreferences()
      disconnectSocket()
    }
  }

  async function fetchMe() {
    const cookieHeaders = useRequestHeaders(['cookie']) as HeadersInit
    try {
      const data = await $fetch<AuthUser>('/api/auth/me', {
        headers: cookieHeaders
      })
      user.value = data
      applyPreferences(data.preferences ?? {})
      connectSocket()
      return data
    } catch {
      user.value = null
      disconnectSocket()
      return null
    }
  }

  async function impersonate(targetUserId: number) {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<AuthUser>('/api/auth/impersonate', {
        method: 'POST',
        body: { targetUserId }
      })
      user.value = data
      return data
    } catch (err: any) {
      error.value = err.data?.statusMessage || err.message || 'Impersonation failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function unImpersonate() {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<AuthUser>('/api/auth/un-impersonate', {
        method: 'POST'
      })
      user.value = data
      return data
    } catch (err: any) {
      error.value = err.data?.statusMessage || err.message || 'Un-impersonation failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ── Preferences actions ──

  function applyPreferences(data: UserPreferences) {
    preferences.value = data ?? {}
    preferencesLoaded.value = true

    // Sync theme to colorMode
    if (import.meta.client && data?.theme) {
      const colorMode = useColorMode()
      if (colorMode.preference !== data.theme) {
        colorMode.preference = data.theme
      }
    }

    // Sync DB accent color to cookie
    if (data?.accentColor && data.accentColor !== accentColorCookie.value) {
      accentColorCookie.value = data.accentColor
    }
  }

  function savePreferences(partial: Partial<UserPreferences>) {
    // Optimistically merge locally
    const current = preferences.value
    preferences.value = {
      ...current,
      ...partial,
      ...(partial.tables ? { tables: { ...(current.tables ?? {}), ...partial.tables } } : {})
    }

    // Debounced save to server
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(async () => {
      try {
        const merged = await $fetch<UserPreferences>('/api/user/preferences', {
          method: 'PATCH',
          body: partial
        })
        preferences.value = merged
      } catch {
        // Silent fail - local state already updated
      }
    }, 500)
  }

  function getTablePrefs(pageKey: string): TablePrefs | undefined {
    return preferences.value.tables?.[pageKey]
  }

  function saveTablePrefs(pageKey: string, prefs: Partial<TablePrefs>) {
    savePreferences({
      tables: { [pageKey]: prefs }
    })
  }

  function resetPreferences() {
    preferences.value = {}
    preferencesLoaded.value = false
    if (saveTimer) clearTimeout(saveTimer)
  }

  // ── Avatar picker actions ──

  function openAvatarPicker() {
    selectedAvatar.value = currentAvatarId.value
    avatarPickerOpen.value = true
  }

  function closeAvatarPicker() {
    avatarPickerOpen.value = false
  }

  function confirmAvatarPicker() {
    if (preferencesLoaded.value) {
      savePreferences({ avatarId: selectedAvatar.value })
    }
    avatarPickerOpen.value = false
  }

  return {
    // Auth
    user,
    loading,
    error,
    isAuthenticated,
    isImpersonating,
    login,
    logout,
    fetchMe,
    impersonate,
    unImpersonate,

    // Preferences
    preferences,
    preferencesLoaded,
    currentAvatarId,
    applyPreferences,
    savePreferences,
    getTablePrefs,
    saveTablePrefs,

    // Accent color
    accentColor,
    setAccentColor,

    // Avatar picker
    avatarPickerOpen,
    selectedAvatar,
    openAvatarPicker,
    closeAvatarPicker,
    confirmAvatarPicker
  }
})
