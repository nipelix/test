<template>
  <div class="w-full max-w-lg">
    <!-- Logo -->
    <div class="flex justify-center mb-10">
      <SharedLogo :width="180" :height="50" />
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center">
      {{ errorMessage }}
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm text-center">
      {{ successMessage }}
    </div>

    <!-- Password Login Form -->
    <div v-if="mode === 'password'" class="flex flex-col gap-3.5 w-full">
      <UInput
        v-model="username"
        :placeholder="$t('auth.username_placeholder')"
        size="xl"
        variant="subtle"
        icon="i-lucide-at-sign"
        class="w-full"
        autocapitalize="off"
        autocomplete="username"
        :disabled="auth.loading"
        @keyup.enter="handleLogin"
      />

      <UInput
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="$t('auth.password_placeholder')"
        size="xl"
        variant="subtle"
        icon="i-lucide-lock"
        class="w-full"
        autocapitalize="off"
        autocomplete="current-password"
        :disabled="auth.loading"
        :trailing-icon="showPassword ? 'i-lucide-eye' : 'i-lucide-eye-off'"
        @keyup.enter="handleLogin"
      >
        <template #trailing>
          <button type="button" tabindex="-1" @click="showPassword = !showPassword">
            <UIcon :name="showPassword ? 'i-lucide-eye' : 'i-lucide-eye-off'" class="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
          </button>
        </template>
      </UInput>

      <UButton
        type="submit"
        block
        size="xl"
        color="primary"
        class="font-semibold mt-1"
        :loading="auth.loading"
        :disabled="!canSubmit"
        @click="handleLogin"
      >
        {{ $t('auth.login') }}
      </UButton>

      <!-- Divider -->
      <div class="flex items-center gap-3 pt-1">
        <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        <span class="text-xs text-gray-400 uppercase">{{ $t('common.or') || 'veya' }}</span>
        <div class="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      </div>

      <!-- Passkey Login -->
      <UButton
        block
        size="xl"
        variant="outline"
        color="neutral"
        class="font-semibold"
        icon="i-lucide-fingerprint"
        :loading="passkeyLoading"
        @click="handlePasskeyLogin"
      >
        {{ $t('auth.passkey_login') }}
      </UButton>

      <!-- Magic Link -->
      <UButton
        block
        size="xl"
        variant="ghost"
        color="neutral"
        class="font-semibold"
        icon="i-lucide-wand-sparkles"
        @click="mode = 'magic-link'"
      >
        {{ $t('auth.use_magic_link') }}
      </UButton>
    </div>

    <!-- Magic Link: Email Step -->
    <div v-else-if="mode === 'magic-link'" class="flex flex-col gap-3.5 w-full">
      <UInput
        v-model="email"
        type="email"
        :placeholder="$t('auth.magic_link_email_placeholder')"
        size="xl"
        variant="subtle"
        icon="i-lucide-mail"
        class="w-full"
        :disabled="sendingLink"
        @keyup.enter="handleSendMagicLink"
      />
      <UButton
        block
        size="xl"
        color="primary"
        class="font-semibold"
        icon="i-lucide-send"
        :loading="sendingLink"
        @click="handleSendMagicLink"
      >
        {{ $t('auth.send_magic_link') }}
      </UButton>
      <UButton
        block
        size="xl"
        variant="outline"
        color="neutral"
        class="font-semibold"
        icon="i-lucide-lock"
        @click="mode = 'password'"
      >
        {{ $t('auth.use_password') }}
      </UButton>
    </div>

    <!-- Magic Link: Token Step -->
    <div v-else-if="mode === 'verify-token'" class="flex flex-col gap-3.5 w-full">
      <p class="text-sm text-center text-gray-500 dark:text-gray-400">
        {{ $t('auth.enter_token') }}
      </p>
      <UInput
        v-model="token"
        :placeholder="$t('auth.magic_link_token_placeholder')"
        size="xl"
        variant="subtle"
        icon="i-lucide-key-round"
        class="w-full"
        :disabled="verifyingToken"
        @keyup.enter="handleVerifyToken"
      />
      <UButton
        block
        size="xl"
        color="primary"
        class="font-semibold"
        icon="i-lucide-log-in"
        :loading="verifyingToken"
        @click="handleVerifyToken"
      >
        {{ $t('auth.verify_magic_link') }}
      </UButton>
      <UButton
        block
        size="xl"
        variant="outline"
        color="neutral"
        class="font-semibold"
        icon="i-lucide-lock"
        @click="mode = 'password'"
      >
        {{ $t('auth.use_password') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { startAuthentication } from '@simplewebauthn/browser'

definePageMeta({ layout: 'auth' })

const router = useRouter()
const localePath = useLocalePath()
const auth = useAuthStore()

type Mode = 'password' | 'magic-link' | 'verify-token'
const mode = ref<Mode>('password')

const username = ref('')
const password = ref('')
const email = ref('')
const token = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const sendingLink = ref(false)
const verifyingToken = ref(false)
const passkeyLoading = ref(false)

const canSubmit = computed(() => username.value.length >= 3 && password.value.length >= 4)

async function handleLogin() {
  if (!canSubmit.value) return
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const data = await auth.login(username.value, password.value)
    const role = data?.role
    const target = role === 'ADMIN' ? '/panel/coupon-list'
      : role === 'DEALER' ? '/panel'
      : role === 'AGENT' ? '/panel/main-dealers'
      : role === 'SUB_DEALER' ? '/panel'
      : '/sportsbook'
    router.push(localePath(target))
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || 'Login failed'
  }
}

async function handlePasskeyLogin() {
  errorMessage.value = ''
  passkeyLoading.value = true
  try {
    const options = await $fetch<any>('/api/auth/passkey/login-options', { method: 'POST' })
    const { challengeId, ...authOptions } = options
    const credential = await startAuthentication({ optionsJSON: authOptions })
    const userData = await $fetch('/api/auth/passkey/login-verify', {
      method: 'POST',
      body: { credential, challengeId }
    })
    auth.user = userData as any
    router.push(localePath('/panel'))
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      errorMessage.value = ''
    } else {
      errorMessage.value = err.data?.statusMessage || err.message || 'Passkey authentication failed'
    }
  } finally {
    passkeyLoading.value = false
  }
}

async function handleSendMagicLink() {
  if (!email.value) return
  errorMessage.value = ''
  successMessage.value = ''
  sendingLink.value = true
  try {
    await $fetch('/api/auth/magic-link', {
      method: 'POST',
      body: { email: email.value }
    })
    mode.value = 'verify-token'
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || 'Failed to send magic link'
  } finally {
    sendingLink.value = false
  }
}

async function handleVerifyToken() {
  if (!token.value) return
  errorMessage.value = ''
  successMessage.value = ''
  verifyingToken.value = true
  try {
    const userData = await $fetch('/api/auth/verify-link', {
      method: 'POST',
      body: { token: token.value }
    })
    auth.user = userData as any
    router.push(localePath('/panel'))
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || 'Invalid or expired token'
  } finally {
    verifyingToken.value = false
  }
}
</script>
