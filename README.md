# ⚔️ AI Code Dungeon

> **Platform gamifikasi belajar coding berbasis RPG Dungeon Crawler — diberdayakan oleh EdgeOne AI**

Belajar coding tidak harus membosankan. Di AI Code Dungeon, kamu berperan sebagai **Code Hero** yang menjelajahi dungeon penuh quest coding. Selesaikan misi, naiki level, kumpulkan XP, dan hadapi Boss Challenge bersama **Sage** — AI Mentor yang membimbingmu tanpa spoil jawaban.

> 🏆 Dibuat untuk **CODEPOLITAN × Tencent EdgeOne Hackathon**

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 🗺️ **Dungeon Map** | 5 chapter dengan puluhan quest coding berlevel |
| ⚔️ **Quest System** | Setiap quest punya storyline RPG, soal coding, dan test cases |
| 🧙 **AI Mentor (Sage)** | Streaming AI via EdgeOne AI Gateway — memberi hints, bukan jawaban |
| 🔍 **Code Reviewer** | AI mengulas kode kamu setelah submit |
| ⚡ **Live Code Execution** | Kode dieksekusi di server, hasil test case muncul realtime |
| 🏆 **XP & Level System** | Naiki level, buka chapter baru, sistem HP yang ikut berperan |
| 💾 **Auto Save** | Progress tersimpan di browser (localStorage) tanpa perlu login |
| 🔥 **Daily Streak** | Sistem streak harian untuk menjaga konsistensi belajar |

---

## 🗺️ Peta Dungeon

```
🟢 Chapter 1 — The Starter's Cave   (Level 1+)  · Variabel, tipe data, fungsi dasar
🟡 Chapter 2 — The Loop Labyrinth   (Level 2+)  · For loop, while, rekursi
🟠 Chapter 3 — The Function Fortress (Level 4+)  · Higher-order functions, string manipulation
🔴 Chapter 4 — The Array Abyss      (Level 6+)  · Array, Set, Object manipulation
💀 Chapter 5 — The Boss Tower        (Level 8+)  · Boss challenge — gabungan semua ilmu
```

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** — React full-stack framework (App Router)
- **React 19** — UI library
- **TypeScript 5** — Type-safe JavaScript
- **Tailwind CSS 4** — Utility-first styling
- **Framer Motion** — Animasi RPG & transisi halaman
- **Monaco Editor** — Code editor berfitur syntax highlighting
- **Zustand** — Game state management (XP, Level, HP) dengan localStorage persistence

### Backend & AI
- **EdgeOne AI Gateway** — Proxy LLM dengan virtual keys, rate limiting & observability
- **Next.js API Routes** — `/api/ai` (streaming AI) dan `/api/execute` (sandbox eksekusi kode)
- **Node.js Function Sandbox** — Eksekusi kode JavaScript user secara aman

### Deploy
- **EdgeOne Pages (EdgeOne Makers)** — Hosting + edge computing

---

## 🚀 Cara Menjalankan

### Prasyarat

- Node.js ≥ 18
- pnpm (package manager)
- Akun [EdgeOne Makers](https://pages.edgeone.ai) (untuk deploy) atau OpenAI API key (untuk dev)

### 1. Clone & Install

```bash
git clone https://github.com/username/ai-code-dungeon.git
cd ai-code-dungeon

pnpm install
```

### 2. Setup Environment Variables

Buat file `.env.local` di root project:

```env
# ===== PILIHAN A: EdgeOne AI Gateway (Rekomendasi) =====
# Dapatkan dari: console.cloud.tencent.com/teo → AI Gateway
EDGEONE_AI_GATEWAY_URL=https://your-gateway-endpoint.edgeone.ai/v1
EDGEONE_AI_GATEWAY_TOKEN=your-virtual-key

# ===== PILIHAN B: OpenAI Langsung (untuk development) =====
# OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
# OPENAI_BASE_URL=https://api.openai.com/v1

# Model AI yang digunakan
AI_MODEL=gpt-4o-mini
```

### 3. Jalankan Development Server

```bash
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### 4. Build Production

```bash
pnpm build
pnpm start
```

---

## 🌐 Deploy ke EdgeOne Pages

### Cara 1 — Via EdgeOne CLI

```bash
# Install EdgeOne CLI
npm install -g edgeone

# Login ke akun EdgeOne
edgeone login

# Deploy langsung
edgeone pages deploy
```

### Cara 2 — Connect GitHub Repository

1. Buka [EdgeOne Pages Dashboard](https://pages.edgeone.ai)
2. Klik **Import Git Repository**
3. Pilih repository ini
4. Set environment variables di dashboard (sama seperti `.env.local`)
5. Deploy otomatis setiap push ke `main`

---

## 📁 Struktur Project

```
ai-code-dungeon/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page (hero screen RPG)
│   │   ├── layout.tsx                  # Root layout (dark theme)
│   │   ├── globals.css                 # RPG theme + custom animations
│   │   ├── dungeon/
│   │   │   ├── page.tsx                # Peta dungeon — pilih chapter
│   │   │   └── [id]/page.tsx           # Daftar quest per chapter
│   │   ├── quest/
│   │   │   └── [id]/page.tsx           # Quest page: editor + AI mentor
│   │   └── api/
│   │       ├── ai/route.ts             # EdgeOne AI Gateway proxy (streaming)
│   │       └── execute/route.ts        # JavaScript sandbox execution
│   └── lib/
│       ├── quests.ts                   # Data quest (5 chapter, 13 quest)
│       ├── game-store.ts               # Zustand store: XP, Level, HP, progress
│       └── utils.ts                    # cn() helper
├── .env.example                        # Template environment variables
├── next.config.ts
└── package.json
```

---

## 🎮 Cara Bermain

1. **Masuk Dungeon** — Input nama heromu di landing page
2. **Pilih Chapter** — Mulai dari Chapter 1 (bisa dibuka semua, Chapter lanjutan butuh Level lebih tinggi)
3. **Kerjakan Quest** — Baca storyline, pahami soal, tulis kode di Monaco Editor
4. **Cast Spell (Run)** — Submit kode, lihat hasil test case
5. **Tanya Sage** — Kalau stuck, minta hint ke AI Mentor tanpa takut di-spoil
6. **Review Kode** — Setelah selesai, minta AI mereview kode kamu
7. **Naiki Level** — Kumpulkan XP, buka chapter berikutnya, hadapi Boss!

---

## 🤖 EdgeOne AI Gateway

Project ini menggunakan **EdgeOne AI Gateway** sebagai proxy antara aplikasi dan LLM provider. Keuntungannya:

- 🔑 **Virtual Keys** — API key provider tidak terekspos di frontend
- 🚦 **Rate Limiting** — Kontrol penggunaan AI per user
- 💰 **Cost Caching** — Request yang sama tidak dikirim ulang ke provider
- 📊 **Observability** — Dashboard monitoring traffic AI
- 🔄 **Model Fallback** — Otomatis beralih ke model lain jika ada error

**Setup AI Gateway:**
1. Buka [Tencent Cloud Console](https://console.cloud.tencent.com/teo)
2. Edge Developer Platform → AI Gateway
3. Buat Gateway instance
4. Tambahkan AI Model (OpenAI, DeepSeek, Anthropic, dll)
5. Buat Virtual Key → salin ke `EDGEONE_AI_GATEWAY_TOKEN`

---

## 📜 Lisensi

MIT License — bebas digunakan dan dimodifikasi.

---

<div align="center">

**Dibuat dengan ❤️ untuk CODEPOLITAN × Tencent EdgeOne Hackathon**

[EdgeOne Pages](https://pages.edgeone.ai) · [Next.js](https://nextjs.org) · [Framer Motion](https://www.framer.com/motion/)

</div>
