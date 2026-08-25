"use client";

// ============================================================
// Quest Page — Halaman quest aktif: editor kode + AI mentor
// ============================================================

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getQuestById } from "@/lib/quests";
import { useGameStore } from "@/lib/game-store";

// Monaco Editor dimuat secara dynamic (CSR only)
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-dungeon text-muted-foreground font-mono text-sm">
      Loading editor...
    </div>
  ),
});

// ============================================================
// Types
// ============================================================
interface TestResult {
  description: string;
  passed: boolean;
  output?: unknown;
  error?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ============================================================
// XP Fly animation
// ============================================================
function XPFlyUp({ xp, onDone }: { xp: number; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -60, scale: 1.5 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      onAnimationComplete={onDone}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 z-50 text-2xl font-mono font-bold text-gold pointer-events-none"
    >
      +{xp} XP ✨
    </motion.div>
  );
}

// ============================================================
// Main Quest Page
// ============================================================
export default function QuestPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const quest = getQuestById(id);

  const { completedQuests, addXP, completeQuest, takeDamage } = useGameStore();
  const isCompleted = completedQuests.includes(id);

  const [code, setCode] = useState(quest?.starterCode ?? "");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const [showXP, setShowXP] = useState<number | null>(null);
  const [tab, setTab] = useState<"tests" | "chat">("tests");
  const [runError, setRunError] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Initialize code from quest
  useEffect(() => {
    if (quest) setCode(quest.starterCode);
  }, [quest]);

  if (!quest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🕳️</div>
          <p className="text-muted-foreground font-mono">Quest tidak ditemukan</p>
          <Link href="/dungeon" className="mt-4 inline-block text-gold hover:underline font-mono">
            ← Kembali ke Dungeon
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // Run Code — kirim ke API /api/execute
  // ============================================================
  const handleRunCode = useCallback(async () => {
    setIsRunning(true);
    setRunError(null);
    setTestResults([]);
    setTab("tests");

    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, testCases: quest.testCases, solutionFn: quest.solutionFn }),
      });

      if (!res.ok) throw new Error("Eksekusi gagal");
      const data = await res.json();
      setTestResults(data.results);

      const allPassed = data.results.every((r: TestResult) => r.passed);
      if (allPassed && !isCompleted) {
        // Quest selesai!
        completeQuest(quest.id);
        const { leveledUp } = addXP(quest.xpReward);
        setShowXP(quest.xpReward);

        // Send congratulations via AI
        if (leveledUp) {
          setChatMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `🎉 LUAR BIASA! Kamu berhasil menyelesaikan "${quest.title}"! Dan... **LEVEL UP!** ⚡ Kekuatanmu telah meningkat, petualang! HP kamu dipulihkan penuh. Lanjutkan perjalananmu!`,
            },
          ]);
        } else {
          setChatMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `✅ Sempurna! Semua test case berhasil! Kamu mendapatkan **+${quest.xpReward} XP**! 🏆 Quest "${quest.title}" telah diselesaikan. Petualang yang hebat!`,
            },
          ]);
        }
        setTab("chat");
      } else if (!allPassed) {
        // Gagal = ambil damage
        takeDamage(10);
      }
    } catch (err) {
      setRunError(err instanceof Error ? err.message : "Terjadi error");
    } finally {
      setIsRunning(false);
    }
  }, [code, quest, isCompleted, addXP, completeQuest, takeDamage]);

  // ============================================================
  // Ask AI Mentor (streaming)
  // ============================================================
  const handleAskMentor = useCallback(async (mode: "mentor" | "reviewer") => {
    const userMessage =
      mode === "mentor"
        ? chatInput.trim() || "Saya butuh hint untuk quest ini."
        : `Tolong review kode saya:\n\`\`\`javascript\n${code}\n\`\`\``;

    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setChatInput("");
    setIsAILoading(true);
    setTab("chat");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          messages: [
            ...chatMessages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage },
          ],
          questContext: {
            title: quest.title,
            problem: quest.problem,
            hint: quest.hint,
          },
        }),
      });

      if (!res.ok || !res.body) {
        // Coba baca error JSON
        const errText = await res.text();
        try {
          const errJson = JSON.parse(errText);
          throw new Error(errJson.error || "AI tidak merespons");
        } catch {
          throw new Error(errText || "AI tidak merespons");
        }
      }

      // Plain text stream dari toTextStreamResponse()
      // Setiap chunk = potongan teks langsung dari AI
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      setChatMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Chunk adalah teks langsung, tidak perlu parsing SSE
        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;

        // Update pesan terakhir secara realtime
        setChatMessages((prev) => {
          const msgs = [...prev];
          msgs[msgs.length - 1] = { role: "assistant", content: aiResponse };
          return msgs;
        });
      }
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Maaf, Sage sedang tidak bisa merespons. Error: ${err instanceof Error ? err.message : "Unknown"}`,
        },
      ]);
    } finally {
      setIsAILoading(false);
    }
  }, [chatMessages, chatInput, code, quest]);

  const allPassed = testResults.length > 0 && testResults.every((r) => r.passed);
  const hasFailed = testResults.some((r) => !r.passed);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-dungeon">
      {/* XP animation */}
      <AnimatePresence>
        {showXP && (
          <XPFlyUp xp={showXP} onDone={() => setShowXP(null)} />
        )}
      </AnimatePresence>

      {/* Top nav */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-dungeon-surface flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href={`/dungeon/${quest.chapterId}`} className="text-muted-foreground hover:text-gold text-sm font-mono transition-colors">
            ← Dungeon
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-gold font-mono text-sm font-semibold truncate max-w-[200px]">
            {quest.title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {isCompleted && (
            <span className="text-xs text-green-400 font-mono bg-green-900/30 border border-green-500/30 px-2 py-1 rounded-full">
              ✅ Cleared
            </span>
          )}
          <span className="text-xs text-gold font-mono">+{quest.xpReward} XP</span>
        </div>
      </div>

      {/* Main layout: Quest Info | Editor | Chat/Tests */}
      <div className="flex-1 flex overflow-hidden">

        {/* ===== PANEL KIRI: Quest Story & Info ===== */}
        <div className="w-72 flex-shrink-0 border-r border-white/10 overflow-y-auto p-4 space-y-4 bg-dungeon-surface hidden md:flex md:flex-col">
          {/* Story */}
          <div className="card-dungeon rounded-xl p-4">
            <div className="text-xs text-purple-400 font-mono mb-2 uppercase tracking-wider">📜 Kisah</div>
            <p className="text-sm text-foreground/80 leading-relaxed italic">{quest.story}</p>
          </div>

          {/* Problem */}
          <div className="card-dungeon rounded-xl p-4">
            <div className="text-xs text-gold font-mono mb-2 uppercase tracking-wider">⚔️ Misi</div>
            <p className="text-sm text-foreground leading-relaxed">{quest.problem}</p>
          </div>

          {/* Hint (collapsible) */}
          <details className="card-dungeon rounded-xl p-4 group">
            <summary className="text-xs text-yellow-400 font-mono uppercase tracking-wider cursor-pointer select-none hover:text-yellow-300">
              💡 Hint (klik untuk lihat)
            </summary>
            <p className="text-sm text-foreground/70 leading-relaxed mt-2">{quest.hint}</p>
          </details>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {quest.tags.map((tag) => (
              <span key={tag} className="text-xs text-muted-foreground bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* ===== PANEL TENGAH: Code Editor ===== */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Editor header */}
          <div className="flex items-center justify-between px-4 py-2 bg-dungeon-surface border-b border-white/10 flex-shrink-0">
            <span className="text-xs text-muted-foreground font-mono">solution.js</span>
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className={`
                flex items-center gap-2 px-4 py-1.5 rounded-lg font-mono font-bold text-xs transition-all
                ${isRunning
                  ? "bg-yellow-900/30 text-yellow-400 border border-yellow-500/30 cursor-wait"
                  : "bg-yellow-500 hover:bg-yellow-400 text-black hover:scale-105 active:scale-100"
                }
              `}
            >
              {isRunning ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  Running...
                </>
              ) : (
                <>⚡ Cast Spell (Run)</>
              )}
            </button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              language="javascript"
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val ?? "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "var(--font-geist-mono), 'Fira Code', monospace",
                fontLigatures: true,
                lineNumbers: "on",
                padding: { top: 16, bottom: 16 },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                tabSize: 2,
                smoothScrolling: true,
                cursorBlinking: "smooth",
              }}
            />
          </div>
        </div>

        {/* ===== PANEL KANAN: Tests + AI Chat ===== */}
        <div className="w-80 flex-shrink-0 border-l border-white/10 flex flex-col bg-dungeon-surface">
          {/* Tab switcher */}
          <div className="flex border-b border-white/10 flex-shrink-0">
            {(["tests", "chat"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-mono font-bold transition-colors ${
                  tab === t
                    ? "text-gold border-b-2 border-gold bg-dungeon"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "tests" ? "⚡ Test Cases" : "🧙 AI Mentor"}
                {t === "chat" && chatMessages.length > 0 && (
                  <span className="ml-1 text-purple-400 text-xs">{chatMessages.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Test Results tab */}
          {tab === "tests" && (
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {runError && (
                <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-xs text-red-400 font-mono">
                  ⚠️ {runError}
                </div>
              )}

              {testResults.length === 0 && !runError && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3 py-10">
                  <div className="text-4xl animate-float">⚡</div>
                  <p className="text-sm text-muted-foreground font-mono">
                    Klik{" "}
                    <span className="text-yellow-400">Cast Spell</span> untuk menjalankan kode kamu
                  </p>
                </div>
              )}

              {allPassed && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-3 bg-green-900/30 border border-green-500/30 rounded-lg text-center"
                >
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-green-400 font-mono font-bold text-sm">Quest Clear!</div>
                  <div className="text-xs text-muted-foreground mt-1">+{quest.xpReward} XP telah ditambahkan</div>
                </motion.div>
              )}

              {hasFailed && (
                <div className="p-3 bg-red-900/20 border border-red-500/20 rounded-lg text-center">
                  <div className="text-2xl mb-1">💥</div>
                  <div className="text-red-400 font-mono font-bold text-sm">Serangan gagal!</div>
                  <div className="text-xs text-muted-foreground mt-1">-10 HP · Coba lagi!</div>
                </div>
              )}

              {testResults.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-3 rounded-lg border text-xs font-mono ${
                    r.passed
                      ? "bg-green-900/20 border-green-500/30"
                      : "bg-red-900/20 border-red-500/30"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span>{r.passed ? "✅" : "❌"}</span>
                    <div className="flex-1">
                      <div className={r.passed ? "text-green-300" : "text-red-300"}>
                        {r.description}
                      </div>
                      {!r.passed && r.error && (
                        <div className="text-red-400/70 mt-1 text-xs break-all">
                          Error: {r.error}
                        </div>
                      )}
                      {!r.passed && r.output !== undefined && (
                        <div className="text-muted-foreground mt-1">
                          Output: {JSON.stringify(r.output)}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* AI Chat tab */}
          {tab === "chat" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {chatMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center gap-3 py-10 text-center">
                    <div className="text-4xl animate-float">🧙</div>
                    <div>
                      <p className="text-sm font-mono font-semibold text-gold">Sage si Mentor</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Butuh bantuan? Tanya aku! Aku akan memberi hints tanpa spoil jawaban.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 w-full mt-2">
                      <button
                        onClick={() => handleAskMentor("mentor")}
                        className="text-xs py-2 px-3 rounded-lg bg-purple-900/30 border border-purple-500/30 text-purple-400 hover:bg-purple-900/50 transition-colors font-mono"
                      >
                        💡 Minta hint untuk quest ini
                      </button>
                      <button
                        onClick={() => handleAskMentor("reviewer")}
                        className="text-xs py-2 px-3 rounded-lg bg-blue-900/30 border border-blue-500/30 text-blue-400 hover:bg-blue-900/50 transition-colors font-mono"
                      >
                        🔍 Review kode saya
                      </button>
                    </div>
                  </div>
                )}

                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-sm flex-shrink-0">
                        🧙
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed font-mono ${
                        msg.role === "user"
                          ? "bg-yellow-900/30 border border-yellow-500/20 text-yellow-100"
                          : "bg-dungeon border border-white/10 text-foreground/90"
                      }`}
                    >
                      {/* Simple markdown: bold */}
                      {msg.content.split(/(\*\*.*?\*\*)/).map((part, j) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <strong key={j} className="text-gold">
                            {part.slice(2, -2)}
                          </strong>
                        ) : (
                          <span key={j}>{part}</span>
                        )
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-7 h-7 rounded-full bg-yellow-900/50 border border-yellow-500/30 flex items-center justify-center text-sm flex-shrink-0">
                        🧑
                      </div>
                    )}
                  </motion.div>
                ))}

                {isAILoading && (
                  <div className="flex gap-2 items-center">
                    <div className="w-7 h-7 rounded-full bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-sm">
                      🧙
                    </div>
                    <div className="bg-dungeon border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-muted-foreground">
                      <span className="animate-pulse">Sage sedang berpikir...</span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input area */}
              <div className="p-3 border-t border-white/10 flex-shrink-0">
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => handleAskMentor("reviewer")}
                    disabled={isAILoading}
                    className="text-xs px-2 py-1 rounded bg-blue-900/30 border border-blue-500/20 text-blue-400 hover:bg-blue-900/50 transition-colors font-mono disabled:opacity-50"
                  >
                    🔍 Review
                  </button>
                  <button
                    onClick={() => handleAskMentor("mentor")}
                    disabled={isAILoading || !chatInput}
                    className="text-xs px-2 py-1 rounded bg-purple-900/30 border border-purple-500/20 text-purple-400 hover:bg-purple-900/50 transition-colors font-mono disabled:opacity-50"
                  >
                    💡 Hint
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && chatInput.trim()) {
                        handleAskMentor("mentor");
                      }
                    }}
                    placeholder="Tanya Sage..."
                    disabled={isAILoading}
                    className="flex-1 bg-dungeon border border-white/10 rounded-lg px-3 py-2 text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:border-gold/50 transition-colors disabled:opacity-50"
                  />
                  <button
                    onClick={() => chatInput.trim() && handleAskMentor("mentor")}
                    disabled={isAILoading || !chatInput.trim()}
                    className="px-3 py-2 rounded-lg bg-gold text-black text-xs font-bold hover:brightness-110 disabled:opacity-40 transition-all"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
