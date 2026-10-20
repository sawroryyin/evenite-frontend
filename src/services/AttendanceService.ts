import api from './api'

export interface AttendeeSnapshot {
  firstName: string
  lastName: string
  nickname: string
  studentId: string
  major: string
}

export interface AttendanceRegistrant {
  id: string // registration id
  status: 'CONFIRMED' | 'CANCELLED' | string
  createdAt: string
  ticketId: string | null
  ticketStatus: string | null
  ticketIssuedAt: string | null
  checkedInAt: string | null
  participantSnapshot: AttendeeSnapshot
}

export interface CheckInResult {
  registrationId: string
  ticketId: string
  checkedInAt: string | null
  participantSnapshot: AttendeeSnapshot
}

export interface AttendanceEvent {
  id: string
  title: { en?: string; th?: string }
  bannerUrl?: string | null
  startAt?: string | null
  endAt?: string | null
  status: string
  seatLimit?: number | null
  seatsTaken?: number
}

export interface ScanOutcome {
  status: 'success' | 'warning' | 'error'
  title: string
  message: string
}

export const CHECK_IN_OPEN_STATUSES = ['PUBLISHED', 'ONGOING']

export const AttendanceService = {
  async getRegistrants(eventId: string): Promise<AttendanceRegistrant[]> {
    const { data } = await api.get(`/events/${eventId}/registrations`)
    return data
  },

  async checkInByQr(eventId: string, qrToken: string): Promise<CheckInResult> {
    const { data } = await api.post(`/events/${eventId}/check-ins`, { qrToken })
    return data
  },

  async setCheckIn(eventId: string, registrationId: string, checkedIn: boolean): Promise<CheckInResult> {
    const { data } = await api.patch(`/events/${eventId}/registrations/${registrationId}/check-in`, { checkedIn })
    return data
  }
}

// --- helpers shared by attendance pages ---

export const getApiErrorMessage = (error: any, fallback: string): string => {
  const msg = error?.response?.data?.message
  if (Array.isArray(msg)) return msg.join('\n')
  return msg || fallback
}

export const getAttendeeName = (s?: Partial<AttendeeSnapshot> | null): string => {
  if (!s) return 'Unknown participant'
  const full = `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim()
  return full || s.nickname || 'Unknown participant'
}

export const getEventTitle = (e?: AttendanceEvent | null): string =>
  e?.title?.en || e?.title?.th || 'Untitled Event'

export const formatEventDate = (iso?: string | null): string => {
  if (!iso) return 'Date TBA'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return 'Date TBA'
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

export const formatClock = (iso?: string | null): string => {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

// QR can contain a raw token, JSON { qrToken }, or a URL with ?qrToken= / ?token=
export const extractQrToken = (raw: string): string => {
  const value = raw.trim()
  try {
    const parsed = JSON.parse(value)
    if (parsed && typeof parsed.qrToken === 'string') return parsed.qrToken
  } catch { /* not JSON */ }
  try {
    const url = new URL(value)
    const token = url.searchParams.get('qrToken') || url.searchParams.get('token')
    if (token) return token
  } catch { /* not URL */ }
  return value
}