export interface Sport {
  id: number
  name: string
  slug: string
  icon: string
  active: boolean
  sortOrder: number
  matchCount: number
  mostPopular?: boolean
}

export const mockSports: Sport[] = [
  { id: 1, name: 'Football', slug: 'football', icon: '/icons/football.svg', active: true, sortOrder: 1, matchCount: 245, mostPopular: true },
  { id: 2, name: 'Basketball', slug: 'basketball', icon: '/icons/basketball.svg', active: true, sortOrder: 2, matchCount: 89, mostPopular: true },
  { id: 3, name: 'Tennis', slug: 'tennis', icon: '/icons/tennis.svg', active: true, sortOrder: 3, matchCount: 156, mostPopular: true },
  { id: 4, name: 'Volleyball', slug: 'volleyball', icon: '/icons/volleyball.svg', active: true, sortOrder: 4, matchCount: 42, mostPopular: true },
  { id: 5, name: 'Ice Hockey', slug: 'ice-hockey', icon: '/icons/ice-hockey.svg', active: true, sortOrder: 5, matchCount: 38, mostPopular: true },
  { id: 6, name: 'Handball', slug: 'handball', icon: '/icons/handball.svg', active: true, sortOrder: 6, matchCount: 25, mostPopular: true },
  { id: 7, name: 'Baseball', slug: 'baseball', icon: '/icons/baseball.svg', active: true, sortOrder: 7, matchCount: 30 },
  { id: 8, name: 'American Football', slug: 'american-football', icon: '/icons/american-football.svg', active: true, sortOrder: 8, matchCount: 12 },
  { id: 9, name: 'Table Tennis', slug: 'table-tennis', icon: '/icons/table-tennis.svg', active: true, sortOrder: 9, matchCount: 67, mostPopular: true },
  { id: 10, name: 'Boxing', slug: 'boxing', icon: '/icons/boxing.svg', active: true, sortOrder: 10, matchCount: 8 },
  { id: 11, name: 'UFC / MMA', slug: 'ufc', icon: '/icons/ufc.svg', active: true, sortOrder: 11, matchCount: 6 },
  { id: 12, name: 'Rugby', slug: 'rugby', icon: '/icons/rugby.svg', active: true, sortOrder: 12, matchCount: 15 },
  { id: 13, name: 'Cricket', slug: 'cricket', icon: '/icons/cricket.svg', active: true, sortOrder: 13, matchCount: 20 },
  { id: 14, name: 'Darts', slug: 'darts', icon: '/icons/darts.svg', active: true, sortOrder: 14, matchCount: 10 },
  { id: 15, name: 'Snooker', slug: 'snooker', icon: '/icons/snooker.svg', active: true, sortOrder: 15, matchCount: 8 },
  { id: 16, name: 'Futsal', slug: 'futsal', icon: '/icons/futsal.svg', active: true, sortOrder: 16, matchCount: 12 },
  { id: 17, name: 'Badminton', slug: 'badminton', icon: '/icons/badminton.svg', active: true, sortOrder: 17, matchCount: 5 },
  { id: 18, name: 'Water Polo', slug: 'water-polo', icon: '/icons/water-polo.svg', active: true, sortOrder: 18, matchCount: 3 },
  { id: 19, name: 'E-Sports', slug: 'esports', icon: '/icons/esports.svg', active: true, sortOrder: 19, matchCount: 35, mostPopular: true },
  { id: 20, name: 'Cycling', slug: 'cycling', icon: '/icons/cycling.svg', active: true, sortOrder: 20, matchCount: 2 },
  { id: 21, name: 'Golf', slug: 'golf', icon: '/icons/golf.svg', active: true, sortOrder: 21, matchCount: 4 },
  { id: 22, name: 'Formula 1', slug: 'formula-1', icon: '/icons/formula-1.svg', active: true, sortOrder: 22, matchCount: 3 },
  { id: 23, name: 'Horse Racing', slug: 'horse-racing', icon: '/icons/horse-racing.svg', active: true, sortOrder: 23, matchCount: 7 },
  { id: 24, name: 'Skiing', slug: 'skiing', icon: '/icons/skiing.svg', active: true, sortOrder: 24, matchCount: 2 },
  { id: 25, name: 'Beach Volleyball', slug: 'beach-volleyball', icon: '/icons/beach-volleyball.svg', active: true, sortOrder: 25, matchCount: 6 },
  { id: 26, name: 'Squash', slug: 'squash', icon: '/icons/squash.svg', active: true, sortOrder: 26, matchCount: 3 },
  { id: 27, name: 'Padel', slug: 'padel', icon: '/icons/padel.svg', active: true, sortOrder: 27, matchCount: 4 },
  { id: 28, name: 'Surfing', slug: 'surfing', icon: '/icons/surfing.svg', active: true, sortOrder: 28, matchCount: 1 },
  { id: 29, name: 'Motorsport', slug: 'motorsport', icon: '/icons/motorsport.svg', active: true, sortOrder: 29, matchCount: 5 }
]

export const popularSports = mockSports.filter(s => s.mostPopular && s.active)
export const allActiveSports = mockSports.filter(s => s.active).sort((a, b) => a.name.localeCompare(b.name))
