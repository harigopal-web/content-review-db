# Content Review Database

A Next.js web application for managing and exploring your personal movie and TV show reviews. Features an interactive recommendation quiz, audience voting system, and admin panel for easy content management.

## Features

### Public Features
- **Interactive Quiz/Recommendation Engine**: Find content based on medium, type, tags, score, and recency
- **5-Star Shows**: Browse all entries with perfect ratings
- **All-Time Top 10**: View the highest-rated entries across all years
- **Hall of Fame**: Curated collection with elegant poster grid display
- **Audience Voting**: Anonymous voting system with agree/disagree feedback
- **Responsive Design**: Works seamlessly on desktop and mobile

### Admin Features
- **Password-Protected Access**: Secure admin panel
- **CRUD Operations**: Add, edit, delete, and manage entries
- **Bulk Import**: Paste multiple entries and auto-lookup metadata via TMDB API
- **Hall of Fame Management**: Manually curate special entries
- **Search & Filter**: Quickly find and manage entries

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL database)
- **APIs**: TMDB (The Movie Database) for auto-lookup
- **Deployment**: Vercel
- **Icons**: Lucide React

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Supabase account (free tier works)
- A TMDB API key (free)
- A Vercel account (optional, for deployment)

## Setup Instructions

### 1. Clone and Install

```bash
cd content-review-db
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy the contents of `supabase-setup.sql` and run it in the SQL Editor
4. This will create:
   - `entries` table (your content reviews)
   - `votes` table (audience votes)
   - Indexes for performance
   - Row Level Security policies
   - A `vote_summaries` view

### 3. Get Your TMDB API Key

1. Create an account at [themoviedb.org](https://www.themoviedb.org/)
2. Go to Settings → API
3. Request an API key (free)
4. Copy your API key

### 4. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in your values:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

   # TMDB API
   TMDB_API_KEY=your-tmdb-api-key-here

   # Admin Authentication
   ADMIN_PASSWORD=your-secure-password-here
   ```

   **Where to find Supabase credentials:**
   - Go to your Supabase project dashboard
   - Click on Settings → API
   - Copy the Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Copy the anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Using the Application

### Public Interface

1. **Find Content**: Use the quiz interface on the home page to filter by medium, type, tags, score, or recency
2. **Browse Special Collections**:
   - 5-Star Shows: All perfect ratings
   - All-Time Top 10: Highest-rated entries
   - Hall of Fame: Curated collection with poster grid
3. **Vote**: Share your opinion on ratings with the voting system (one vote per browser)

### Admin Panel

1. **Access**: Navigate to `/admin` and enter your admin password
2. **Add Single Entry**: Click "Add New Entry" and fill in the form
3. **Bulk Import**:
   - Go to Admin → Bulk Import
   - Paste entries in format: `Title - Score` (one per line)
   - Select the year reviewed
   - Click "Parse Entries"
   - Click "Auto-Lookup All" to fetch metadata from TMDB
   - Review and edit any fields as needed
   - Click "Import All Ready Entries"
4. **Manage Entries**: Edit, delete, or toggle Hall of Fame status
5. **Search**: Use the search bar to quickly find entries

### Example Bulk Import Format

```
The Shawshank Redemption - 5
Inception - 4.5
Breaking Bad - 5
The Office - 4
Planet Earth - 4.5
```

## Database Schema

### Entries Table
- `id`: UUID (primary key)
- `title`: Text
- `year_reviewed`: Integer (2022-2025)
- `score`: Numeric (0-5, in 0.5 increments)
- `medium`: Enum ('Movie' or 'TV')
- `type`: Enum (Movies, Documentary/True Crime, Sports, etc.)
- `tags`: Text array
- `hall_of_fame`: Boolean
- `poster_url`: Text (nullable)
- `created_at`, `updated_at`: Timestamps

### Votes Table
- `id`: UUID (primary key)
- `entry_id`: UUID (foreign key to entries)
- `vote_type`: Enum ('agree', 'disagree-higher', 'disagree-lower')
- `created_at`: Timestamp

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your repository
5. Configure environment variables:
   - Add all variables from `.env.local`
   - Make sure to use your production Supabase URL and keys
6. Click "Deploy"

### Option 2: Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add TMDB_API_KEY
vercel env add ADMIN_PASSWORD

# Deploy to production
vercel --prod
```

## Environment Variables Reference

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key for Supabase | Supabase Dashboard → Settings → API |
| `TMDB_API_KEY` | TMDB API key for auto-lookup | TMDB → Settings → API |
| `ADMIN_PASSWORD` | Password for admin panel | Choose your own secure password |

## Project Structure

```
content-review-db/
├── app/
│   ├── page.tsx                    # Main quiz/recommendation page
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── admin/                      # Admin panel
│   │   ├── layout.tsx              # Admin auth wrapper
│   │   ├── page.tsx                # CRUD interface
│   │   └── import/page.tsx         # Bulk import
│   ├── five-stars/page.tsx         # 5-star shows page
│   ├── top-10/page.tsx             # Top 10 page
│   ├── hall-of-fame/page.tsx       # Hall of Fame page
│   └── api/
│       ├── auth/route.ts           # Admin authentication
│       └── lookup/route.ts         # TMDB auto-lookup
├── components/
│   ├── EntryCard.tsx               # Content card component
│   ├── VotingInterface.tsx         # Voting UI
│   └── Navigation.tsx              # Main navigation
├── lib/
│   ├── types.ts                    # TypeScript types
│   ├── supabase.ts                 # Supabase client
│   ├── tmdb.ts                     # TMDB utilities
│   └── database.types.ts           # Generated DB types
├── supabase-setup.sql              # Database schema
├── .env.local.example              # Environment template
└── README.md                       # This file
```

## Customization

### Adding New Content Types

Edit `lib/types.ts` and add your new type to the `ContentType` union:

```typescript
export type ContentType =
  | 'Movies'
  | 'Documentary/True Crime'
  | 'Your New Type'  // Add here
  // ... rest
```

Update the database schema in `supabase-setup.sql` to include the new type in the CHECK constraint.

### Customizing TMDB Auto-Lookup Logic

Edit `lib/tmdb.ts`:
- `determineType()`: Customize how content types are detected
- `generateTags()`: Modify tag generation logic
- Genre mappings and keyword detection

### Styling

The app uses Tailwind CSS. Customize colors and styles in:
- `tailwind.config.js`: Theme configuration
- `app/globals.css`: Global styles
- Individual component files: Component-specific styles

## Troubleshooting

### "TMDB_API_KEY is not configured"
- Ensure `.env.local` contains `TMDB_API_KEY=your-key`
- Restart the dev server after adding environment variables

### "Admin password not configured"
- Add `ADMIN_PASSWORD=your-password` to `.env.local`
- Restart the dev server

### Supabase Connection Issues
- Verify your Supabase URL and anon key are correct
- Check that your Supabase project is active
- Ensure RLS policies are set up correctly (run `supabase-setup.sql`)

### Auto-Lookup Not Working
- Check TMDB API key is valid
- Verify you haven't exceeded TMDB rate limits (40 requests per 10 seconds)
- Check browser console and server logs for errors

### Voting Not Saving
- Verify Supabase RLS policies allow public insert on votes table
- Check browser localStorage is enabled
- Inspect network tab for failed requests

## Performance Considerations

- **TMDB Rate Limits**: The bulk import processes entries in batches of 5 with 1-second delays
- **Image Optimization**: Next.js Image component automatically optimizes poster images
- **Database Indexes**: Created on frequently queried columns (score, year, tags)
- **Caching**: Vote summaries use a Postgres view for efficient aggregation

## Security Notes

- Admin password is compared server-side via API route
- Row Level Security (RLS) is enabled on all Supabase tables
- Public tables allow read access, but admin operations should be protected
- For production, consider implementing proper authentication (e.g., Supabase Auth)

## Future Enhancements

Some ideas for extending the application:
- User accounts with Supabase Auth
- Personal watchlists
- Export data to CSV/JSON
- Advanced search with full-text search
- Social sharing features
- Statistics and analytics dashboard
- Import from other platforms (Letterboxd, IMDb, etc.)

## License

MIT License - feel free to use this project however you'd like!

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the Supabase and TMDB documentation
3. Check browser console and server logs for errors

---

Built with Next.js, Supabase, and TMDB API
