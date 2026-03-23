# StyleNest AI

AI-powered interior design platform. Upload a room photo, get AI-generated redesigned interiors, and customize your space in an interactive 3D canvas.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), Tailwind CSS v4, Framer Motion, React Three Fiber |
| Backend | Node.js, Express |
| Database & Auth | Supabase (PostgreSQL + Auth + Storage) |
| AI APIs | Replicate (Stable Diffusion + ControlNet), Gemini (style suggestions) |

---

## Quick Start

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run:

```sql
CREATE TABLE designs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_image TEXT,
  generated_image TEXT,
  style TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own designs"
  ON designs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own designs"
  ON designs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs"
  ON designs FOR DELETE USING (auth.uid() = user_id);
```

3. Go to **Storage** → Create a bucket named `images` (set to Public)
4. Copy your **Project URL** and **Anon Key** from Settings → API

### 2. Environment Variables

**Frontend** (`client/.env`):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Backend** (`server/.env`):
```
REPLICATE_API_TOKEN=your-replicate-api-token
GEMINI_API_KEY=your-gemini-api-key
PORT=3001
```

> **Note:** The app works in demo mode without API keys — AI endpoints return sample data.

### 3. Install & Run

```bash
# Frontend
cd client
npm install
npm run dev

# Backend (separate terminal)
cd server
npm install
node index.js
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:3001`.

---

## Project Structure

```
StyleNest/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components (Sidebar)
│   │   ├── hooks/             # useAuth context
│   │   ├── pages/             # All page components
│   │   │   ├── LandingPage    # Hero, steps, gallery, pricing
│   │   │   ├── AuthPage       # Login / Signup
│   │   │   ├── Dashboard      # My Designs grid
│   │   │   ├── UploadGenerate # Upload + style select + generate
│   │   │   ├── ResultView     # Before/After slider
│   │   │   └── Canvas3D       # 3D room customization
│   │   └── services/          # Supabase client
│   └── .env.example
├── server/                    # Express Backend
│   ├── routes/
│   │   ├── generate.js        # Replicate API (image generation)
│   │   └── styles.js          # Gemini API (style suggestions)
│   ├── index.js               # Entry point
│   └── .env.example
└── README.md
```

## Features

- **Auth**: Email/password + Google OAuth via Supabase
- **AI Generation**: Upload room → get redesigned interior
- **Before/After Slider**: Interactive comparison view
- **3D Canvas**: Place furniture, change colors, orbit camera
- **Dashboard**: View, download, and manage saved designs
- **Responsive UI**: Premium glassmorphism design with animations
