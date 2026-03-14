import { defineConfig } from 'drizzle-kit'
export default defineConfig({
  schema: './server/database/schema/index.ts',
  out: './server/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:1@localhost:5432/sportbooks'
  }
})
