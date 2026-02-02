export type Medium = 'Movie' | 'TV';

export type ContentType =
  | 'Movies'
  | 'Documentary/True Crime'
  | 'Sports'
  | 'Drama TV'
  | 'Comedy TV'
  | 'Comedy Specials'
  | 'Reality Competition'
  | 'Reality Dating'
  | 'Comic Book Stuff'
  | 'Home Improvement'
  | 'Drama'
  | 'Horror'
  | 'Comedy'
  | 'Thriller'
  | 'Romance'
  | 'Action'
  | 'Family';

export interface Entry {
  id: string;
  title: string;
  year: number;
  score: number;
  medium: Medium | null;
  type: ContentType | null;
  tags: string[] | null;
  hall_of_fame: boolean | null;
  created_at?: string;
  updated_at?: string;
  poster_url?: string | null;
  notes?: string | null;
}

export interface Vote {
  id: string;
  entry_id: string;
  vote_type: 'agree' | 'disagree-higher' | 'disagree-lower';
  created_at: string;
}

export interface VoteSummary {
  agree: number;
  disagree_higher: number;
  disagree_lower: number;
  total: number;
}

export interface ImportEntry {
  title: string;
  score: number;
  medium?: Medium;
  type?: ContentType;
  tags?: string[];
  poster_url?: string;
}

export interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  genre_ids: number[];
  media_type?: 'movie' | 'tv';
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
}
