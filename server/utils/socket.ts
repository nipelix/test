import type { Server } from 'socket.io'
import type { ServerToClientEvents, ClientToServerEvents, SocketData } from '../../shared/types/socket'

type IO = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>

function getIO(): IO | null {
  try {
    const nitroApp = useNitroApp() as any
    return nitroApp.$io || null
  } catch {
    return null
  }
}

export function emitToUser<E extends keyof ServerToClientEvents>(
  userId: number,
  event: E,
  ...args: Parameters<ServerToClientEvents[E]>
): void {
  const io = getIO()
  if (!io) return
  io.to(`user:${userId}`).emit(event, ...args as any)
}

export function emitToRoom<E extends keyof ServerToClientEvents>(
  room: string,
  event: E,
  ...args: Parameters<ServerToClientEvents[E]>
): void {
  const io = getIO()
  if (!io) return
  io.to(room).emit(event, ...args as any)
}
