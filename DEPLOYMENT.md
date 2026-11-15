# 🚀 CareSync Deployment Guide

This guide covers all deployment paths for **CareSync**:
1. **GitHub Pages Deployment (Frontend Static SPA)** — Free, automated with GitHub Actions, instant live demo.
2. **Google Cloud Run Deployment (Frontend & Backend)** — Serverless containerized deployment (Catalyst Hackathon requirement).
3. **Environment Variables & API Keys Setup** (Google Gemini, Firebase, Nodemailer).

---

## 🌐 Path 1: Deploy Frontend to GitHub Pages (Automated via GitHub Actions)

The frontend is built with Next.js 16 App Router and statically exported into pure HTML/CSS/JS with full client-side state and offline demo capabilities.

### Method A: Automated GitHub Actions (Recommended)

A GitHub Actions workflow is already configured at [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml).

#### Step-by-Step Instructions:

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete CareSync platform with GitHub Pages deploy workflow"
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPO_NAME>.git
   git branch -M main
   git push -u origin main
   ```

2. **Enable GitHub Pages in your repository settings**:
   * Navigate to your repo on GitHub: `https://github.com/<YOUR_USERNAME>/<YOUR_REPO>/settings/pages`
   * Under **Build and deployment**:
     * **Source**: Select **GitHub Actions** (NOT "Deploy from a branch").
   * That's it! Every time you push to `main` or `master`, GitHub Actions will automatically:
     1. Set up Node 20
     2. Install dependencies
     3. Export static HTML with the correct repository subpath (`NEXT_PUBLIC_BASE_PATH`)
     4. Generate `.nojekyll` to preserve `_next` assets
     5. Deploy directly to `https://<YOUR_USERNAME>.github.io/<YOUR_REPO>/`

3. **View your live website**:
   * Go to `https://<YOUR_USERNAME>.github.io/<YOUR_REPO>/`
   * Test the interactive demo immediately with passcode `482910`!

---

### Method B: Manual Build & Push to `gh-pages` Branch

If you prefer building locally and deploying using `gh-pages`:

```bash
# 1. Navigate to frontend
cd caresync-frontend

# 2. Build static export with your repository subpath
# Replace <YOUR_REPO_NAME> with your repository name, e.g., /caresync
$env:GITHUB_PAGES="true"
$env:NEXT_PUBLIC_BASE_PATH="/<YOUR_REPO_NAME>"
npm run build

# 3. Create .nojekyll in out directory
New-Item -ItemType File -Path out\.nojekyll -Force

# 4. Deploy using npx gh-pages
npx gh-pages -d out -t true
```

---

## ☁️ Path 2: Deploy to Google Cloud Run (Full Stack)

Google Cloud Run satisfies the Catalyst Hackathon page 13 deployment requirement. Both `caresync-frontend` and `caresync-backend` have optimized multi-stage Dockerfiles.

### Prerequisites:
* [Google Cloud SDK (`gcloud`)](https://cloud.google.com/sdk/docs/install) installed and logged in.
* A GCP project with Billing and Cloud Run API enabled:
  ```bash
  gcloud auth login
  gcloud config set project YOUR_GCP_PROJECT_ID
  gcloud services enable run.googleapis.com cloudbuild.googleapis.com
  ```

### Option A: One-Command Cloud Build (Deploy Both Services)

Run the included `cloudbuild.yaml` from the project root:

```bash
gcloud builds submit --config cloudbuild.yaml .
```

### Option B: Deploy Backend & Frontend Individually

#### 1. Deploy the Backend API:
```bash
cd caresync-backend

gcloud run deploy caresync-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars="NODE_ENV=production,FIREBASE_PROJECT_ID=YOUR_PROJECT_ID,GEMINI_API_KEY=YOUR_GEMINI_KEY,EMAIL_USER=your_email@gmail.com,EMAIL_APP_PASSWORD=your_app_password,SCHEDULER_SECRET=your_cron_secret"
```
Take note of the Backend URL (e.g., `https://caresync-backend-xyz.a.run.app`).

#### 2. Deploy the Frontend:
```bash
cd ../caresync-frontend

gcloud run deploy caresync-frontend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars="NEXT_PUBLIC_API_URL=https://caresync-backend-xyz.a.run.app"
```

---

## ⏰ Path 3: Setting Up Google Cloud Scheduler (Proactive Reminders)

To run automated 15-minute medication reminder checks and missed-dose escalation emails:

```bash
gcloud scheduler jobs create http caresync-reminder-cron \
  --schedule="*/15 * * * *" \
  --uri="https://caresync-backend-xyz.a.run.app/api/reminders/process" \
  --http-method=POST \
  --headers="x-scheduler-secret=your_cron_secret" \
  --time-zone="America/New_York"
```

---

## 🔑 Environment Variables Reference

### Backend (`caresync-backend/.env`)

| Variable | Description |
| :--- | :--- |
| `PORT` | Port for the Express server (default `8080` for Cloud Run) |
| `NODE_ENV` | `development` or `production` |
| `FIREBASE_PROJECT_ID` | Your GCP / Firebase project ID |
| `GEMINI_API_KEY` | Google Gemini API key from [Google AI Studio](https://aistudio.google.com/) |
| `EMAIL_USER` | Gmail address for sending automated email notifications |
| `EMAIL_APP_PASSWORD` | Gmail App Password (16-char token generated under Google Account Security) |
| `PASSCODE_SALT` | Secret salt used for SHA-256 care circle passcode hashing |
| `SCHEDULER_SECRET` | Secret token verified in `x-scheduler-secret` header from Cloud Scheduler |

### Frontend (`caresync-frontend/.env.local`)

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_BASE_PATH` | Subpath for GitHub Pages (e.g. `/caresync`). Set automatically by GitHub Actions |
| `GITHUB_PAGES` | Set to `"true"` when exporting for GitHub Pages static hosting |
| `NEXT_PUBLIC_API_URL` | Backend API URL (optional in demo mode, falls back to local state) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`| Firebase Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |

> 💡 **Demo Mode:** When running without Firebase or Backend credentials, the frontend runs in **Full Interactive Demo Mode** with pre-populated demo data for Eleanor Vance, complete with 4 medications, 2 upcoming appointments, adherence analytics, a wellness journal, care feed, and shift handover records. Use passcode `482910` to join her care circle.
