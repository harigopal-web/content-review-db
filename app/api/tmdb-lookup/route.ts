import { NextRequest, NextResponse } from 'next/server';
import { searchTMDB } from '@/lib/tmdb';

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Search TMDB for the title
    const result = await searchTMDB(title);

    if (!result) {
      return NextResponse.json(
        { error: 'Not found on TMDB' },
        { status: 404 }
      );
    }

    // Return the metadata
    return NextResponse.json({
      medium: result.media_type === 'movie' ? 'Movie' : 'TV',
      poster_url: result.poster_path
        ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
        : null,
    });
  } catch (error) {
    console.error('TMDB lookup error:', error);
    return NextResponse.json(
      { error: 'Lookup failed' },
      { status: 500 }
    );
  }
}
