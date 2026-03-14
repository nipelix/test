export function useSportsbookNav() {
  const { t } = useI18n()
  const localePath = useLocalePath()
  const { popularLeagues, popularSports, allActiveSports } = useMockData()

  const sidebarLinks = computed(() => [
    { to: localePath('/sportsbook'), icon: '/icons/football.svg', label: t('links.sports_home'), badge: null },
    { to: localePath('/sportsbook/live'), icon: '/icons/play.svg', label: t('links.live_now'), badge: null },
    { to: localePath('/live'), icon: '/icons/live-signal.svg', label: t('links.live_now1'), badge: null },
    { to: localePath('/live/live-2'), icon: '/icons/live2.svg', label: t('links.live_now2'), badge: null },
    { to: localePath('/sportsbook/starting-soon'), icon: '/icons/clock.svg', label: t('links.starting_soon'), badge: null },
    { to: localePath('/prematch'), icon: '/icons/baseball.svg', label: t('links.prematch'), badge: null },
    { to: localePath('/sportsbook/football') + '?tab=allLeagues', icon: '/icons/leagues.svg', label: t('links.leagues'), badge: null },
    { to: localePath('/sportsbook/bet-history'), icon: '/icons/history.svg', label: t('links.bet_history'), badge: null },
    { to: localePath('/user/coupon-list'), icon: '/icons/boost-arrow-up.svg', label: t('links.coupon_list'), badge: { bg: '#ff9f00', color: '#ffffff', count: 2 } }
  ])

  return { sidebarLinks, popularLeagues, popularSports, allActiveSports, localePath }
}
