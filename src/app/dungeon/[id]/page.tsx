"use client";

// ============================================================
// Chapter Page — Daftar quest dalam satu chapter
// ============================================================

import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { chapters } from "@/lib/quests";
import { useGameStore } from "@/lib/game-store";

const DIFFICULTY_CONFIG = {
  easy: { label: "Easy", color: "text-green-400", bg: "bg-green-900/30 border-green-500/30" },
  medium: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-900/30 border-yellow-500/30" },
  hard: { label: "Hard", color: "text-red-400", bg: "bg-red-900/30 border-red-500/30" },
  boss: { label: "BOSS", color: "text-purple-400", bg: "bg-purple-900/30 border-purple-500/30" },
};

export default function ChapterPage() {
  const { id } = useParams<{ id: string }>();
  const chapterId = parseInt(id);
  const chapter = chapters.find((c) => c.id === chapterId);
  const { completedQuests, level } = useGameStore();

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😵</div>
          <p className="text-muted-foreground font-mono">Chapter tidak ditemukan</p>
          <Link href="/dungeon" className="mt-4 inline-block text-gold hover:underline">
            ← Kembali ke Dungeon
          </Link>
        </div>
      </div>
    );
  }

  const isLocked = level < chapter.requiredLevel;

  return (
    <div className="min-h-screen p-6">
      {/* Background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(oklch(0.82 0.18 80 / 20%) 1px, transparent 1px), 
                            linear-gradient(90deg, oklch(0.82 0.18 80 / 20%) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono mb-6">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <span>/</span>
          <Link href="/dungeon" className="hover:text-gold transition-colors">Dungeon</Link>
          <span>/</span>
          <span className="text-gold">{chapter.title}</span>
        </div>

        {/* Chapter header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 mb-6 bg-gradient-to-br ${chapter.color} border border-white/10`}
        >
          <div className="text-4xl mb-3">{chapter.emoji}</div>
          <h1 className="text-2xl font-bold font-mono text-foreground">{chapter.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{chapter.subtitle}</p>
          <p className="text-sm text-foreground/80 mt-3 leading-relaxed">{chapter.description}</p>

          {isLocked && (
            <div className="mt-4 p-3 bg-black/30 rounded-lg text-sm text-yellow-400 font-mono">
              🔒 Chapter ini terkunci. Capai Level {chapter.requiredLevel} untuk membuka!
            </div>
          )}
        </motion.div>

        {/* Quest list */}
        <div className="space-y-3">
          {chapter.quests.map((quest, i) => {
            const done = completedQuests.includes(quest.id);
            const diff = DIFFICULTY_CONFIG[quest.difficulty];

            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={isLocked ? "#" : `/quest/${quest.id}`}
                  className={isLocked ? "pointer-events-none" : ""}
                >
                  <div className={`
                    card-dungeon rounded-xl p-4 flex items-center gap-4 transition-all duration-200
                    ${done
                      ? "border-green-500/20 hover:border-green-400/40"
                      : isLocked
                      ? "opacity-50"
                      : "hover:border-gold/40 hover:shadow-md hover:shadow-yellow-900/10 active:scale-[0.99]"
                    }
                  `}>
                    {/* Number/check */}
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm flex-shrink-0
                      ${done ? "bg-green-900/50 text-green-400" : "bg-dungeon text-muted-foreground border border-white/10"}
                    `}>
                      {done ? "✓" : i + 1}
                    </div>

                    {/* Quest info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${diff.bg} ${diff.color}`}>
                          {diff.label}
                        </span>
                        {quest.difficulty === "boss" && (
                          <span className="text-xs animate-pulse-gold">⚡ BOSS FIGHT</span>
                        )}
                      </div>
                      <h3 className={`font-mono font-semibold text-sm ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {quest.title}
                      </h3>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {quest.tags.map((tag) => (
                          <span key={tag} className="text-xs text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* XP reward */}
                    <div className="text-right flex-shrink-0">
                      <div className="text-gold font-mono font-bold text-sm">+{quest.xpReward}</div>
                      <div className="text-xs text-muted-foreground">XP</div>
                    </div>

                    {/* Arrow */}
                    {!isLocked && (
                      <div className="text-muted-foreground text-sm">→</div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Progress summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 card-dungeon rounded-xl p-4"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground font-mono">Progress Chapter</span>
            <span className="text-sm text-gold font-mono font-bold">
              {completedQuests.filter((id) => chapter.quests.some((q) => q.id === id)).length}
              /{chapter.quests.length}
            </span>
          </div>
          <div className="h-2 bg-dungeon rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(completedQuests.filter((id) => chapter.quests.some((q) => q.id === id)).length / chapter.quests.length) * 100}%`,
              }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-full rounded-full bg-gradient-to-r from-yellow-700 to-yellow-400"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
