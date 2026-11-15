# 🔥 BurnSet: every set, counted in calories

A Hevy-inspired workout logger that tells you how many calories **each set** burns, and how much body fat that equals.

> 1 kg of body fat ≈ **7,700 kcal**. Weight loss is maths. BurnSet does the maths for you.

## Features

- **Workout logger**: Hevy-style set tables (weight × reps, previous performance, warm-up/drop/failure sets, rest timer with sound and vibration).
- **Live kcal per set**: each row shows its calories as you type, and the header tracks total kcal and grams of fat in real time.
- **Rep explorer**: see what 1, 5, 10, 20 or 30 reps at your weight would burn before you lift.
- **420 exercises**: barbell, dumbbell, machine, cable, bodyweight, kettlebell, Olympic lifts, carries/holds, and 60+ cardio and sports activities. You can also create custom exercises.
- **Burn Lab**: an interactive calculator with sliders, a calorie breakdown, a reps-vs-kcal chart and the full maths shown step by step.
- **Fat-loss planner**: diet deficit plus workouts gives your time to goal and target date.
- **Routines**: Push/Pull/Legs/Fat Burner presets. You can build your own or save any workout as a routine.
- **History and stats**: PR detection (estimated 1RM), weekly calorie chart, totals.
- **PWA**: installable on iOS/Android, works offline, dark/light/auto theme, kg/lb.
- **Private**: all data stays on the device (localStorage), with JSON export/import for backups.

## How calories are calculated

| Type | Formula |
|---|---|
| Strength set | `load × 9.81 × ROM × reps × 1.33 ÷ 0.18 ÷ 4184` (mechanical work) **+** `(MET−1) × bodyweight × time-under-tension` **+** `1 MET × bodyweight × rest time` |
| Cardio | `(MET−1) × bodyweight × hours` with Light/Moderate/Hard METs from the Compendium of Physical Activities |
| Hold / carry | `(MET−1) × (bodyweight + load) × hours` |

- **Load** includes the share of your bodyweight that moves (squat ≈ 85%, push-up ≈ 64%, pull-up = 100%).
- **Net** mode (default) counts only calories *above* resting, which is the right number for fat-loss maths. **Gross** is available in settings.
- Estimates are roughly ±20%. They're good for comparing sets and staying consistent.

## Run locally

No build step. Any static server works:

```bash
python -m http.server 8080
# or
npx serve .
```

Open http://localhost:8080 for the landing page; the app lives at `/app.html`. `app.html?demo` runs a sandboxed demo with sample data that never touches real storage (used by the landing page's phone preview).

## Accounts & sync (Supabase, free tier)

BurnSet runs in **local-only mode** until you add Supabase keys. With keys, users sign up with
username, email, password and a profile picture, and each user's data syncs to their account.

1. Create a free project at https://supabase.com (choose a region near your users).
2. **SQL Editor → New query** → paste `supabase/schema.sql` → **Run**.
3. **Project Settings → API**: copy the *Project URL* and the *anon / publishable* key into `js/config.js`.
4. **Authentication → Sign In / Providers → Email**: for a small private group you can turn
   **Confirm email** off (the built-in email sender is limited to a few emails per hour).
5. **Authentication → URL Configuration**: set *Site URL* to where the app is hosted
   (e.g. `https://your-site.netlify.app/app.html`) and add it under *Redirect URLs*.

How it works: data is cached locally (instant + offline) and synced as one JSON document per user
(`user_data` table). Row Level Security means users can only read/write their own row.
Profile pictures are resized to 320×320 on the device and stored in the `avatars` bucket.

Note: free Supabase projects pause after ~7 days with no activity; unpause from the dashboard.

## Deploy

It's a static site, so deploy the folder as-is:

- **Vercel**: `npx vercel` (uses `vercel.json`)
- **Netlify**: drag the folder into app.netlify.com/drop, or `npx netlify deploy --prod` (uses `netlify.toml`)
- **GitHub Pages**: push to a repo and enable Pages for the root folder
- **Cloudflare Pages**: no build command, output directory `/`

When you ship changes, bump `VERSION` in `sw.js` so installed apps pick up the update.

## Project structure

```
index.html            Landing page (hero, live demo, calculator, FAQ)
app.html              The app
css/landing.css       Landing page styles
js/landing.js         Landing interactions + calculator
css/styles.css        Design system (dark/light, mobile tab bar, desktop sidebar)
js/exercises.js       Exercise database (ROM, bodyweight fraction, MET per exercise)
js/calc.js            Calorie engine
js/app.js             UI, state, routing, charts
js/cloud.js           Supabase auth, sync, profile pictures
js/config.js          Supabase keys (empty = local-only mode)
supabase/schema.sql   Database tables, security policies, storage bucket
sw.js                 Offline service worker
manifest.webmanifest  PWA manifest
icons/                App icons
```
