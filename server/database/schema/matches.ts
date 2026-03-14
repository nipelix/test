import { pgTable, serial, integer, varchar, timestamp, boolean, pgEnum, index } from 'drizzle-orm/pg-core'
import { sports } from './sports'
import { leagues } from './leagues'

export const matchStatusEnum = pgEnum('match_status', [
  'PREMATCH',
  'LIVE',
  'FINISHED',
  'CANCELLED',
  'POSTPONED'
])

export const matches = pgTable('matches', {
  id: serial('id').primaryKey(),
  homeTeam: varchar('home_team', { length: 200 }).notNull(),
  awayTeam: varchar('away_team', { length: 200 }).notNull(),
  leagueId: integer('league_id').notNull().references(() => leagues.id),
  sportId: integer('sport_id').notNull().references(() => sports.id),
  status: matchStatusEnum('status').notNull().default('PREMATCH'),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  scoreHome: integer('score_home').notNull().default(0),
  scoreAway: integer('score_away').notNull().default(0),
  minute: integer('minute'),
  period: varchar('period', { length: 50 }),
  isPopular: boolean('is_popular').notNull().default(false),
  externalId: varchar('external_id', { length: 100 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => [
  index('matches_league_id_idx').on(table.leagueId),
  index('matches_sport_id_idx').on(table.sportId),
  index('matches_status_idx').on(table.status),
  index('matches_start_time_idx').on(table.startTime),
  index('matches_status_start_time_idx').on(table.status, table.startTime)
])
