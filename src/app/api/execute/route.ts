// ============================================================
// API Route: /api/execute — JavaScript code execution sandbox
// Menjalankan kode user dan memvalidasi test cases
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { TestCase } from "@/lib/quests";

export const runtime = "nodejs";

interface ExecuteRequest {
  code: string;
  testCases: TestCase[];
  solutionFn: string;
}

interface TestResult {
  description: string;
  passed: boolean;
  output?: unknown;
  error?: string;
}

// ============================================================
// Safe evaluation dalam Node.js VM
// ============================================================
function runInSandbox(code: string, solutionFn: string, input: unknown[]): { result: unknown; error?: string } {
  try {
    // Buat function dari kode user
    // eslint-disable-next-line no-new-func
    const wrappedCode = `
      "use strict";
      ${code}
      return typeof ${solutionFn} === 'function' ? ${solutionFn} : null;
    `;

    // eslint-disable-next-line no-new-func
    const getFn = new Function(wrappedCode);
    const fn = getFn();

    if (typeof fn !== "function") {
      return { result: undefined, error: `Function '${solutionFn}' tidak ditemukan. Pastikan kamu mendefinisikan fungsi dengan nama yang benar.` };
    }

    const result = fn(...input);
    return { result };
  } catch (err) {
    return {
      result: undefined,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

// ============================================================
// Deep equality check (untuk array/object test cases)
// ============================================================
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, i) => deepEqual(val, b[i]));
  }
  if (typeof a === "object" && a !== null && b !== null) {
    const keysA = Object.keys(a as object);
    const keysB = Object.keys(b as object);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) =>
      deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
    );
  }
  return false;
}

// ============================================================
// Check result against expected
// Beberapa quest punya expected berupa "type check" (e.g. "string")
// ============================================================
function checkResult(result: unknown, expected: unknown): boolean {
  // Type check: jika expected adalah nama tipe JS
  if (expected === "string") return typeof result === "string";
  if (expected === "number") return typeof result === "number";
  if (expected === "boolean") return typeof result === "boolean";

  // Length > 0 check
  if (expected === true && typeof result === "string") return result.length > 0;

  // Deep equality untuk primitive, array, object
  return deepEqual(result, expected);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExecuteRequest;
    const { code, testCases, solutionFn } = body;

    if (!code || !testCases || !solutionFn) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // Limit code length untuk keamanan
    if (code.length > 10000) {
      return NextResponse.json({ error: "Kode terlalu panjang (max 10.000 karakter)" }, { status: 400 });
    }

    // Blokir kata kunci berbahaya
    const BLOCKED = [
      "require(", "import(", "process.", "global.", "__dirname",
      "fetch(", "XMLHttpRequest", "eval(", "Function(",
      "fs.", "child_process", "crypto.", "os.",
    ];

    for (const blocked of BLOCKED) {
      if (code.includes(blocked)) {
        return NextResponse.json(
          { error: `Penggunaan '${blocked}' tidak diizinkan dalam quest.` },
          { status: 400 }
        );
      }
    }

    // Jalankan setiap test case dengan timeout
    const results: TestResult[] = testCases.map((tc) => {
      const input = Array.isArray(tc.input) ? tc.input : tc.input !== undefined ? [tc.input] : [];

      const { result, error } = runInSandbox(code, solutionFn, input);

      if (error) {
        return {
          description: tc.description,
          passed: false,
          error,
        };
      }

      const passed = checkResult(result, tc.expected);
      return {
        description: tc.description,
        passed,
        output: passed ? undefined : result,
      };
    });

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Execute route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
