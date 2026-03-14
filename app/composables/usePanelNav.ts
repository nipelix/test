import { isRole } from '~~/shared/types/roles'
import type { Role } from '~~/shared/types/roles'

export interface NavItem {
  to: string
  icon: string
  label: string
  badge?: string
  roles?: Role[]
}

export interface NavGroup {
  label: string
  roles?: Role[]
  items: NavItem[]
}

export function usePanelNav() {
  const localePath = useLocalePath()
  const auth = useAuthStore()

  const role = computed<Role>(() => {
    const r = auth.user?.role
    return (r && isRole(r)) ? r : 'PLAYER'
  })

  function p(path: string) {
    return localePath(`/panel${path}`)
  }

  // ── All nav groups with role visibility ──
  const allGroups: NavGroup[] = [
    // 1. User Management
    {
      label: 'dashboard.main_dealer_management',
      items: [
        { to: p('/admins'), icon: 'i-lucide-shield', label: 'admins.admin_list', roles: ['SUPER_ADMIN'] },
        { to: p('/agents'), icon: 'i-lucide-users', label: 'dashboard.agent_list', roles: ['SUPER_ADMIN', 'ADMIN'] },
        { to: p('/main-dealers'), icon: 'i-lucide-briefcase', label: 'dashboard.main_dealer_list', roles: ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER'] },
        { to: p('/sub-dealers'), icon: 'i-lucide-user-check', label: 'dashboard.sub_dealer_list', roles: ['SUPER_ADMIN', 'ADMIN', 'DEALER'] },
        { to: p('/players'), icon: 'i-lucide-user', label: 'dashboard.players', roles: ['SUPER_ADMIN', 'ADMIN', 'DEALER', 'SUB_DEALER'] }
      ]
    },

    // 2. Super Admin Management (sports, countries, leagues, categories, providers)
    {
      label: 'dashboard.super_admin_management',
      roles: ['SUPER_ADMIN'],
      items: [
        { to: p('/manage-sports'), icon: 'i-lucide-trophy', label: 'dashboard.manage_sports' },
        { to: p('/manage-countries'), icon: 'i-lucide-globe', label: 'dashboard.manage_countries' },
        { to: p('/manage-leagues'), icon: 'i-lucide-flag', label: 'dashboard.manage_leagues' },
        { to: p('/manage-categories'), icon: 'i-lucide-layers', label: 'dashboard.manage_categories' },
        { to: p('/manage-betting-groups'), icon: 'i-lucide-boxes', label: 'dashboard.manage_betting_groups' },
        { to: p('/manage-providers'), icon: 'i-lucide-database', label: 'dashboard.manage_providers' },
        { to: p('/manage-provider-mappings'), icon: 'i-lucide-link', label: 'dashboard.manage_provider_mappings' }
      ]
    },

    // 3. Category Management (betting rules, credit reports, credit consumption)
    {
      label: 'dashboard.category_management',
      roles: ['SUPER_ADMIN', 'ADMIN', 'DEALER'],
      items: [
        { to: p('/betting-rules'), icon: 'i-lucide-scale', label: 'dashboard.betting_rules' },
        { to: p('/dealer-betting-rules'), icon: 'i-lucide-sliders-horizontal', label: 'dashboard.dealer_betting_rules', roles: ['SUPER_ADMIN', 'ADMIN', 'DEALER'] },
        { to: p('/credit-reports'), icon: 'i-lucide-bar-chart-3', label: 'dashboard.credit_report', roles: ['SUPER_ADMIN', 'ADMIN'] },
        { to: p('/credit-consumption'), icon: 'i-lucide-coins', label: 'dashboard.credit_consumption', roles: ['SUPER_ADMIN', 'ADMIN'] }
      ]
    },

    // 4. Coupon Management
    {
      label: 'dashboard.coupon_management',
      items: [
        { to: p('/coupon-list'), icon: 'i-lucide-list', label: 'dashboard.coupon_list' },
        { to: p('/active-coupons'), icon: 'i-lucide-clock', label: 'dashboard.active_coupons' },
        { to: p('/coupon-deletion'), icon: 'i-lucide-trash-2', label: 'dashboard.bulk_delete_coupons', roles: ['SUPER_ADMIN', 'ADMIN', 'DEALER'] },
        { to: p('/coupon-trash'), icon: 'i-lucide-archive-restore', label: 'dashboard.coupon_trash_bin' },
        { to: p('/account-statement'), icon: 'i-lucide-file-text', label: 'dashboard.account_statement' }
      ]
    },

    // 5. My Account
    {
      label: 'dashboard.my_account',
      items: [
        { to: p('/messages'), icon: 'i-lucide-message-square', label: 'dashboard.messages' },
        { to: p('/transaction-history'), icon: 'i-lucide-receipt', label: 'dashboard.transaction_history', roles: ['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER', 'SUB_DEALER'] },
        { to: p('/change-password'), icon: 'i-lucide-key', label: 'dashboard.change_password' },
        { to: p('/dealers-credits'), icon: 'i-lucide-credit-card', label: 'dashboard.add_remove_balance', roles: ['DEALER'] },
        { to: p('/dealers-balance'), icon: 'i-lucide-wallet', label: 'dashboard.dealers_balance', roles: ['DEALER'] },
        { to: p('/check-balance'), icon: 'i-lucide-search', label: 'dashboard.check_balance', roles: ['DEALER', 'SUB_DEALER'] }
      ]
    },

    // 6. Match Management
    {
      label: 'dashboard.match_management',
      items: [
        { to: p('/manage-sports'), icon: 'i-lucide-medal', label: 'dashboard.manage_sports', roles: ['SUPER_ADMIN', 'ADMIN', 'DEALER'] },
        { to: p('/manage-countries'), icon: 'i-lucide-map', label: 'dashboard.manage_countries', roles: ['SUPER_ADMIN', 'ADMIN', 'DEALER'] },
        { to: p('/manage-leagues'), icon: 'i-lucide-flag-triangle-right', label: 'dashboard.manage_leagues', roles: ['SUPER_ADMIN', 'ADMIN', 'DEALER'] },
        { to: p('/matches-list'), icon: 'i-lucide-calendar', label: 'dashboard.matches' },
        { to: p('/live-matches'), icon: 'i-lucide-radio', label: 'dashboard.live_match', roles: ['SUPER_ADMIN', 'ADMIN'] },
        { to: p('/live-match-general-settings'), icon: 'i-lucide-settings', label: 'dashboard.live_match_general_settings', roles: ['SUPER_ADMIN', 'ADMIN'] }
      ]
    },

    // 7. SubDealer-only: Player Operations
    {
      label: 'dashboard.player_operations',
      roles: ['SUB_DEALER'],
      items: [
        { to: p('/players'), icon: 'i-lucide-user', label: 'dashboard.players' },
        { to: p('/check-balance'), icon: 'i-lucide-search', label: 'dashboard.check_balance' }
      ]
    }
  ]

  // ── Filter groups and items by current role ──
  const navGroups = computed(() => {
    const r = role.value
    return allGroups
      .filter(group => !group.roles || group.roles.includes(r))
      .map(group => ({
        label: group.label,
        items: group.items.filter(item => !item.roles || item.roles.includes(r))
      }))
      .filter(group => group.items.length > 0)
  })

  const currentDate = computed(() => {
    return new Date().toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  })

  return { navGroups, currentDate, role }
}
