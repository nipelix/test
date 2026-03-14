export interface ServerToClientEvents {
  'session:expired': (reason: string) => void
  'connection:ack': (data: { userId: number; connectedAt: string }) => void
}

export interface ClientToServerEvents {
  // Will be extended as features are added
}

export interface SocketData {
  userId: number
  role: string
  sessionId: string
}
