import { z } from 'zod'
import { ROLES, WALLET_TYPES } from '~~/shared/types/roles'

export const loginSchema = z.object({
  identifier: z.string().min(1).max(255),
  password: z.string().min(1).max(128)
})

export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email().max(255),
  password: z.string().min(4).max(128),
  role: z.enum(ROLES),
  walletType: z.enum(WALLET_TYPES).optional().default('NONE'),
  parentId: z.number().int().positive().optional()
})

export const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().max(255).optional(),
  status: z.enum(['ACTIVE', 'PASSIVE']).optional(),
  walletType: z.enum(WALLET_TYPES).optional(),
  parentId: z.number().int().positive().optional()
})

export const magicLinkSchema = z.object({
  email: z.string().email().max(255)
})

export const verifyLinkSchema = z.object({
  token: z.string().min(1)
})

export const impersonateSchema = z.object({
  targetUserId: z.number().int().positive()
})
