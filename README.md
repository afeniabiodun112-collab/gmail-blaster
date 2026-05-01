# Gmail Blaster 📧

Send personalised email campaigns through your real Gmail account. No SMTP, no deliverability headaches — emails sent directly via the Gmail API.

---

## Quick Start

### 1. Clone & Install

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment Variables

**Server** — copy and fill in:
```bash
cp server/.env.example server/.env
```

**Client** — copy and fill in:
```bash
cp client/.env.example client/.env
```

### 3. Set Up Google OAuth (Gmail API)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project called **"Gmail Blaster"**
3. Enable the **Gmail API**:
   - APIs & Services → Library → search "Gmail API" → Enable
4. Create OAuth2 credentials:
   - APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: **Web application**
   - Authorised redirect URIs: `http://localhost:5000/api/gmail/callback`
   - Copy the **Client ID** and **Client Secret**
5. Configure OAuth consent screen:
   - User type: **External**
   - Add your own email as a **Test User**
   - Scopes: add `https://www.googleapis.com/auth/gmail.send`

### 4. Set Up MongoDB Atlas (free tier)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Database Access → Add user with password
4. Network Access → Allow access from anywhere (0.0.0.0/0)
5. Connect → Drivers → Copy connection string
6. Paste into `server/.env` as `MONGODB_URI`

### 5. Fill in server/.env

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gmail-blaster?retryWrites=true&w=majority
JWT_SECRET=any-long-random-string-here
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/gmail/callback
```

### 6. Run

```bash
# Terminal 1 — start backend
cd server && npm run dev

# Terminal 2 — start frontend
cd client && npm run dev
```

Open **http://localhost:5173** 🎉

---

## How to Use

1. **Register** an account at `/register`
2. Go to **Settings** → click **Connect Gmail Account**
3. Approve Google OAuth (you'll be on your test users list)
4. Go to **Dashboard** → **New Campaign**
5. Enter campaign name, subject, body
6. Paste recipient emails (one per line or comma-separated)
7. Save → hit **Start Sending**
8. Watch the live send log update every 5 seconds

---

## Warmup Schedule

Your sender reputation is protected by automatic daily limits:

| Days       | Daily Limit |
|------------|-------------|
| Days 1–3   | 20/day      |
| Days 4–7   | 50/day      |
| Days 8–14  | 100/day     |
| Day 15+    | 200/day     |

- Daily count resets at midnight
- Warmup day increments automatically each day
- 3-second delay between each email

---

## Project Structure

```
gmail-blaster/
├── server/
│   ├── src/
│   │   ├── models/         User, Campaign, SendLog
│   │   ├── routes/         auth, gmail, campaigns
│   │   ├── services/       gmailService, campaignSender
│   │   └── middleware/     auth (JWT verification)
│   ├── index.js
│   ├── package.json
│   └── .env.example
│
└── client/
    ├── src/
    │   ├── pages/          Landing, Login, Register, Dashboard,
    │   │                   NewCampaign, CampaignDetail, Settings
    │   ├── components/     Navbar, GmailStatusBar, CampaignCard,
    │   │                   RecipientInput, SendProgress
    │   ├── hooks/          useAuth
    │   └── lib/            api (axios instance)
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

---

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (7-day tokens)
- **Email:** Gmail API via Google OAuth2
- **Scheduler:** node-cron (midnight reset)

---

## Notes

- Emails send with a 3-second delay between each to avoid spam flags
- Campaign sending runs in the background — the API returns immediately
- If you pause a campaign, it resumes from where it left off
- OAuth tokens auto-refresh (handled by googleapis library)
- The Google OAuth consent screen will say "unverified app" — this is fine for testing. For production, complete Google's verification process.
