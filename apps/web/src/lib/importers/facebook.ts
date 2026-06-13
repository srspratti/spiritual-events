import { Source } from '@prisma/client';
import { NormalizedEvent } from '../events';

export async function fetchFacebookEvents(_source: Source): Promise<NormalizedEvent[]> {
  // Intentionally not implemented as a scraper.
  // Production Facebook support should use Meta Graph API after app review and organizer/admin authorization.
  // Manual Facebook event links can be submitted through /submit-event and reviewed by admins.
  return [];
}
