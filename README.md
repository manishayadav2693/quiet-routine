# The Quiet Routine — PWA Setup Guide

Your fitness + habits tracker, ready to deploy as a real installable phone app.

## What you have

A complete Progressive Web App with:
- **Fitness module** — pre-loaded workout plan, AI coach, travel toggle, progress tracking
- **Habits module** — daily checklist with streak counters, drag-to-reorder, custom reminder notes
- Persistent local storage on your phone (data stays even when you close the app)
- Full offline support
- Add-to-Home-Screen install prompts

---

## Deployment in 3 steps (about 10 minutes)

### Step 1: Create a free GitHub account
Go to **github.com** and sign up if you don't have an account. Free tier is fine.

### Step 2: Upload the code

**Option A — Easiest (no command line):**
1. On GitHub, click the green **"New"** button to create a repository
2. Name it `quiet-routine` (or anything you want), keep it Public
3. Click **"Create repository"**
4. On the next page, click **"uploading an existing file"** link
5. **Drag the entire `quiet-routine-pwa` folder contents** into the upload box
6. Scroll down, click **"Commit changes"**

**Option B — If you have terminal experience:**
```bash
cd quiet-routine-pwa
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/quiet-routine.git
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to **vercel.com** and sign up with your GitHub account (one click)
2. Click **"Add New Project"**
3. Find your `quiet-routine` repository and click **"Import"**
4. Vercel will auto-detect Vite settings. **Don't change anything**, just click **"Deploy"**
5. Wait ~1 minute. Vercel gives you a URL like `https://quiet-routine-xyz.vercel.app`

That URL is your live app.

---

## Install on your phone

### iPhone (Safari)
1. Open the Vercel URL in **Safari** (not Chrome)
2. Tap the **Share icon** (the box with arrow at the bottom)
3. Scroll down, tap **"Add to Home Screen"**
4. Tap **"Add"** in the top right

The app now lives on your home screen, opens fullscreen, and works exactly like a native app.

### Android (Chrome)
1. Open the Vercel URL in **Chrome**
2. You'll see an "Install" banner pop up — tap **Install**
3. Or: tap the three-dot menu → **"Install app"** / **"Add to Home Screen"**

---

## Setting up the AI Coach (optional)

The fitness AI coach uses Claude. To enable it:

1. Go to **console.anthropic.com**, sign up
2. Go to **API Keys** → **Create Key**
3. Copy the key (starts with `sk-ant-...`)
4. In your app, tap **Settings** (gear icon, top right)
5. Paste the API key, tap **Save**

The key stays only on your phone — never sent anywhere except Anthropic's API. Each AI Coach analysis costs ~$0.01–0.02 (roughly ₹1–2).

---

## Backing up your data

Your training history and habit streaks are stored only on your phone. If you change phones or lose data, you lose everything.

**Once a month or so:**
1. Tap **Settings** → **Export JSON**
2. Save the file somewhere safe (email it to yourself, save to Drive, etc.)

To restore: Settings → **Restore** → pick the backup file.

---

## Updating the app

Any changes you push to GitHub auto-deploy to Vercel within a minute. So if you ask me later for changes, I'll give you new files, you replace them on GitHub, and your app updates automatically — no app store review, no manual install.

---

## Troubleshooting

**"My data disappeared"** — Did you switch browsers? Local storage is per-browser. Always use the installed app (home screen icon), not Safari/Chrome separately.

**"AI Coach says API error"** — Check your API key is correct in Settings. If you've used your free Anthropic credits, you'll need to add a payment method on console.anthropic.com.

**"The install banner doesn't appear on iPhone"** — iOS doesn't show one automatically. You have to manually use Share → Add to Home Screen as described above.

**"Want to use it on multiple devices?"** — Open the same Vercel URL on each device and install separately. Data won't sync between devices automatically (would need a backend for that). Use the export/restore flow to move data manually.
