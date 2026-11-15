# 🏥 CareSync — Smart Elderly Care & Medication Management Platform

> Built for the **Google for Developers x MnM Catalyst Hackathon: PromptWars**  
> *"Going beyond basic reminders to build a smarter, more accessible, reliable, and collaborative healthcare ecosystem."*

[![Deploy to GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-22c55e?logo=github&logoColor=white)](DEPLOYMENT.md#path-1-deploy-frontend-to-github-pages-automated-via-github-actions)
[![Deploy to Cloud Run](https://img.shields.io/badge/Deployment-Google%20Cloud%20Run-4285F4?logo=googlecloud&logoColor=white)](DEPLOYMENT.md#path-2-deploy-to-google-cloud-run-full-stack)
[![Firebase](https://img.shields.io/badge/Database-Cloud%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini%201.5%20Flash-8E75C2?logo=googlegemini&logoColor=white)](https://deepmind.google/technologies/gemini)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Executive Summary

**CareSync** is a unified, accessible healthcare ecosystem designed specifically for elderly individuals, their family members, and medical caretakers. 

Conventional medication apps treat adherence as an isolated alarm clock, which fails elderly patients suffering from cognitive decline, arthritis, visual impairment, or complex multi-drug regimens. CareSync reimagines elderly care with:
1. **Passcode-based care circles** — zero-friction sharing using a simple 6-digit PIN.
2. **Proactive multi-channel email alerts** — automated 24h/1h appointment alerts & missed-dose notifications.
3. **Smart 4-Level Escalation Ladder** — gradual alerts from gentle nudges up to family and doctor escalation.
4. **Google Gemini 1.5 Flash Clinical Suite** — drug-drug interaction checker, prescription label OCR, conversational health assistant with audio TTS, meal interaction scanner, and pill identifier.
5. **Daily Wellness Journal & Shift Handover Notes** — symptom-medication correlations, doctor-ready visit reports, and real-time care circle activity feeds.

---

## 🎯 Alignment with Catalyst Hackathon Scoring Criteria

| Scoring Metric | Weight / Focus | How CareSync Exceeds Expectations |
| :--- | :--- | :--- |
| **Problem Statement Alignment** | High | ✅ Full multi-role RBAC (Patient, Family Member, Caregiver, Doctor), 6-digit passcode care sharing, multi-time medication scheduling, adherence tracking, proactive email reminders for missed doses & upcoming clinical appointments. |
| **Google Services Usage** | **Scored Criterion** | ✅ **Google Cloud Run** (Dockerized serverless API & frontend), **Cloud Firestore** (Real-time NoSQL database with offline persistence), **Firebase Authentication** (Custom RBAC claims & Google OAuth), **Google Gemini 1.5 Flash** (Clinical interaction checking, prescription OCR, conversational health coach), and **Google Cloud Scheduler** (15-min automated cron reminder triggers). |
| **Accessibility (Senior Focus)** | **Scored Criterion** | ✅ 3-step Senior Font Scaler (`A` / `A+` / `A++`), WCAG High-Contrast Mode, minimum 48px touch targets (tremor & arthritis-friendly), and **Web Speech API Text-to-Speech** for audio reading. |
| **Security & Privacy** | High | ✅ SHA-256 hashed care circle passcodes with secret salting, Firebase ID token verification middleware, rate limiting, Helmet HTTP security headers, and CORS restrictions. |
| **Code Quality & Architecture** | High | ✅ Strict TypeScript type safety across both frontend and backend, Next.js 16 App Router, modular services architecture, clean separation of concerns. |
| **Deployment & Reliability** | **Top 10 DQ Rule** | ✅ Dual deployment options: **GitHub Pages** (Automated GitHub Actions workflow) and **Google Cloud Run** (multi-stage production Docker containers). |

---

## 🏗️ Architecture Diagram

```mermaid
flowchart TD
    subgraph Users["👥 Multi-Role Care Circle"]
        Elderly["👴 Elderly Patient\n(Senior-friendly UI)"]
        Family["👨‍👩‍👧 Family Member\n(Care Circle View)"]
        Caregiver["👩‍⚕️ Primary Caregiver\n(Multi-Patient Admin)"]
        Doctor["🩺 Healthcare Provider\n(Clinical Reports)"]
    end

    subgraph Frontend["💻 Frontend (Next.js 16 + Tailwind CSS)"]
        UI["Accessible Responsive UI\n• Font Scaler A/A+/A++\n• High Contrast Toggle\n• Large Touch Targets"]
        Audio["🗣️ Web Speech API\n(Text-to-Speech Playback)"]
        LocalCache["IndexedDB Offline Cache\n(Full Standalone Demo Mode)"]
    end

    subgraph Hosting["🌐 Hosting & Deployment"]
        GHPages["🐙 GitHub Pages\n(Static SPA with GitHub Actions)"]
        CloudRunFront["🚀 Google Cloud Run\n(Frontend SSR Container)"]
    end

    subgraph GCP["☁️ Google Cloud Platform & Backend Services"]
        CloudRun["🚀 Google Cloud Run\n(Node.js Express API Container)"]
        Gemini["🤖 Google Gemini 1.5 Flash\n• Drug Interaction Checker\n• Prescription OCR\n• Food-Drug Meal Scanner\n• AI Pill Identifier\n• Clinical Summary Generator"]
        Firestore["🔥 Cloud Firestore\n(Real-Time NoSQL Database)"]
        FirebaseAuth["🔐 Firebase Auth\n(Passcode Hashing & RBAC)"]
        Scheduler["⏰ Google Cloud Scheduler\n(15-min Automated Cron Triggers)"]
        EmailService["📧 Nodemailer Proactive Engine\n• 24h & 1h Doctor Visit Alerts\n• 4-Level Smart Escalation Ladder\n• 1-Tap SOS Emergency Broadcast"]
    end

    Elderly -->|"1-Tap Dose Check-in"| UI
    Family -->|"Join via 6-Digit PIN"| UI
    Caregiver -->|"Monitor & Log Handover"| UI
    Doctor -->|"Review PDF Reports"| UI

    UI --> Audio
    UI <--> LocalCache
    UI --> GHPages
    UI --> CloudRunFront

    UI -->|"REST API / Bearer Token"| CloudRun
    CloudRun <--> Firestore
    CloudRun <--> FirebaseAuth
    CloudRun --> Gemini
    CloudRun --> EmailService
    Scheduler -->|"POST /api/reminders/process"| CloudRun
```

---

## 💡 Creative Features: Filling Critical Gaps in Elderly Care

Most medication apps stop at a timer notification. CareSync addresses real-world clinical and social challenges faced by elderly patients and caregivers:

### 1. 🔐 Passcode-Based Care Circle Sharing (Slide 13 Requirement)
* Seniors shouldn't have to navigate complex email invitations or OAuth handshakes.
* Eleanor's profile generates a secure 6-digit access PIN (e.g. `482910`).
* Family members, visiting nurses, or emergency contacts enter this code at `/auth/join` to instantly sync into her care circle.

### 2. 🪜 4-Level Smart Escalation Ladder
* Rather than panic alarms, CareSync deploys an intelligent 4-tier escalation model:
  * **Level 1 (0–15 min):** Gentle in-app nudge to patient only.
  * **Level 2 (15–30 min):** Primary caretaker notified via email.
  * **Level 3 (30–60 min):** All registered family circle members notified.
  * **Level 4 (60+ min):** Emergency contacts and primary care physician alerted.

### 3. 📝 Daily Wellness Journal & Symptom-Med Correlation (`/dashboard/wellness`)
* 1-tap emoji mood selector (`😄` `😊` `😐` `😔` `😣`), symptom tag chips (dizziness, nausea, muscle pain), and pain slider (0–10).
* **Gemini Clinical Correlation Engine:** Automatically correlates reported symptoms with active prescriptions (e.g., flags that dizziness may be related to Lisinopril, nausea to Metformin taken without food, or muscle pain to Atorvastatin).

### 4. 📄 Print-Ready Doctor Visit Report (`/dashboard/report`)
* Generates a clinical summary formatted specifically for appointments.
* Includes 7-day adherence rates, active prescriptions table with frequencies, wellness trends, upcoming appointments, and an AI-generated **Gemini Clinical Summary**.
* Built-in `window.print()` styling with clean `@media print` formatting to print or save directly as PDF.

### 5. 💬 Real-Time Care Circle Activity Feed (`/dashboard/carefeed`)
* A WhatsApp-style live timeline keeping family members connected.
* Automatically records medication confirmations, missed-dose notices, appointment alerts, wellness logs, and caregiver messages.
* Shows online status indicators for all care circle members.

### 6. 📋 Caregiver Shift Handover Notes (`/dashboard/handover`)
* Structured shift handovers for families and professional home aides.
* Records shift duration, patient mood, medication status, meals/hydration, vitals (BP/pulse), incidents/fall concerns, and actionable notes for the next caregiver.

### 7. 🤖 Gemini Health Suite (`/dashboard/ai`)
* **Health Chat:** Natural language Q&A personalized to Eleanor's active medications, with Text-to-Speech audio reading.
* **Meal Scanner:** Food-drug interaction analyzer checking items like Grapefruit (Atorvastatin contraindication), Bananas (Lisinopril potassium accumulation), and Oatmeal.
* **Pill Identifier:** Identifies unmarked or dropped pills by physical appearance (shape, color, imprint) with clinical warnings.

---

## 📱 Page Route Map

| Route | Page Name | Primary User & Purpose |
| :--- | :--- | :--- |
| `/` | Landing Page | Overview of features, security, and role-based login links |
| `/auth/login` | Login | Google Sign-in & Email/Password authentication |
| `/auth/register` | Register | 3-step role selection (Patient, Caregiver, Family Member) |
| `/auth/join` | Join Care Circle | 6-digit passcode entry (test with code `482910`) |
| `/dashboard` | Today's Routine | Morning/Afternoon/Evening schedule with large 1-tap dose buttons |
| `/dashboard/medications` | Medications | Medication cards, refill alerts, add modal, drug interaction checker |
| `/dashboard/appointments` | Appointments | Upcoming doctor visits, location, calendar badges, email alert notices |
| `/dashboard/adherence` | Adherence Analytics | 7-day compliance chart, time-of-day stats, streak tracking |
| `/dashboard/wellness` | Wellness Journal | Daily mood, symptom chips, pain slider, Gemini symptom correlations |
| `/dashboard/report` | Doctor Report | Print-ready PDF report for clinical visits |
| `/dashboard/carefeed` | Care Feed | Live timeline of doses, notes, milestones, and member activity |
| `/dashboard/handover` | Shift Handover | Shift-to-shift caregiver notes, vitals, meals, and incident tracking |
| `/dashboard/ai` | Gemini Assistant | 3-tab AI suite: Health Chat (with TTS), Meal Scanner, Pill Identifier |

---

## 🚀 Deployment Options

CareSync is built to deploy easily to both **GitHub Pages** (frontend static hosting) and **Google Cloud Run** (full-stack containerized cloud deployment).

See the full [**DEPLOYMENT.md**](DEPLOYMENT.md) guide for complete instructions.

### 🐙 Option 1: GitHub Pages (Instant Frontend Deployment)

The frontend is ready for GitHub Pages with automatic GitHub Actions deployment:

1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete CareSync platform"
   git remote add origin https://github.com/<USERNAME>/<REPO>.git
   git branch -M main
   git push -u origin main
   ```
2. In your GitHub repository:
   * Go to **Settings** → **Pages**
   * Under **Build and deployment** → **Source**, select **GitHub Actions**
3. GitHub Actions will automatically build the Next.js static export and deploy to:
   `https://<USERNAME>.github.io/<REPO>/`

### ☁️ Option 2: Google Cloud Run (Full Stack)

```bash
# Deploy Backend API
cd caresync-backend
gcloud run deploy caresync-backend --source . --region us-central1 --allow-unauthenticated --port 8080

# Deploy Frontend Container
cd ../caresync-frontend
gcloud run deploy caresync-frontend --source . --region us-central1 --allow-unauthenticated --port 8080
```

Or deploy both at once using Google Cloud Build:
```bash
gcloud builds submit --config cloudbuild.yaml .
```

---

## 🧪 Testing the Live Demo

1. Open the application (locally or on deployed URL).
2. Click **Join with Passcode** on the landing page or header.
3. Enter the demo passcode: **`482910`**.
4. You will instantly be connected to **Eleanor Vance's** care circle with full interactive access:
   * **Take or Skip doses** on Today's Routine.
   * **Check symptoms** on the Wellness Journal and review Gemini's drug correlation.
   * **Print or Save as PDF** the Doctor Visit Report.
   * **Post a message** to Eleanor's Care Feed.
   * **Run food interaction checks** on the Meal Scanner.
   * **Trigger Emergency SOS** with the 5-second countdown safety lock.

---

## 👥 Hackathon Team & Acknowledgements

Built with ❤️ for **Catalyst Hackathon: PromptWars** powered by Google for Developers.  
Special thanks to the Google Antigravity & DeepMind teams for the agentic development environment.
