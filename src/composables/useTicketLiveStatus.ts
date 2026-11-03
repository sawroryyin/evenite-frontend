import { useRealtime } from './useRealTime'
import type { TicketStatus } from '../services/AttendanceService'

// Payload of the backend's `ticket:statusChanged` (realtime namespace, participant's personal channel).
// Sent on check-in (status USED, checkedInAt set) and on undo (status ACTIVE, checkedInAt null).
export interface TicketStatusChange {
  eventId: string
  registrationId: string
  ticketId: string
  status: TicketStatus
  checkedInAt: string | null
}

/**
 * Keep a participant's ticket in sync while the page is open.
 *
 *   useTicketLiveStatus({
 *     match: c => c.ticketId === ticket.value?.id,     // or c.eventId === eventId
 *     onChange: c => {
 *       ticket.value.status = c.status
 *       ticket.value.checkedInAt = c.checkedInAt
 *     },
 *     onReconnect: () => fetchTicket()                  // missed messages are not replayed
 *   })
 *
 * For a ticket list, match on nothing and patch the row with the same ticketId.
 */
export function useTicketLiveStatus(options: {
  match?: (change: TicketStatusChange) => boolean
  onChange: (change: TicketStatusChange) => void
  onReconnect?: () => void
}) {
  useRealtime(
    {
      'ticket:statusChanged': (change: TicketStatusChange) => {
        if (options.match && !options.match(change)) return
        options.onChange(change)
      }
    },
    options.onReconnect
  )
}