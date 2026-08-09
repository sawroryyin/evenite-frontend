export interface BilingualField {
  en: string;
  th: string;
}

export interface AgendaItem {
  time: string;
  activity: BilingualField;
}

export interface GeneratedEventDto {
  title: BilingualField;
  description: BilingualField;
  category: string[]; 
  location: BilingualField;
  mapLink?: string;
  isOnline: boolean;
  startAt?: string;
  endAt?: string;
  seatLimit?: number;
  hasCatering: boolean;
  isCateringFree: boolean;
  cateringDescription: BilingualField;
  agenda: AgendaItem[];
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactLineId?: string;
  externalUrl?: string;
  remarks: BilingualField;
}

export interface TranslateBilingualFieldsDto {
  title: BilingualField;
  description: BilingualField;
  location: BilingualField;
  cateringDescription: BilingualField;
  agenda: AgendaItem[];
  remarks: BilingualField;
}

export interface EventData extends GeneratedEventDto {
  id?: string;
  bannerUrl?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'CONCLUDED' | 'ONGOING' | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface SaveDraftDto {
  id?: string;
  title?: BilingualField;
  description?: BilingualField;
  category?: string[];
  location?: BilingualField;
  mapLink?: string;
  isOnline?: boolean;
  startAt?: Date | string; 
  endAt?: Date | string;
  seatLimit?: number;
  hasCatering?: boolean;
  isCateringFree?: boolean;
  cateringDescription?: BilingualField;
  agenda?: AgendaItem[];
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactLineId?: string;
  externalUrl?: string;
  remarks?: BilingualField;
  bannerUrl?: string;
}

export const FormType = {
  REGISTRATION: 'REGISTRATION',
  FEEDBACK: 'FEEDBACK',
} as const;

export type FormType = typeof FormType[keyof typeof FormType];

export const FieldType = {
  TEXT: 'TEXT',
  TEXTAREA: 'TEXTAREA',
  NUMBER: 'NUMBER',
  RATING: 'RATING',
  DATE: 'DATE',
  CHOICE: 'CHOICE',
  CHECKBOX: 'CHECKBOX',
} as const;

export type FieldType = typeof FieldType[keyof typeof FieldType];

export interface FormField {
  id?: string;
  type: FieldType;
  label: string;
  isRequired: boolean;
  order: number;
  options: string[];
  autoFillKey?: string | null;
  maxRating?: number | null;
}

export interface Form {
  id?: string;
  eventId: string;
  type: FormType;
  title: string | null;
  description: string | null;
  fields: FormField[];
}

export const ALLOWED_EVENT_PREFERENCES = [
  'SEMINAR',
  'WORKSHOP',
  'LECTURE',
  'CONFERENCE',
  'HACKATHON',
  'COMPETITION',
  'CLUB_ACTIVITY',
  'ORIENTATION',
  'VOLUNTEER',
  'TRIP',
  'SPORT',
  'CULTURAL',
  'FESTIVAL',
  'NETWORKING',
  'CAREER_FAIR',
  'PARTY',
  'INTERNSHIP',
  'OTHER'
] as const;

export const LANG_PREFS = ['en', 'th'] as const;

// --- FEATURE 4 NEW TYPES ADDED BELOW ---

export const TicketStatus = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;
export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus];

export const RegistrationStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
} as const;
export type RegistrationStatus = typeof RegistrationStatus[keyof typeof RegistrationStatus];

export interface CreateFormFieldAnswerDto {
  formFieldId: string;
  value: string | number | string[] | null;
}

export interface ParticipantSnapshotDto {
  firstName: string | null;
  lastName: string | null;
  nickname: string | null;
  studentId: string | null;
  major: string | null;
}

export interface ReturnTicketDetailOrganizerDto {
  name: string;
  imageUrl: string;
}

export interface ReturnTicketDetailEventDto {
  id: string;
  title: BilingualField;
  bannerUrl: string;
  startAt: Date | string | null;
  endAt: Date | string | null;
  location: BilingualField;
  mapLink: string;
  status: string;
  seatLimit: number | null;
  seatsTaken: number;
  organizer: ReturnTicketDetailOrganizerDto;
}

export interface ReturnTicketDetailRegistrationDto {
  id: string;
  status: RegistrationStatus;
  createdAt: Date | string;
}

export interface ReturnTicketDetailDto {
  id: string; 
  qrToken: string;
  status: TicketStatus;
  issuedAt: Date | string;
  participantSnapshot: ParticipantSnapshotDto;
  registration: ReturnTicketDetailRegistrationDto;
  event: ReturnTicketDetailEventDto;
}

export interface ReturnParticipantTicketListEventDto {
  id: string;
  title: BilingualField;
  bannerUrl: string;
  startAt: Date | string | null;
  endAt: Date | string | null;
  status: string;
}

export interface ReturnParticipantTicketListDto {
  id: string;  
  status: TicketStatus;
  issuedAt: Date | string;
  registrationStatus: RegistrationStatus;
  event: ReturnParticipantTicketListEventDto;
}

export type Role = 'ORGANIZER' | 'PARTICIPANT';
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'CONCLUDED' | 'CANCELLED';

export interface BilingualField {
  en: string;
  th: string;
}

export type DiscussionErrorCode = 
  | 'ROOM_NOT_FOUND'
  | 'ROOM_ACCESS_DENIED'
  | 'ROOM_READ_ONLY'
  | 'MESSAGE_CONTENT_INVALID'
  | 'ANNOUNCEMENT_NOT_ALLOWED'
  | 'REGISTRATION_NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'UNKNOWN_ERROR';

export interface MessageSender {
  role: Role;
  name: string;
  imageUrl: string;
}

export interface Message {
  id: string;
  content: string;
  isAnnouncement: boolean;
  sender: MessageSender;
  // Note: Dates sent over REST/WebSockets are serialized as ISO strings
  createdAt: string; 
}

export interface MessagePage {
  messages: Message[];
  hasMoreOlder: boolean;
  hasMoreNewer: boolean;
  oldestCursor: string | null;
  newestCursor: string | null;
}

export interface DiscussionRoomEvent {
  id: string;
  title: BilingualField;
  bannerUrl: string;
  status: EventStatus;
}

export interface DiscussionRoom {
  roomId: string;
  event: DiscussionRoomEvent;
  lastMessage: Message | null;
  unreadCount: number;
  isReadOnly: boolean;
}

export interface CreateMessagePayload {
  content: string;
  isAnnouncement?: boolean;
}

export interface GetMessagesQuery {
  cursor?: string;
  direction?: 'before' | 'after';
  limit?: number;
}

export interface GetRoomsQuery {
  filter?: 'active' | 'archived';
}

export interface SocketErrorPayload {
  event?: string;
  code: DiscussionErrorCode;
  message: string;
}