import { Server as SocketIOServer } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { parse as parseCookie } from 'cookie'
import type { ServerToClientEvents, ClientToServerEvents, SocketData } from '../../shared/types/socket'

const COOKIE_NAME = 'sportbooks_session'
const SESSION_CHECK_INTERVAL = 60_000

export default defineNitroPlugin((nitroApp) => {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>({
    path: '/ws/',
    serveClient: false,
    transports: ['websocket', 'polling'],
    cors: {
      origin: true,
      credentials: true
    }
  })

  // Redis adapter for multi-instance support
  try {
    const pub = useRedis()
    const sub = pub.duplicate()
    io.adapter(createAdapter(pub, sub))
    console.log('[socket.io] Redis adapter attached')
  } catch (err) {
    console.warn('[socket.io] Redis adapter failed, using in-memory adapter:', err)
  }

  // Auth middleware
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie
      if (!cookieHeader) {
        return next(new Error('No session cookie'))
      }

      const cookies = parseCookie(cookieHeader)
      const sessionId = cookies[COOKIE_NAME]
      if (!sessionId) {
        return next(new Error('No session cookie'))
      }

      const session = await getRedisSession(sessionId)
      if (!session) {
        return next(new Error('Invalid or expired session'))
      }

      socket.data.userId = session.userId
      socket.data.role = session.role
      socket.data.sessionId = sessionId

      next()
    } catch {
      next(new Error('Authentication failed'))
    }
  })

  // Connection handler
  io.on('connection', (socket) => {
    const { userId, sessionId } = socket.data

    // Join user-specific room
    socket.join(`user:${userId}`)

    // Send connection acknowledgement
    socket.emit('connection:ack', {
      userId,
      connectedAt: new Date().toISOString()
    })

    console.log(`[socket.io] User ${userId} connected (socket: ${socket.id})`)

    // Periodic session validation
    const sessionCheckTimer = setInterval(async () => {
      try {
        const session = await getRedisSession(sessionId)
        if (!session) {
          socket.emit('session:expired', 'Session expired or invalidated')
          socket.disconnect(true)
        }
      } catch {
        // Redis error - don't disconnect, will retry next interval
      }
    }, SESSION_CHECK_INTERVAL)

    socket.on('disconnect', (reason) => {
      clearInterval(sessionCheckTimer)
      console.log(`[socket.io] User ${userId} disconnected (${reason})`)
    })
  })

  // Attach to Nitro app for access in API routes
  ;(nitroApp as any).$io = io

  // Attach to HTTP server when it starts listening
  nitroApp.hooks.hook('listen' as any, (server: any) => {
    io.attach(server)
    console.log('[socket.io] Server initialized on /ws/')
  })
})
