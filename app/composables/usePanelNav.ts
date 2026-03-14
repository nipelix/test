export function usePanelNav() {
  const localePath = useLocalePath()
  const auth = useAuthStore()

  const role = computed(() => auth.user?.role || '')

  const navGroups = computed(() => {
    const r = role.value
    const userManagementItems = [
      // SUPER_ADMIN only
      ...(r === 'SUPER_ADMIN' ? [{ to: localePath('/panel/admins'), icon: '/icons/agents.svg', label: 'admins.admin_list' }] : []),
      // SUPER_ADMIN, ADMIN
      ...((['SUPER_ADMIN', 'ADMIN'] as string[]).includes(r) ? [{ to: localePath('/panel/agents'), icon: '/icons/agents.svg', label: 'dashboard.agent_list' }] : []),
      // SUPER_ADMIN, ADMIN, AGENT, DEALER
      ...((['SUPER_ADMIN', 'ADMIN', 'AGENT', 'DEALER'] as string[]).includes(r) ? [{ to: localePath('/panel/main-dealers'), icon: '/icons/agents.svg', label: 'dashboard.main_dealer_list' }] : []),
      // SUPER_ADMIN, ADMIN, DEALER, SUB_DEALER — not AGENT
      ...((['SUPER_ADMIN', 'ADMIN', 'DEALER'] as string[]).includes(r) ? [{ to: localePath('/panel/sub-dealers'), icon: '/icons/person.svg', label: 'dashboard.sub_dealer_list' }] : []),
      // SUPER_ADMIN, ADMIN, DEALER, SUB_DEALER
      ...((['SUPER_ADMIN', 'ADMIN', 'DEALER', 'SUB_DEALER'] as string[]).includes(r) ? [{ to: localePath('/panel/players'), icon: '/icons/player.svg', label: 'dashboard.players' }] : [])
    ]

    const groups = [
      {
        label: 'dashboard.main_dealer_management',
        items: userManagementItems
      },
      // SUPER_ADMIN only: Category & System Management
      ...(r === 'SUPER_ADMIN' ? [{
        label: 'dashboard.super_admin_management',
        items: [
          { to: localePath('/panel/manage-sports'), icon: '/icons/football.svg', label: 'dashboard.manage_sports' },
          { to: localePath('/panel/manage-countries'), icon: '/icons/football.svg', label: 'dashboard.manage_countries' },
          { to: localePath('/panel/manage-leagues'), icon: '/icons/football.svg', label: 'dashboard.manage_leagues' },
          { to: localePath('/panel/manage-categories'), icon: '/icons/agents.svg', label: 'dashboard.manage_categories' },
          { to: localePath('/panel/manage-betting-groups'), icon: '/icons/boost-arrow-up.svg', label: 'dashboard.manage_betting_groups' },
          { to: localePath('/panel/manage-providers'), icon: '/icons/settings.svg', label: 'dashboard.manage_providers' },
          { to: localePath('/panel/manage-provider-mappings'), icon: '/icons/settings.svg', label: 'dashboard.manage_provider_mappings' }
        ]
      }] : []),
      {
        label: 'dashboard.category_management',
        items: [
          { to: localePath('/panel/betting-rules'), icon: '/icons/settings.svg', label: 'dashboard.betting_rules' },
          { to: localePath('/panel/credit-reports'), icon: '/icons/account-statement.svg', label: 'dashboard.credit_report' },
          { to: localePath('/panel/credit-consumption'), icon: '/icons/credit-consumption.svg', label: 'dashboard.credit_consumption' }
        ]
      },
      {
        label: 'dashboard.coupon_management',
        items: [
          { to: localePath('/panel/coupon-list'), icon: '/icons/coupon-list.svg', label: 'dashboard.coupon_list' },
          { to: localePath('/panel/active-coupons'), icon: '/icons/clock.svg', label: 'dashboard.active_coupons', badge: '2' },
          { to: localePath('/panel/coupon-deletion'), icon: '/icons/bulk.svg', label: 'dashboard.bulk_delete_coupons' },
          { to: localePath('/panel/coupon-trash'), icon: '/icons/trash-back.svg', label: 'dashboard.coupon_trash_bin' },
          { to: localePath('/panel/account-statement'), icon: '/icons/account-statement.svg', label: 'dashboard.account_statement' }
        ]
      },
      {
        label: 'dashboard.my_account',
        items: [
          { to: localePath('/panel/messages'), icon: '/icons/chat.svg', label: 'dashboard.messages', badge: '3' },
          { to: localePath('/panel/transaction-history'), icon: '/icons/cashout.svg', label: 'dashboard.transaction_history' },
          { to: localePath('/panel/change-password'), icon: '/icons/change-password.svg', label: 'dashboard.change_password' }
        ]
      },
      {
        label: 'dashboard.match_management',
        items: [
          { to: localePath('/panel/matches-list'), icon: '/icons/football.svg', label: 'dashboard.matches' },
          { to: localePath('/panel/live-matches'), icon: '/icons/live3.svg', label: 'dashboard.live_match' },
          { to: localePath('/panel/live-match-general-settings'), icon: '/icons/settings.svg', label: 'dashboard.live_match_general_settings' }
        ]
      }
    ]

    return groups
  })

  const currentDate = computed(() => {
    return new Date().toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  })

  return { navGroups, currentDate, localePath }
}
