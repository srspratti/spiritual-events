import { NextRequest } from 'next/server';
import { assertAdmin } from '@/lib/auth';
import { syncAllSources } from '@/lib/importers';

export async function POST(request: NextRequest) {
  const unauthorized = assertAdmin(request);
  if (unauthorized) return unauthorized;
  const results = await syncAllSources();
  return Response.json({ results });
}
