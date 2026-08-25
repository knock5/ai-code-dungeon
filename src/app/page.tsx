"use client";

// ============================================================
// Landing Page — Halaman utama AI Code Dungeon
// ============================================================

import Link from "next/link";
import { motion } from "framer-motion";
import { useGameStore } from "@/lib/game-store";
import { chapters } from "@/lib/quests";
import { useEffect, useState } from "react";

import type { Variants } from "framer-motion";

// Animasi fade-in dari bawah
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

// ASCII art dungeon (simpel)
const DUNGEON_ASCII = `
╔══════════════════════════════╗
║  ░░░  AI CODE DUNGEON  ░░░  ║
║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
║  ▓  [entrance] ⚔️  🛡️  ▓  ║
║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  ║
╚══════════════════════════════╝`;

// Stats bawah landing page
const STATS = [
  { label: "Chapter", value: "5", icon: "🏰" },
  { label: "Quest", value: "13", icon: "⚔️" },
  { label: "Bahasa", value: "JS", icon: "💻" },
  { label: "AI Mentor", value: "24/7", icon: "🧙" },
];

export default function HomePage() {
  const { name, level, completedQuests, setHeroName, updateStreak } = useGameStore();
  const [showNameInput, setShowNameInput] = useState(false);
  const [inputName, setInputName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    updateStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleStartGame() {
    if (!name) {
      setShowNameInput(true);
    }
  }

  function handleConfirmName() {
    if (inputName.trim()) {
      setHeroName(inputName.trim());
      setShowNameInput(false);
    }
  }

  // Total quests dari semua chapter
  const totalQuests = chapters.flatMap((c) => c.quests).length;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background particles / grid */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(oklch(0.82 0.18 80 / 20%) 1px, transparent 1px), 
                            linear-gradient(90deg, oklch(0.82 0.18 80 / 20%) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow blob kiri */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-900/30 rounded-full blur-3xl pointer-events-none" />
      {/* Glow blob kanan */}
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-yellow-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 py-16 max-w-3xl w-full">

        {/* ASCII Art Header */}
        <motion.pre
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-xs text-gold-dim font-mono hidden sm:block select-none"
        >
          {DUNGEON_ASCII}
        </motion.pre>

        {/* Title */}
        <motion.div
          className="text-center"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={0}
        >
          <div className="text-6xl mb-4 animate-float select-none">⚔️</div>
          <h1 className="text-5xl sm:text-6xl font-bold shimmer-text font-mono tracking-tight mb-3">
            AI Code Dungeon
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Belajar coding lewat petualangan RPG. Selesaikan{" "}
            <span className="text-gold font-semibold">quest coding</span>,
            naiki level, dan hadapi{" "}
            <span className="text-accent font-semibold">boss challenge</span>{" "}
            bersama AI Mentor.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-4 gap-3 w-full max-w-sm"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={1}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              className="card-dungeon p-3 text-center rounded-lg transition-all duration-200 hover:border-gold/30"
            >
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-gold font-bold font-mono text-sm">{s.value}</div>
              <div className="text-muted-foreground text-xs">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Hero info (jika sudah ada nama) */}
        {mounted && name && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-dungeon px-6 py-3 rounded-xl flex items-center gap-4"
          >
            <span className="text-2xl">🧙</span>
            <div>
              <div className="text-sm text-muted-foreground">Selamat datang kembali,</div>
              <div className="text-gold font-bold font-mono">
                {name} · Level {level}
              </div>
            </div>
            <div className="ml-4 text-right">
              <div className="text-xs text-muted-foreground">Quest selesai</div>
              <div className="text-gold font-mono text-sm font-semibold">
                {completedQuests.length}/{totalQuests}
              </div>
            </div>
          </motion.div>
        )}

        {/* Name input modal */}
        {showNameInput && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <div className="card-dungeon p-8 rounded-2xl w-full max-w-sm mx-4 border border-gold/30">
              <div className="text-4xl text-center mb-4">🧙</div>
              <h2 className="text-xl font-bold text-center text-gold font-mono mb-2">
                Siapa namamu, petualang?
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Nama ini akan terukir di dungeon untuk selamanya.
              </p>
              <input
                autoFocus
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConfirmName()}
                placeholder="Masukkan nama heromu..."
                className="w-full bg-dungeon border border-gold/30 rounded-lg px-4 py-3 text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors mb-4"
              />
              <button
                onClick={handleConfirmName}
                disabled={!inputName.trim()}
                className="w-full py-3 rounded-lg font-bold font-mono text-black bg-gold hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Mulai Petualangan ⚔️
              </button>
            </div>
          </motion.div>
        )}

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 w-full max-w-xs"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={2}
        >
          {mounted && name ? (
            <Link href="/dungeon" className="flex-1">
              <button className="w-full py-4 rounded-xl font-bold font-mono text-base text-black bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 transition-all shadow-lg shadow-yellow-900/30 hover:shadow-yellow-700/40 hover:scale-105 active:scale-100">
                🏰 Masuk Dungeon
              </button>
            </Link>
          ) : (
            <button
              onClick={handleStartGame}
              className="flex-1 py-4 rounded-xl font-bold font-mono text-base text-black bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 transition-all shadow-lg shadow-yellow-900/30 hover:scale-105 active:scale-100"
            >
              ⚔️ Mulai Petualangan
            </button>
          )}

          <Link
            href="/dungeon"
            className="flex-1 py-4 rounded-xl font-bold font-mono text-sm text-accent border border-accent/30 hover:bg-accent/10 transition-all text-center flex items-center justify-center"
          >
            🗺️ Lihat Map
          </Link>
        </motion.div>

        {/* Features list */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-4"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={3}
        >
          {[
            {
              icon: "🤖",
              title: "AI Mentor",
              desc: "Sage memberikan hints tanpa spoil jawaban. Tanya kapan saja!",
            },
            {
              icon: "⚡",
              title: "Live Execution",
              desc: "Kode kamu dieksekusi langsung. Lihat hasil test case secara realtime.",
            },
            {
              icon: "🏆",
              title: "Level & XP",
              desc: "Naiki level, kumpulkan XP, dan buka chapter baru dalam dungeon.",
            },
          ].map((f) => (
            <div key={f.title} className="card-dungeon p-5 rounded-xl transition-all duration-200 hover:border-gold/30">
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-bold text-gold font-mono text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-xs text-muted-foreground text-center"
          initial="hidden"
          animate="show"
          variants={fadeUp}
          custom={4}
        >
          Powered by{" "}
          <span className="text-gold">EdgeOne AI Gateway</span> ·{" "}
          <span className="text-accent">Next.js 16</span> ·{" "}
          <span className="text-foreground/60">Built for CODEPOLITAN × Tencent EdgeOne Hackathon</span>
        </motion.p>
      </div>
    </main>
  );
}
