import { randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'

const COOKIE_NAME = 'sportbooks_session'
const SESSION_TTL = 86400 // 24 hours

export interface SessionData {
  userId: number
  role: string
  parentId: number | null
  impersonatorId: number | null
  loginMethod: string
  createdAt: string
  expiresAt: string
  ipAddress: string
  userAgent: string
}

function generateSessionId(): string {
  return randomBytes(32).toString('hex')
}

export async function createSession(event: H3Event, data: Omit<SessionData, 'createdAt' | 'expiresAt'>): Promise<string> {
  const redis = useRedis()
  const sessionId = generateSessionId()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_TTL * 1000)

  const sessionData: SessionData = {
    ...data,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  }

  await redis.hset(`session:${sessionId}`, sessionData as any)
  await redis.expire(`session:${sessionId}`, SESSION_TTL)

  setCookie(event, COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL
  })

  return sessionId
}

export async function getRedisSession(sessionId: string): Promise<SessionData | null> {
  const redis = useRedis()
  const data = await redis.hgetall(`session:${sessionId}`)
  if (!data || !data.userId) return null

  // Check expiry
  if (new Date(data.expiresAt) < new Date()) {
    await redis.del(`session:${sessionId}`)
    return null
  }

  // Redis stores everything as strings, parse numeric IDs
  return {
    ...data,
    userId: Number(data.userId),
    parentId: data.parentId ? Number(data.parentId) : null,
    impersonatorId: data.impersonatorId ? Number(data.impersonatorId) : null
  } as unknown as SessionData
}

export async function destroySession(event: H3Event, sessionId: string): Promise<void> {
  const redis = useRedis()
  await redis.del(`session:${sessionId}`)
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export async function rotateSession(event: H3Event, oldSessionId: string): Promise<string> {
  const session = await getRedisSession(oldSessionId)
  if (!session) throw createError({ statusCode: 401, statusMessage: 'Session not found' })

  await destroySession(event, oldSessionId)
  return createSession(event, {
    userId: session.userId,
    role: session.role,
    parentId: session.parentId,
    impersonatorId: session.impersonatorId,
    loginMethod: session.loginMethod,
    ipAddress: session.ipAddress,
    userAgent: session.userAgent
  })
}

export function getSessionIdFromCookie(event: H3Event): string | null {
  return getCookie(event, COOKIE_NAME) || null
}
