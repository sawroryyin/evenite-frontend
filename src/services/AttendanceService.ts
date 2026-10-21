import api from './api'

// ---------- Types (mirror backend DTOs) ----------

export type CheckInMethod = 'QR_SCAN' | 'MANUAL'
export type TicketStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'USED'

export interface AttendeeSnapshot {
  firstName?: string
  lastName?: string
  nickname?: string
  studentId?: string
  major?: string
  [key: string]: unknown
}

// ReturnAttendanceRecordDto
export interface AttendanceRecord {
  id: string // Attendance.id (needed to undo)
  method: CheckInMethod
  checkedInAt: string
}

// ReturnAttendanceListItemDto
export interface AttendanceListItem {
  registrationId: string
  ticket: { id: string; status: TicketStatus }
  participantSnapshot: AttendeeSnapshot
  attendance: AttendanceRecord | null // null = not checked in
}

export interface AttendanceSummary {
  registered: number
  checkedIn: number
}

// ReturnAttendanceListDto
export interface AttendanceList {
  summary: AttendanceSummary
  items: AttendanceListItem[]
}

// ReturnAttendanceDto (response of QR / manual check-in)
export interface CheckInResult {
  id: string
  registrationId: string
  method: CheckInMethod
  checkedInAt: string
  ticket: { id: string; status: TicketStatus }
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

// backend `errorCode` values (AttendanceErrorCode)
export const AttendanceErrorCode = {
  ALREADY_CHECKED_IN: 'ALREADY_CHECKED_IN',
  TICKET_NOT_FOUND: 'TICKET_NOT_FOUND',
  TICKET_CANCELLED: 'TICKET_CANCELLED',
  TICKET_EXPIRED: 'TICKET_EXPIRED',
  TICKET_NOT_ACTIVE: 'TICKET_NOT_ACTIVE',
  EVENT_NOT_CHECKABLE: 'EVENT_NOT_CHECKABLE',
  ATTENDANCE_NOT_FOUND: 'ATTENDANCE_NOT_FOUND',
  FEEDBACK_ALREADY_SUBMITTED: 'FEEDBACK_ALREADY_SUBMITTED'
} as const

// The backend also allows DRAFT, but drafts have no registrations to check in.
export const CHECK_IN_OPEN_STATUSES = ['PUBLISHED', 'ONGOING']

// ---------- API ----------

export const AttendanceService = {
  async getAttendanceList(eventId: string): Promise<AttendanceList> {
    const { data } = await api.get(`/events/${eventId}/attendance`)
    return data
  },

  async checkInByQr(eventId: string, qrToken: string): Promise<CheckInResult> {
    const { data } = await api.post(`/events/${eventId}/attendance/qr`, { qrToken })
    return data
  },

  async checkInManually(eventId: string, registrationId: string): Promise<CheckInResult> {
    const { data } = await api.post(`/events/${eventId}/attendance/manual`, { registrationId })
    return data
  },

  // returns the list item in its "not checked in" state
  async undoCheckIn(eventId: string, attendanceId: string): Promise<AttendanceListItem> {
    const { data } = await api.delete(`/events/${eventId}/attendance/${attendanceId}`)
    return data
  }
}

// ---------- Helpers shared by attendance pages ----------

export const getApiErrorMessage = (error: any, fallback: string): string => {
  const msg = error?.response?.data?.message
  if (Array.isArray(msg)) return msg.join('\n')
  return msg || fallback
}

export const getApiErrorCode = (error: any): string | null =>
  error?.response?.data?.errorCode ?? null

// 409 ALREADY_CHECKED_IN carries the original attendance
export const getExistingCheckIn = (error: any): CheckInResult | null =>
  getApiErrorCode(error) === AttendanceErrorCode.ALREADY_CHECKED_IN
    ? (error.response.data.attendance as CheckInResult) ?? null
    : null

export const toAttendanceRecord = (r: CheckInResult): AttendanceRecord => ({
  id: r.id,
  method: r.method,
  checkedInAt: r.checkedInAt
})

export const getAttendeeName = (s?: Partial<AttendeeSnapshot> | null): string => {
  if (!s) return 'Unknown participant'
  const full = `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim()
  return full || (s.nickname as string) || 'Unknown participant'
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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isValidQrToken = (token: string): boolean => UUID_RE.test(token)

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