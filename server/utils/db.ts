import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '../database/schema'

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function useDb() {
  if (!_db) {
    const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:1@localhost:5432/sportbooks'

    const client = postgres(DATABASE_URL, {
      max: 20,
      idle_timeout: 20,
      connect_timeout: 10
    })
    _db = drizzle(client, { schema })
  }
  return _db
}
