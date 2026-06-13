import { NextRequest } from 'next/server';
import { assertCron } from '@/lib/auth';
import { syncAllSources } from '@/lib/importers';

export async function GET(request: NextRequest) {
  const unauthorized = assertCron(request);
  if (unauthorized) return unauthorized;
  const results = await syncAllSources();
  return Response.json({ ok: true, results });
}
