import type { SessionData } from '../utils/session'
import type { Server } from 'socket.io'
import type { ServerToClientEvents, ClientToServerEvents, SocketData } from '../../shared/types/socket'

declare module 'h3' {
  interface H3EventContext {
    session: SessionData | null
    sessionId: string | null
  }
}

declare module 'nitropack' {
  interface NitroApp {
    $io: Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>
  }
}

export {}
