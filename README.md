# UGCora Studio — AI UGC Video Creator

[![Powered by MuAPI](https://img.shields.io/badge/Powered%20by-MuAPI-6366f1?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMSAxNHYtNGgtMnYtMmg0djZoLTJ6bTAtOFY2aDJ2MmgtMnoiLz48L3N2Zz4=)](https://muapi.ai?utm_source=github&utm_medium=badge&utm_campaign=open-ai-ugc)


> **The free, open-source alternative to Arcads and MakeUGC.** Generate AI UGC video ads with realistic AI actors using 4+ state-of-the-art video models — no per-seat pricing, no locked actor library, no vendor watermark.

**Community:** Join [Reddit](https://reddit.com/r/muapi) & [Discord](https://discord.gg/QhTrNRU4r3) for discussions and support

> 🤖 **Automate UGC ad generations with AI coding agents:** [muapi-skills](https://github.com/SamurAIGPT/muapi-skills) — a library of skills that let agents like **Claude Code**, **Codex**, and other coding assistants drive image/video models end-to-end (script → generate → review → re-render) directly from your terminal. Perfect for shipping 100 ad variants overnight without touching a UI.

### Related projects

> **Open-source Node based workflow builder** -> https://github.com/SamurAIGPT/Vibe-Workflow

> **Open-source AI Clipping — turn any long-form YouTube video into viral-ready vertical shorts** -> https://github.com/SamurAIGPT/AI-Youtube-Shorts-Generator

> **Open-source AI Design Agent** -> https://github.com/Anil-matcha/Open-AI-Design-Agent

> **Schedule your UGC content automatically with AI** -> https://github.com/Anil-matcha/Free-AI-Social-Media-Scheduler

> **Learn to monetize AI-generated content like this** -> https://github.com/Anil-matcha/ai-creator-academy

<p align="center">
  <a href="https://github.com/Anil-matcha/awesome-generative-ai-apps">
    <img src="https://img.shields.io/badge/Part%20of-Awesome%20Generative%20AI%20Apps-FFD700?style=for-the-badge&logo=github&logoColor=black" alt="Awesome Generative AI Apps">
  </a>
</p>

> 🎨 **[Explore 50+ more open-source AI apps →](https://github.com/Anil-matcha/awesome-generative-ai-apps)**

https://github.com/user-attachments/assets/eb7d4b61-af97-4a06-9afb-bd56a99de8fb

## 🌐 Live Demo & Deploy

**Live Demo:** [open-ai-ugc.vercel.app](https://open-ai-ugc.vercel.app/)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/obsifem-dotcom/Open-AI-UGC)


**Follow** the [creator](https://x.com/matchaman11) for updates

---

**UGCora Studio** is an AI-powered UGC video ad studio based on the open-source Open AI UGC project. Paste a script, upload reference images, pick a model, and create social-ready video ads. Powered by [Muapi.ai](https://muapi.ai?utm_source=github&utm_medium=readme&utm_campaign=open-ai-ugc), it supports image-to-video and text-to-video generation with models such as **Veo 3.1**, **Seedance 2**, **Grok Video**, and **Happy Horse 1**.

**Why UGCora Studio?**
- **Free & open-source** — no $110–$500/mo subscription, no vendor lock-in
- **Bring your own actors** — upload any face or product image instead of being locked to a vendor roster
- **Model choice** — switch between Veo 3.1, Seedance 2, Grok Video, and Happy Horse 1 per render
- **No watermark, no branding** — 100% your domain, your studio, your client deliverables
- **Self-hosted** — your data and renders stay on your infra, full creative control
- **Customizable credits** — credit packages can be enabled when billing is configured
- **Extensible** — add any MUAPI model in ~10 lines, modify the UI, build agencies on top of it

---

## ✨ Features

- **AI UGC Video Studio** — Paste a script, optionally upload up to 7 reference images (faces, products, scenes), pick a model, and generate a 9:16 vertical UGC ad. Reference images inline with `@image1`, `@image2`, etc.
- **Multi-model support** — 4 leading video models pre-wired: Veo 3.1 (Google), Seedance 2 (ByteDance), Grok Video (xAI), and Happy Horse 1. Switch per render.
- **Image-to-Video & Text-to-Video** — MuAPI endpoints are selected according to whether you upload reference images. Seedance 2 requires an image; Grok, Veo 3.1, and Happy Horse support both modes.
- **Per-model parameter control** — Aspect ratio (9:16, 16:9, 1:1, etc.), duration (3–30s), resolution (480p → 4K), and mode (fun / normal / spicy for Grok) — UI adapts automatically to each model's capabilities.
- **Async job pipeline** — MUAPI delivers finished renders via webhook; the dashboard polls and updates live without page reloads.
- **Creations dashboard** — Every generation is persisted per user with prompt, settings, status, and final video URL.
- **Credits system** — Each user starts with 10 free credits; 1 credit per generation; insufficient-credit gating built in.
- **Payments** — intentionally disabled for the current launch; credit packages are marked as coming soon.
- **GitHub sign-in** — NextAuth.js with Prisma adapter, ready to go.
- **Responsive UI** — Tailwind v4 + Framer Motion, works on desktop and mobile, glassmorphism design.

### 🎬 UGC Video Generation — Dual Mode

The studio automatically adapts based on whether you upload reference images:

| Mode | Trigger | Use case | Prompt |
| :--- | :--- | :--- | :--- |
| **Text-to-Video** | No image uploaded | Generate a UGC ad purely from a script | Required |
| **Image-to-Video** | Reference image(s) uploaded | Animate a specific actor face / product shot / scene | Optional |

#### Supported Models

| Model | Provider | Type | Aspect Ratios | Duration | Resolution | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Veo 3.1** | Google | T2V / I2V | 16:9, 9:16 | 8s | 720p / 1080p / 4K | High-fidelity, realistic motion — best for premium client ads |
| **Seedance 2** | ByteDance | I2V | 21:9, 16:9, 4:3, 1:1, 3:4, 9:16 | 4–15s | — | Requires a reference image |
| **Grok Video** | xAI | T2V / I2V | 9:16, 16:9, 2:3, 3:2, 1:1 | 6–30s | 480p / 720p | Modes: fun / normal / spicy — strong for high-CTR hooks |
| **Happy Horse 1** | — | T2V / I2V | 16:9, 9:16, 1:1, 4:3, 3:4 | 3–15s | 720p | Fast, lifelike animation — great for batch iteration |

Adding a new MUAPI model takes ~10 lines in `src/app/page.js` (append to the `MODELS` array) and one line in `src/app/api/generate/route.js` (add to `MODEL_ENDPOINTS`).

### 🖼️ Multi-Image Reference Input

UGC ads frequently need multiple references — actor face + product + setting. UGCora Studio supports up to **7 reference images per generation**:

- **Drag-and-drop or click** to upload — images upload asynchronously with live status pills
- **Inline references** in your script — `@image1 holding the bottle, walking through @image2`
- **Per-image previews** with one-click removal
- **Auto-routing** — images are sent as `image_url` or `images_list` according to the selected MUAPI endpoint; text-to-video endpoints receive no image fields

### 💳 Credits and Payments

The app includes a credit system. Online purchases are not enabled in this deployment; packages are shown as coming soon.

| Plan | Price | Credits | Target |
| :--- | :--- | :--- | :--- |
| **Starter** | Free | 10 | Trial users |
| **Pro Studio** | $19.99/mo | 500 | Solo creators / freelancers |
| **Elite Creator** | $49.99/mo | 1,500 | Agencies / power users |

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- A PostgreSQL database (free tiers on [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))
- A [Muapi.ai access key](https://muapi.ai/access-keys?utm_source=github&utm_medium=readme&utm_campaign=open-ai-ugc) — copy the generated key value, not the label
- An optional [GitHub OAuth app](https://github.com/settings/developers) for social sign-in

### Setup

```bash
# Clone the repo
git clone https://github.com/obsifem-dotcom/Open-AI-UGC.git
cd Open-AI-UGC

# Install dependencies
npm install

# Copy env template and fill in the values
cp .env.example .env

# Push the Prisma schema to your database
npx prisma db push

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with a configured OAuth provider or MuAPI key, and start generating. Every new user starts with 10 free credits.

### Environment Variables

```env
# Postgres (Neon / Supabase / Railway / self-hosted)
DATABASE_URL="postgresql://user:password@host:port/dbname"
DIRECT_URL="postgresql://user:password@host:port/dbname"

# NextAuth — generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."

# Optional GitHub OAuth — create an OAuth App at https://github.com/settings/developers
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
NEXT_PUBLIC_GITHUB_CLIENT_ID="..."  # Same client ID; enables the GitHub sign-in button
# Set the OAuth App callback URL to http://localhost:3000/api/auth/callback/github
# For production, use https://your-domain.com/api/auth/callback/github instead.

# MUAPI — https://muapi.ai/access-keys?utm_source=github&utm_medium=readme&utm_campaign=open-ai-ugc
# Optional public HTTPS base URL for MuAPI callbacks; local development uses polling.
WEBHOOK_URL="https://your-deployment-url.com"

# UI
NEXT_PUBLIC_THEME=light
```

### Production Build

```bash
npm run build
npm run start
```

## ⚡ Deployment: Vercel & Production

This architecture is engineered explicitly for **Vercel** serverless environments.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/obsifem-dotcom/Open-AI-UGC)

### 🚀 Launching on Vercel: Step-by-Step

1. **Database Provisioning**: Create a new Postgres database (via Supabase or Neon) and retrieve connection URLs.
2. **Project Creation**: Import your GitHub repository (`https://github.com/obsifem-dotcom/Open-AI-UGC`) into the Vercel dashboard.
3. **Configure Environment Variables**: Add all variables from `.env.example` in Vercel. Set `WEBHOOK_URL` to your Vercel deployment URL (e.g. `https://open-ai-ugc.vercel.app`).
4. **Deploy**: Build with Vercel. Next.js page generation will run Prisma client generation automatically via our script config.
5. **Database Push**: Run `npx prisma db push` to synchronize database models before launching.
6. **Webhooks Setup**:
   - Configure the MuAPI Webhook pointing to `https://open-ai-ugc.vercel.app/api/webhook/muapi`.

## 🏗️ Architecture

```
Open-AI-UGC/
├── src/
│   ├── app/
│   │   ├── layout.js                       # Root layout (Tailwind, NextAuth provider, Navbar)
│   │   ├── page.js                         # Main UGC generator — model picker, prompt, image upload
│   │   ├── dashboard/page.js               # User's generation history
│   │   ├── pricing/page.js                 # Credit packages (payments coming soon)
│   │   └── api/
│   │       ├── generate/route.js           # POST — kick off a UGC video generation
│   │       ├── upload/route.js             # POST — image upload → hosted URL
│   │       ├── creations/route.js          # GET — list user's creations
│   │       ├── creations/[id]/route.js     # GET — single creation (polled by frontend)
│   │       ├── webhook/muapi/route.js      # POST — MUAPI render-complete callback
│   │       ├── webhook/stripe/route.js     # Disabled until payments are enabled
│   │       ├── checkout/stripe/route.js    # Disabled until payments are enabled
│   │       └── auth/[...nextauth]/route.js # NextAuth handler
│   ├── components/
│   │   ├── saas/Navbar.jsx                 # Top nav with credits badge & profile menu
│   │   ├── saas/AuthButtons.jsx
│   │   └── ui/                             # Button, Card primitives
│   └── lib/
│       ├── auth.js                         # NextAuth config (GitHub + Prisma adapter)
│       └── prisma.js                       # Prisma client singleton
├── prisma/
│   └── schema.prisma                       # User, Creation, Account, Session, VerificationToken
└── package.json
```

## 🔌 API Integration

UGCora Studio communicates with [Muapi.ai](https://muapi.ai?utm_source=github&utm_medium=readme&utm_campaign=open-ai-ugc) using MuAPI's asynchronous submit-and-poll API, with an optional HTTPS callback:

1. **Submit** — `POST /api/v1/{model-endpoint}` with the model's supported parameters; the endpoint switches between text-to-video and image-to-video where available
2. **Wait** — MUAPI runs the render asynchronously (8s–2min depending on model and duration)
3. **Callback** — on public HTTPS deployments, MuAPI calls the URL passed in the `webhook` query parameter; local development uses polling
4. **Update** — `/api/webhook/muapi/route.js` finds the matching `Creation` row by `request_id` and updates its status + URL
5. **Poll** — the frontend polls `/api/creations/[id]` every 3 seconds and switches from spinner to video player as soon as status flips

Authentication uses the `x-api-key` header. Credits are decremented on submit (so failed renders cost a credit — you can adjust this in `src/app/api/generate/route.js` if you'd rather refund on failure).

## 🛠️ Tech Stack

- **Next.js 16** — App Router, server components, React 19
- **React 19** — Studio UI
- **Tailwind CSS v4** — Utility-first styling
- **Framer Motion** — Animations and transitions
- **Prisma 7** — Type-safe Postgres ORM
- **NextAuth.js** — GitHub OAuth with Prisma adapter
- **Payments** — disabled until a payment provider is configured
- **Muapi.ai** — AI video model API gateway (Veo, Seedance, Grok, Happy Horse, and more)

## 🤔 How is this different from Arcads and MakeUGC?

**UGCora Studio**, based on the Open AI UGC project, is an open-source alternative for creating UGC-style video ads.

| | Arcads / MakeUGC | **UGCora Studio** |
| :--- | :--- | :--- |
| **Cost** | $110–$500+/mo per seat | Free (open-source) — pay only for MUAPI API usage |
| **Actor library** | Locked to vendor's roster | Bring your own — any face or product image |
| **Model choice** | Single in-house model | Veo 3.1, Seedance 2, Grok Video, Happy Horse 1 (swap per render) |
| **Hosted version** | SaaS only | Self-host on Vercel / your own infra |
| **White-label** | Vendor branding / templates | 100% your brand, your domain, your client deliverables |
| **Custom pricing** | Fixed tiers | Credit packages are displayed; online payment is not enabled yet |
| **Source code** | Closed | MIT licensed, fully hackable |
| **Data privacy** | Cloud-only | Your renders and user data stay on your infra |
| **Reseller-friendly** | No | Yes — built to be cloned, rebranded, and sold |

## 📄 License

MIT — fork it, rebrand it, ship it.

## 🙏 Credits

Built with [Muapi.ai](https://muapi.ai?utm_source=github&utm_medium=readme&utm_campaign=open-ai-ugc) — the unified API for AI image and video generation models.

---

*UGCora Studio is a self-hostable AI UGC video ad studio you can customize for your workflow and brand.*
