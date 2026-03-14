export interface Message {
  id: number
  sender: string
  subject: string
  content: string
  read: boolean
  createdAt: string
}

export const mockMessages: Message[] = [
  { id: 1, sender: 'System', subject: 'Welcome to Sinek2', content: 'Welcome to the Sinek2 platform. Please review the terms and conditions before placing any bets.', read: true, createdAt: '2025-06-10T08:00:00Z' },
  { id: 2, sender: 'Admin', subject: 'New Betting Rules Update', content: 'We have updated our betting rules. Maximum stake for single bets has been increased to 5000 TL. Please review the updated rules in the settings page.', read: false, createdAt: '2025-06-14T12:00:00Z' },
  { id: 3, sender: 'System', subject: 'Maintenance Notice', content: 'Scheduled maintenance will be performed on June 20th from 03:00 to 05:00 UTC. Some services may be temporarily unavailable during this period.', read: false, createdAt: '2025-06-15T06:00:00Z' }
]
