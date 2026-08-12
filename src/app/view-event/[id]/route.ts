import { NextResponse } from 'next/server';
import { buildDeepLinkPage } from '@/lib/deepLinkPage';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const html = buildDeepLinkPage({
    id,
    type: 'event',
    ogTitle: 'QuickCourt Event',
    ogDescription: 'Join this sports event on QuickCourt',
  });
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
