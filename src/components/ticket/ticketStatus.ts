// One place for ticket status labels/colours, shared by TicketCard and TicketDetailView.
export const getTicketStatusStyle = (status?: string | null): { label: string; cls: string } => {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Active', cls: 'bg-green-100 text-green-700 border-green-200' }
    case 'USED':
      return { label: 'Checked in', cls: 'bg-emerald-50 text-emerald-700 border-emerald-300' }
    case 'CANCELLED':
      return { label: 'Cancelled', cls: 'bg-red-100 text-red-700 border-red-200' }
    case 'EXPIRED':
      return { label: 'Expired', cls: 'bg-gray-100 text-gray-700 border-gray-200' }
    default:
      return { label: status || 'Unknown', cls: 'bg-[#131B2B]/5 text-[#131B2B] border-[#131B2B]/10' }
  }
}