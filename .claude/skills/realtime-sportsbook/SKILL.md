---
name: Real-time Sportsbook Expert
description: Live odds updates, match events, Socket.IO with Redis adapter, betslip synchronization, suspension broadcasting
globs: ["server/plugins/socket.io.ts", "server/utils/socket.ts", "shared/types/socket.ts", "app/composables/useSocket.ts", "app/plugins/socket.client.ts", "app/stores/betslip.ts"]
---

# Real-time Sportsbook Expert

You are an expert in real-time betting systems using Socket.IO with Redis adapter.

## Architecture

```
Client (Vue/Nuxt) ←→ Socket.IO Server (Nitro) ←→ Redis Adapter ←→ Multiple Server Instances
```

## Socket Events

### Server → Client (ServerToClientEvents)

```typescript
interface ServerToClientEvents {
  // Session
  'session:expired': (reason: string) => void
  'connection:ack': (data: { userId: number; connectedAt: string }) => void

  // Match updates (live)
  'match:update': (data: MatchUpdate) => void
  'match:status': (data: { matchId: number; status: string }) => void

  // Odds changes
  'odds:change': (data: OddsChange) => void

  // Balance (after bet/win/deposit)
  'balance:update': (data: BalanceUpdate) => void

  // Coupon status changes
  'coupon:update': (data: CouponUpdate) => void
}
```

### Client → Server (ClientToServerEvents)

```typescript
interface ClientToServerEvents {
  'subscribe:matches': (matchIds: number[]) => void
  'unsubscribe:matches': (matchIds: number[]) => void
}
```

## Socket.IO Server Setup (Nitro Plugin)

```typescript
// server/plugins/socket.io.ts
import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'

export default defineNitroPlugin((app) => {
  const io = new Server(/* ... */)

  // Redis adapter for horizontal scaling
  const pubClient = createRedisClient()
  const subClient = pubClient.duplicate()
  io.adapter(createAdapter(pubClient, subClient))

  // Authentication middleware
  io.use(async (socket, next) => {
    const sessionId = socket.handshake.auth.sessionId
    // Validate session → attach userId, role to socket.data
  })

  // Room management
  io.on('connection', (socket) => {
    // Join user-specific room
    socket.join(`user:${socket.data.userId}`)

    // Join role-based room
    socket.join(`role:${socket.data.role}`)

    // Match subscription
    socket.on('subscribe:matches', (matchIds) => {
      matchIds.forEach(id => socket.join(`match:${id}`))
    })
  })
})
```

## Emit Patterns

```typescript
// To specific user (balance update, coupon update)
emitToUser(userId, 'balance:update', { userId, newBalance })

// To match room (odds change, score update)
emitToRoom(`match:${matchId}`, 'odds:change', { matchId, selectionId, oldOdds, newOdds })

// To all connected clients (match status)
io.emit('match:status', { matchId, status: 'SUSPENDED' })
```

## Client Integration (Nuxt)

### Plugin Setup
```typescript
// app/plugins/socket.client.ts
export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const socket = io(wsUrl, {
    auth: { sessionId: auth.user?.id },
    transports: ['websocket', 'polling'],
    reconnection: true
  })

  return { provide: { socket } }
})
```

### Betslip Sync
When `odds:change` event arrives for a selection in the betslip:
1. Update the selection's odds via `updateSelectionOdds(id, newOdds)`
2. The `hasOddChange` computed detects the difference from `originalOddsMap`
3. Show user notification: "Odds changed from X to Y"
4. User can accept or reject the new odds

### Balance Update
When `balance:update` arrives:
1. Update wallet display in header/sidebar
2. If user is on balance page, refresh the data

### Match Suspension
When `match:status` with status='SUSPENDED':
1. Disable betting on that match
2. If match is in betslip, mark selections as unavailable
3. Show toast notification

## Room Naming Convention

```
user:{userId}          — Personal notifications (balance, coupon status)
role:{role}            — Role-wide broadcasts
match:{matchId}        — Match subscribers (odds, score, status)
league:{leagueId}      — League-wide events
sport:{sportId}        — Sport-wide events
```

## Redis Adapter Benefits

- **Horizontal scaling**: Multiple Nitro instances share socket state
- **Room sync**: emit to `match:123` reaches all servers
- **Presence**: track connected users across instances
- **Pub/Sub**: decouple emitters from receivers

## Anti-Patterns

- ❌ Polling for odds/score updates — use WebSocket events
- ❌ Storing socket state in memory without Redis — breaks multi-instance
- ❌ Broadcasting to all clients — use rooms for targeted delivery
- ❌ Trusting client-sent odds — always validate server-side
- ❌ No reconnection handling — use Socket.IO auto-reconnect with backoff
