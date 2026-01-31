# Quick Start Guide

Get your Content Review Database up and running in 5 minutes!

## 1. Install Dependencies

```bash
cd content-review-db
npm install
```

## 2. Set Up Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor
4. Copy/paste contents of `supabase-setup.sql` and run it
5. Go to Settings → API and copy:
   - Project URL
   - anon/public key

## 3. Get TMDB API Key

1. Sign up at [themoviedb.org](https://www.themoviedb.org/)
2. Go to Settings → API
3. Request API key (free)
4. Copy the API key

## 4. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
TMDB_API_KEY=your-tmdb-api-key
ADMIN_PASSWORD=choose-a-secure-password
```

## 5. Run It!

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 6. Add Your First Entries

1. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Enter your admin password
3. Click "Bulk Import"
4. Paste entries like:
   ```
   The Shawshank Redemption - 5
   Inception - 4.5
   Breaking Bad - 5
   ```
5. Select year, parse, auto-lookup, and import!

## Deploy to Vercel (Optional)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add same environment variables
4. Deploy!

---

That's it! See README.md for detailed documentation.
