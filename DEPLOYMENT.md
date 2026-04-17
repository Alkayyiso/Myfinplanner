# Deployment Guide
## Jabodetabek Family Financial Planner
### Stack: GitHub + Vercel + Supabase

---

## Overview

```
Your code  →  GitHub repo  →  Vercel (auto-deploy on push)
                                    ↕
                              Supabase (Postgres database)
```

Every time you push code to GitHub, Vercel automatically rebuilds and redeploys.
Supabase stores vault scenario data per anonymous user session.

---

## PART 1 — Supabase Setup (do this first)

### 1.1 Run the database migration

1. Go to https://supabase.com/dashboard
2. Open your project: **msaepoiznrqkvjdcoikj**
3. In the left sidebar → click **SQL Editor**
4. Click **New Query**
5. Open the file `migration.sql` from this project
6. Paste the entire contents into the SQL editor
7. Click **Run** (or press Cmd+Enter / Ctrl+Enter)

You should see: `Success. No rows returned.`

### 1.2 Verify the tables were created

Still in SQL Editor, run:

```sql
select table_name from information_schema.tables where table_schema = 'public';
```

You should see `vault_scenarios` and `screening_profiles` in the results.

### 1.3 Enable anonymous sign-ins

1. In Supabase dashboard → left sidebar → **Authentication**
2. Click **Providers**
3. Find **Anonymous Sign-ins** and toggle it **ON**
4. Click Save

This lets users save vault data without creating an account.

---

## PART 2 — GitHub Setup

### 2.1 Create a new repository

Option A — via GitHub website:
1. Go to https://github.com/new
2. Repository name: `jabodetabek-planner` (or whatever you like)
3. Set to **Private** (recommended — your Supabase keys are in .env.local which is gitignored, but keep the repo private anyway)
4. Do NOT initialize with README, .gitignore, or license (we have our own)
5. Click **Create repository**

Option B — via GitHub CLI (if you have it):
```bash
gh repo create jabodetabek-planner --private
```

### 2.2 Set up your local project

Run these commands in your terminal, in the folder where you want the project to live:

```bash
# 1. Create the Vite project
npm create vite@latest jabodetabek-planner -- --template react
cd jabodetabek-planner

# 2. Install dependencies (including Supabase)
npm install
npm install @supabase/supabase-js
```

### 2.3 Copy in all the project files

Replace and add files so your src/ looks exactly like this:

```
jabodetabek-planner/
  index.html                        ← replace generated one
  package.json                      ← replace generated one
  vite.config.js                    ← replace generated one
  .gitignore                        ← replace generated one
  .env.local                        ← NEW (never commit this)
  migration.sql                     ← NEW (for reference, already run)
  src/
    main.jsx                        ← replace generated one
    App.jsx                         ← your App.jsx
    lib/
      supabaseClient.js             ← NEW
    hooks/
      useVault.js                   ← NEW
    data/
      knowledge.js                  ← from previous session
      copy.js                       ← from previous session
    engine/
      index.js                      ← from previous session
    components/
      shared/
        index.jsx                   ← your shared.jsx (rename to index.jsx)
```

You can delete these Vite-generated files you don't need:
- src/App.css
- src/index.css  (unless you want it — index.html doesn't import it)
- src/assets/react.svg
- public/vite.svg

### 2.4 Test locally first

```bash
npm run dev
```

Open http://localhost:5173

Go through the full screening flow and try saving a scenario to the vault.
Check your Supabase dashboard → Table Editor → vault_scenarios to confirm rows appear.

If it works locally, proceed to deploy.

### 2.5 Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add your GitHub repo as remote
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/jabodetabek-planner.git

# Stage all files
git add .

# Double-check .env.local is NOT staged (it should be gitignored)
git status
# You should NOT see .env.local in the list

# Commit
git commit -m "Initial commit: Jabodetabek family financial planner"

# Push
git push -u origin main
```

If your default branch is `master` instead of `main`:
```bash
git push -u origin master
```

---

## PART 3 — Vercel Deployment

### 3.1 Connect Vercel to GitHub

1. Go to https://vercel.com
2. Sign up or log in (use "Continue with GitHub" — simplest)
3. Click **Add New Project**
4. Click **Import Git Repository**
5. Find `jabodetabek-planner` in the list → click **Import**

### 3.2 Configure the project

On the configuration screen:

- **Framework Preset**: Vite (should auto-detect)
- **Root Directory**: `./` (leave as default)
- **Build Command**: `npm run build` (leave as default)
- **Output Directory**: `dist` (leave as default)
- **Install Command**: `npm install` (leave as default)

### 3.3 Add environment variables (CRITICAL)

Still on the configuration screen, scroll down to **Environment Variables**.

Add these two variables:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://msaepoiznrqkvjdcoikj.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zYWVwb2l6bnJxa3ZqZGNvaWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNDE0NzEsImV4cCI6MjA5MTkxNzQ3MX0.CSwfuy7Infpr_lYHx1YphcDNRP43JKZ7BsrYnixUsT0` |

Make sure both are set for **Production**, **Preview**, and **Development** environments.

### 3.4 Deploy

Click **Deploy**.

Vercel will:
1. Clone your repo
2. Run `npm install`
3. Run `npm run build`
4. Deploy to a URL like `https://jabodetabek-planner.vercel.app`

This takes about 60–90 seconds.

### 3.5 Your live URL

After deployment you get a URL like:
```
https://jabodetabek-planner-yourusername.vercel.app
```

You can add a custom domain in Vercel settings if you have one.

---

## PART 4 — Every future update

After this initial setup, the workflow for any code change is just:

```bash
# Make your changes to any file
git add .
git commit -m "describe what you changed"
git push
```

Vercel auto-detects the push and redeploys in ~60 seconds. No manual steps.

---

## Troubleshooting

### "Missing env vars" error in browser console
→ Your env vars aren't set in Vercel. Go to Vercel → Project → Settings → Environment Variables and add them, then redeploy.

### Vault not saving (no rows in Supabase)
→ Check: (1) Anonymous sign-ins enabled in Supabase Auth settings, (2) migration.sql was run successfully, (3) RLS policies were created (check Supabase → Table Editor → vault_scenarios → Policies tab)

### Build fails on Vercel
→ Check the build logs. Most common cause: a file import path is wrong (case-sensitive on Linux). Make sure `index.jsx` is spelled exactly right in imports.

### "relation does not exist" error from Supabase
→ The migration didn't run, or ran with an error. Go back to SQL Editor and run migration.sql again.

### Local dev works but Vercel doesn't
→ Almost always an env var issue. Verify both VITE_ variables are set in Vercel's environment variable settings.

---

## File reference — what each file does

| File | Purpose |
|------|---------|
| `src/lib/supabaseClient.js` | Supabase client + anonymous session management |
| `src/hooks/useVault.js` | Vault CRUD operations against Supabase |
| `src/data/knowledge.js` | All financial constants from the 5 modules |
| `src/data/copy.js` | All bilingual strings + t() resolver |
| `src/engine/index.js` | Pure financial calculation functions |
| `src/components/shared/index.jsx` | All reusable UI components |
| `src/App.jsx` | Main app: all 5 sections wired together |
| `migration.sql` | Database schema — run once in Supabase SQL Editor |
| `.env.local` | Local env vars — NEVER commit to git |

---

## Security notes

- The Supabase **anon key** is safe to expose in frontend code — it's designed to be public
- Row Level Security (RLS) ensures each anonymous user can only see their own vault rows
- Never use the Supabase **service_role** key in frontend code (you don't need it here)
- The `.gitignore` already excludes `.env.local` — verify with `git status` before pushing
