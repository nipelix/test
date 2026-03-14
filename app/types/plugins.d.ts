import type { Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '../../shared/types/socket'

declare module '#app' {
  interface NuxtApp {
    $socket: Socket<ServerToClientEvents, ClientToServerEvents>
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $socket: Socket<ServerToClientEvents, ClientToServerEvents>
  }
}

export {}
