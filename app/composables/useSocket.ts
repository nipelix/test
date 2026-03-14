import type { ServerToClientEvents } from '../../shared/types/socket'

export function useSocket() {
  const { $socket } = useNuxtApp()
  const socket = $socket

  const connectionState = ref<'connected' | 'disconnected' | 'reconnecting'>('disconnected')

  const isConnected = computed(() => connectionState.value === 'connected')
  const isReconnecting = computed(() => connectionState.value === 'reconnecting')

  // Track connection state
  const handlers: Array<() => void> = []

  function setupStateTracking() {
    const onConnect = () => { connectionState.value = 'connected' }
    const onDisconnect = () => { connectionState.value = 'disconnected' }
    const onReconnecting = () => { connectionState.value = 'reconnecting' }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.io.on('reconnect_attempt', onReconnecting)

    // Set initial state
    connectionState.value = socket.connected ? 'connected' : 'disconnected'

    handlers.push(
      () => socket.off('connect', onConnect),
      () => socket.off('disconnect', onDisconnect),
      () => socket.io.off('reconnect_attempt', onReconnecting)
    )
  }

  function on<E extends keyof ServerToClientEvents>(
    event: E,
    handler: ServerToClientEvents[E]
  ) {
    socket.on(event as string, handler as any)
    handlers.push(() => socket.off(event as string, handler as any))
  }

  function emit<E extends keyof ServerToClientEvents>(
    event: string,
    ...args: any[]
  ) {
    socket.emit(event as any, ...args)
  }

  setupStateTracking()

  if (getCurrentInstance()) {
    onUnmounted(() => {
      handlers.forEach(cleanup => cleanup())
      handlers.length = 0
    })
  }

  return {
    socket,
    connectionState: readonly(connectionState),
    isConnected,
    isReconnecting,
    on,
    emit
  }
}
