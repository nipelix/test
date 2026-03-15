import type { Role } from '~~/shared/types/roles'
import type { UserRow } from '~~/shared/types/entities'

/**
 * User list composable — composes useEntityList with role-specific query params.
 * Eliminates duplication of debounce, pagination, selection logic.
 */
export function useUserList(role: Role, pageKey: string, columns: Array<{ accessorKey: string; header: string }>, defaultSort = 'createdAt') {
  const entityList = useEntityList<UserRow>(`/api/users?role=${role}`, pageKey, columns, defaultSort)

  function handleModalSuccess() {
    entityList.clearSelection()
    entityList.refresh()
  }

  return {
    ...entityList,
    handleModalSuccess
  }
}
