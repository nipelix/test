export interface Country {
  id: number
  name: string
  code: string
  flag: string
  active: boolean
}

export const mockCountries: Country[] = [
  { id: 1, name: 'Turkey', code: 'TR', flag: '🇹🇷', active: true },
  { id: 2, name: 'England', code: 'GB-ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', active: true },
  { id: 3, name: 'Germany', code: 'DE', flag: '🇩🇪', active: true },
  { id: 4, name: 'Spain', code: 'ES', flag: '🇪🇸', active: true },
  { id: 5, name: 'Italy', code: 'IT', flag: '🇮🇹', active: true },
  { id: 6, name: 'France', code: 'FR', flag: '🇫🇷', active: true },
  { id: 7, name: 'Netherlands', code: 'NL', flag: '🇳🇱', active: true },
  { id: 8, name: 'Portugal', code: 'PT', flag: '🇵🇹', active: true },
  { id: 9, name: 'Brazil', code: 'BR', flag: '🇧🇷', active: true },
  { id: 10, name: 'Argentina', code: 'AR', flag: '🇦🇷', active: true },
  { id: 11, name: 'United States', code: 'US', flag: '🇺🇸', active: true },
  { id: 12, name: 'Russia', code: 'RU', flag: '🇷🇺', active: true },
  { id: 13, name: 'Belgium', code: 'BE', flag: '🇧🇪', active: true },
  { id: 14, name: 'Scotland', code: 'GB-SCT', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', active: true },
  { id: 15, name: 'Austria', code: 'AT', flag: '🇦🇹', active: true }
]
