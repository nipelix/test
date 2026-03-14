import { io, type Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '../../shared/types/socket'

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

// Module-level singleton to survive HMR
let _socket: TypedSocket | null = null

function getSocket(): TypedSocket {
  if (!_socket) {
    _socket = io({
      path: '/ws/',
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      reconnectionAttempts: Infinity
    }) as TypedSocket
  }
  return _socket
}

export default defineNuxtPlugin({
  name: 'socket',
  setup() {
    const socket = getSocket()
    const auth = useAuthStore()

    // Handle session expiry
    socket.on('session:expired', () => {
      socket.disconnect()
      auth.user = null
      navigateTo('/sign-in')
    })

    // Auto-connect if user is already authenticated (SSR hydration)
    if (auth.isAuthenticated && !socket.connected) {
      socket.connect()
    }

    return {
      provide: {
        socket
      }
    }
  }
})
