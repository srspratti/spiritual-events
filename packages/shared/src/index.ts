export type SourceType = 'manual' | 'ics' | 'google_calendar' | 'meetup' | 'eventbrite' | 'facebook';
export type EventStatus = 'pending' | 'published' | 'rejected' | 'cancelled' | 'duplicate';

export type EventDTO = {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string | null;
  description?: string | null;
  eventUrl: string;
  imageUrl?: string | null;
  startsAt: string;
  endsAt?: string | null;
  timezone?: string | null;
  isOnline: boolean;
  venueName?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  sourceType: SourceType;
  topics: string[];
};

export type EventSearchParams = {
  city?: string;
  topic?: string;
  online?: boolean;
  startsAfter?: string;
  startsBefore?: string;
  page?: number;
  limit?: number;
};
