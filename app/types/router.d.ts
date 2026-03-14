import type { Role } from '~~/shared/types/roles'

declare module '#app' {
  interface PageMeta {
    allowedRoles?: Role[]
  }
}

export {}
