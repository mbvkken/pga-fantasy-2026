# PGA Championship 2026 Fantasy Leaderboard

Live leaderboard for the office PGA Championship fantasy pool (~21 players, 7 picks each, best 5 count).

**Rules encoded in the app**

- Points = finish position (T3 → 3)
- Missed cut, WD, or DQ → 75 points
- Positions use standard golf ties (T3 counts as 3)
- Team total = sum of the **5 lowest** golfer point totals
- Lower total wins

## Stack

- [Next.js](https://nextjs.org) (TypeScript, App Router)
- [ESPN public PGA scoreboard API](https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard) for live positions (free, no API key)
- Hosted on [Vercel](https://vercel.com)

## Local development

```bash
cd ~/pga-fantasy-2026
npm install
cp .env.example .env.local
# Optional: set CRON_SECRET for testing the cron endpoint locally
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Live scores load automatically from ESPN during the PGA Championship.

## Import teams from Excel

```bash
npm run import:teams -- "/Users/bakken/Downloads/PGA Championship 2026 Chosen 7 - Før start.xlsx"
```

Writes `data/teams.json`. Commit the updated file.

If a golfer name does not match ESPN, add an alias in `data/name-aliases.json`.

## Deploy to Vercel

1. Push this repo to [github.com/mbvkken/pga-fantasy-2026](https://github.com/mbvkken/pga-fantasy-2026)
2. [vercel.com](https://vercel.com) → **Import** the GitHub repo
3. **Environment variable** (Production + Preview):
   - `CRON_SECRET` — random string (`openssl rand -hex 32`)
4. Deploy

No paid API key is required.

## Refresh scores every minute

Vercel Hobby has limited built-in cron. Use a free external scheduler:

1. [cron-job.org](https://cron-job.org) → create job every **1 minute**
2. URL:
   ```
   https://YOUR-APP.vercel.app/api/cron/refresh-scores?secret=YOUR_CRON_SECRET
   ```

The public site polls `/api/leaderboard` every 60 seconds as well.

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/leaderboard` | Full leaderboard JSON |
| `GET /api/leaderboard?force=1` | Bypass 60s server cache |
| `GET /api/cron/refresh-scores?secret=…` | Warm ESPN score cache (cron only) |

## Project structure

```
app/              Pages and API routes
components/       UI
data/teams.json   Participant lineups
lib/              Scoring, ESPN client, leaderboard builder
scripts/          Excel import
```
