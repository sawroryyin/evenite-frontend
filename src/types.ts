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
  category: string[]; // Updated to array based on SRS-033
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
  status?: 'DRAFT' | 'PUBLISHED';
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