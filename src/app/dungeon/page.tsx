"use client";

// ============================================================
// Dungeon Map Page — Peta dungeon, pilih chapter/quest
// ============================================================

import Link from "next/link";
import { motion } from "framer-motion";
import { useGameStore, selectChapterProgress, selectXpPercent, selectHpPercent } from "@/lib/game-store";
import { chapters } from "@/lib/quests";

function HeroStatusBar() {
  const store = useGameStore();
  const xpPct = selectXpPercent(store);
  const hpPct = selectHpPercent(store);

  return (
    <div className="card-dungeon rounded-xl px-5 py-4 flex items-center gap-5 flex-wrap">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🧙</span>
        <div>
          <div className="font-mono font-bold text-gold text-sm">
            {store.name || "Anonymous Hero"}
          </div>
          <div className="text-xs text-muted-foreground">Level {store.level}</div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1 min-w-[160px]">
        {/* HP Bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-red-400 w-6">HP</span>
          <div className="flex-1 h-2 bg-dungeon rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-700 to-red-400 transition-all duration-500"
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-16 text-right">
            {store.hp}/{store.maxHp}
          </span>
        </div>
        {/* XP Bar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-yellow-400 w-6">XP</span>
          <div className="flex-1 h-2 bg-dungeon rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-700 to-yellow-400 transition-all duration-500"
              style={{ width: `${xpPct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-20 text-right">
            {store.xp}/{store.xpToNext}
          </span>
        </div>
      </div>

      <div className="text-center">
        <div className="text-gold font-mono font-bold text-lg">{store.completedQuests.length}</div>
        <div className="text-xs text-muted-foreground">Quest Done</div>
      </div>

      {store.currentStreak > 0 && (
        <div className="text-center">
          <div className="text-orange-400 font-mono font-bold text-lg">🔥{store.currentStreak}</div>
          <div className="text-xs text-muted-foreground">Streak</div>
        </div>
      )}
    </div>
  );
}

function ChapterCard({ chapter, index }: { chapter: (typeof chapters)[0]; index: number }) {
  const store = useGameStore();
  const questIds = chapter.quests.map((q) => q.id);
  const { completed, total } = selectChapterProgress(questIds)(store);
  const isLocked = store.level < chapter.requiredLevel;
  const isCleared = completed === total;
  const isActive = !isLocked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        relative rounded-2xl overflow-hidden border transition-all duration-300
        ${isLocked
          ? "border-white/5 opacity-60 cursor-not-allowed"
          : isCleared
          ? "border-green-500/40 hover:border-green-400/60 cursor-pointer"
          : "border-gold/20 hover:border-gold/50 cursor-pointer hover:shadow-lg hover:shadow-yellow-900/20"
        }
      `}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${chapter.color} opacity-60`} />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-3xl mb-2">{chapter.emoji}</div>
            <h3 className="font-mono font-bold text-base text-foreground">{chapter.title}</h3>
            <p className="text-xs text-muted-foreground">{chapter.subtitle}</p>
          </div>
          <div className="text-right">
            {isLocked ? (
              <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-muted-foreground">
                🔒 Lv.{chapter.requiredLevel}
              </span>
            ) : isCleared ? (
              <span className="text-xs bg-green-900/50 border border-green-500/30 px-2 py-1 rounded-full text-green-400">
                ✅ Cleared
              </span>
            ) : (
              <span className="text-xs bg-yellow-900/30 border border-yellow-500/30 px-2 py-1 rounded-full text-yellow-400">
                ⚔️ Active
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed line-clamp-2">
          {chapter.description}
        </p>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span className="text-gold font-mono">
              {completed}/{total} quest
            </span>
          </div>
          <div className="h-1.5 bg-dungeon rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-500"
              style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Quest list preview */}
        <div className="space-y-1">
          {chapter.quests.slice(0, 3).map((q) => {
            const done = store.completedQuests.includes(q.id);
            return (
              <div key={q.id} className="flex items-center gap-2">
                <span className="text-xs">{done ? "✅" : "⬜"}</span>
                <span className={`text-xs truncate ${done ? "text-muted-foreground line-through" : "text-foreground/80"}`}>
                  {q.title}
                </span>
                <span className="ml-auto text-xs text-gold font-mono">+{q.xpReward}XP</span>
              </div>
            );
          })}
          {chapter.quests.length > 3 && (
            <div className="text-xs text-muted-foreground pl-5">
              +{chapter.quests.length - 3} quest lainnya...
            </div>
          )}
        </div>

        {/* Enter button */}
        {isActive && (
          <Link href={`/dungeon/${chapter.id}`} className="block mt-4">
            <button className={`
              w-full py-2.5 rounded-lg font-mono font-bold text-sm transition-all duration-200
              ${isCleared
                ? "bg-green-900/40 border border-green-500/30 text-green-400 hover:bg-green-900/60"
                : "bg-yellow-900/40 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-900/60 hover:border-yellow-400/50"
              }
            `}>
              {isCleared ? "🏆 Replay Chapter" : "⚔️ Masuk Chapter"}
            </button>
          </Link>
        )}
        {isLocked && (
          <div className="mt-4 py-2.5 rounded-lg text-center text-xs text-muted-foreground bg-white/5">
            🔒 Capai Level {chapter.requiredLevel} untuk membuka
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function DungeonPage() {
  const { name } = useGameStore();

  return (
    <div className="min-h-screen p-6">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(oklch(0.82 0.18 80 / 20%) 1px, transparent 1px), 
                            linear-gradient(90deg, oklch(0.82 0.18 80 / 20%) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Link href="/" className="text-muted-foreground hover:text-gold transition-colors text-sm font-mono">
              ← Kembali
            </Link>
          </div>
          <h1 className="text-3xl font-bold font-mono text-gold glow-gold">
            🏰 Dungeon Map
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {name ? `Petualang ${name}, pilih chapter untuk mulai bertarung!` : "Pilih chapter untuk mulai bertarung!"}
          </p>
        </motion.div>

        {/* Hero status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <HeroStatusBar />
        </motion.div>

        {/* Chapter grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {chapters.map((chapter, i) => (
            <ChapterCard key={chapter.id} chapter={chapter} index={i} />
          ))}
        </div>

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-muted-foreground mt-10"
        >
          💡 Selesaikan quest untuk mendapatkan XP dan naiki level · Chapter baru terbuka saat level meningkat
        </motion.p>
      </div>
    </div>
  );
}
