import api from './api'

// ---------- Types (mirror backend ReturnAnalyticsDto) ----------

export type AnalyticsRange = '24h' | '7d' | '30d' | 'all'
export type AnalyticsBucket = '1h' | '1d'

export interface AnalyticsOverview {
  seatLimit: number | null
  registered: number
  cancelled: number
  checkedIn: number
  notCheckedIn: number
  attendanceRate: number | null // 0..1
  registerRate: number | null // 0..1
}

export interface AnalyticsTimelinePoint {
  bucketStart: string
  count: number
  cumulative: number // running total of the whole event
}

export interface AnalyticsTimeline {
  bucket: AnalyticsBucket
  timelineStart: string
  timelineEnd: string // min(now, event end)
  points: AnalyticsTimelinePoint[]
}

export interface AnalyticsFieldStats {
  fieldId: string
  label: string
  type: string
  answered: number
  options?: { value: string; count: number }[]
  average?: number | null
  min?: number | null
  max?: number | null
  distribution?: { value: number; count: number }[]
}

export interface AnalyticsFeedback {
  responses: number
  responseRate: number | null
  fields: AnalyticsFieldStats[]
}

export interface EventAnalytics {
  generatedAt: string
  range: AnalyticsRange
  timeZone: string
  overview: AnalyticsOverview
  checkInTimeline: AnalyticsTimeline
  registrationTimeline: AnalyticsTimeline
  checkInMethods: { QR_SCAN: number; MANUAL: number }
  registrationAnswers: AnalyticsFieldStats[] // [] when no registration form
  feedback: AnalyticsFeedback | null // null when no feedback form
}

// ---------- API ----------

export const AnalyticsService = {
  async getEventAnalytics(eventId: string, range: AnalyticsRange = '24h'): Promise<EventAnalytics> {
    const { data } = await api.get(`/events/${eventId}/analytics`, { params: { range } })
    return data
  }
}

export const formatPercent = (rate: number | null | undefined): string =>
  rate === null || rate === undefined ? '—' : `${Math.round(rate * 1000) / 10}%`