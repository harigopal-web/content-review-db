import { NextRequest, NextResponse } from 'next/server';
import { autoLookupEntry } from '@/lib/tmdb';

export async function POST(request: NextRequest) {
  try {
    const { title, score } = await request.json();

    if (!title || score === undefined) {
      return NextResponse.json(
        { error: 'Title and score are required' },
        { status: 400 }
      );
    }

    const result = await autoLookupEntry(title, score);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Lookup error:', error);
    return NextResponse.json(
      { error: 'Lookup failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const title = searchParams.get('title');
    const scoreParam = searchParams.get('score');

    if (!title || !scoreParam) {
      return NextResponse.json(
        { error: 'Title and score are required' },
        { status: 400 }
      );
    }

    const score = parseFloat(scoreParam);
    const result = await autoLookupEntry(title, score);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Lookup error:', error);
    return NextResponse.json(
      { error: 'Lookup failed' },
      { status: 500 }
    );
  }
}
