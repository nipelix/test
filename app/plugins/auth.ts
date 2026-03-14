export default defineNuxtPlugin({
  name: 'auth',
  async setup() {
    const auth = useAuthStore()
    await auth.fetchMe()
  }
})
