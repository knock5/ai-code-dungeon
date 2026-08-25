// ============================================================
// Quest Data — Semua soal coding di dalam dungeon
// ============================================================

export type Difficulty = "easy" | "medium" | "hard" | "boss";

export interface TestCase {
  description: string;
  input?: unknown;
  expected: unknown;
}

export interface Quest {
  id: string;
  chapterId: number;
  order: number;
  title: string;
  story: string;         // Narasi RPG
  problem: string;       // Deskripsi teknis soal
  hint: string;          // Hints pertama tanpa AI
  starterCode: string;
  solutionFn: string;    // Nama function yang harus dibuat user
  testCases: TestCase[];
  xpReward: number;
  difficulty: Difficulty;
  tags: string[];
}

export interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  emoji: string;
  description: string;
  requiredLevel: number;
  color: string; // tailwind gradient classes
  quests: Quest[];
}

// ============================================================
// CHAPTER 1 — The Starter's Cave (Variabel & Tipe Data)
// ============================================================
const chapter1Quests: Quest[] = [
  {
    id: "ch1-q1",
    chapterId: 1,
    order: 1,
    title: "Deklarasikan Namamu!",
    story:
      "Kamu terbangun di dalam gua gelap. Di hadapanmu berdiri seorang penjaga batu kuno yang berkata: \"Siapa namamu, petualang? Tanpa nama, kau takkan bisa melanjutkan perjalanan!\"",
    problem:
      "Buat sebuah variabel bernama `name` menggunakan `const` yang berisi nama lengkapmu sebagai string. Kembalikan nilai variabel tersebut.",
    hint: "Gunakan `const name = 'nama kamu'` lalu `return name`",
    starterCode: `function solution() {
  // Deklarasikan variabel name di sini
  
  return name;
}`,
    solutionFn: "solution",
    testCases: [
      {
        description: "Variabel name harus berupa string",
        expected: "string",
      },
      {
        description: "Panjang nama harus lebih dari 0",
        expected: true,
      },
    ],
    xpReward: 80,
    difficulty: "easy",
    tags: ["variabel", "string", "const"],
  },
  {
    id: "ch1-q2",
    chapterId: 1,
    order: 2,
    title: "Hitung Kekuatanmu!",
    story:
      "Penjaga memberikanmu dua batu ajaib bertanda angka. \"Gabungkan kekuatan kedua batu ini,\" ujarnya. \"Hanya mereka yang bisa menjumlahkan angka yang layak melanjutkan perjalanan!\"",
    problem:
      "Buat fungsi `add(a, b)` yang menerima dua angka dan mengembalikan hasil penjumlahannya.",
    hint: "Gunakan operator `+` untuk menjumlahkan `a` dan `b`",
    starterCode: `function add(a, b) {
  // Kembalikan hasil penjumlahan a dan b
  
}`,
    solutionFn: "add",
    testCases: [
      { description: "add(2, 3) harus = 5", input: [2, 3], expected: 5 },
      { description: "add(0, 0) harus = 0", input: [0, 0], expected: 0 },
      { description: "add(-1, 1) harus = 0", input: [-1, 1], expected: 0 },
      { description: "add(10, 20) harus = 30", input: [10, 20], expected: 30 },
    ],
    xpReward: 100,
    difficulty: "easy",
    tags: ["fungsi", "aritmatika", "parameter"],
  },
  {
    id: "ch1-q3",
    chapterId: 1,
    order: 3,
    title: "Genap atau Ganjil?",
    story:
      "Di ujung gua, terdapat dua pintu. Pintu kiri bertuliskan GENAP, pintu kanan bertuliskan GANJIL. Seorang penyihir berkata: \"Hanya yang bisa membedakan genap dan ganjil yang boleh memilih pintu yang tepat!\"",
    problem:
      "Buat fungsi `isEven(n)` yang mengembalikan `true` jika `n` adalah angka genap, dan `false` jika ganjil.",
    hint: "Gunakan operator modulo `%`. Angka genap habis dibagi 2 (n % 2 === 0)",
    starterCode: `function isEven(n) {
  // return true jika n genap, false jika ganjil
  
}`,
    solutionFn: "isEven",
    testCases: [
      { description: "isEven(4) harus true", input: [4], expected: true },
      { description: "isEven(7) harus false", input: [7], expected: false },
      { description: "isEven(0) harus true", input: [0], expected: true },
      { description: "isEven(99) harus false", input: [99], expected: false },
    ],
    xpReward: 120,
    difficulty: "easy",
    tags: ["kondisi", "modulo", "boolean"],
  },
];

// ============================================================
// CHAPTER 2 — The Loop Labyrinth (Looping)
// ============================================================
const chapter2Quests: Quest[] = [
  {
    id: "ch2-q1",
    chapterId: 2,
    order: 1,
    title: "Hitung Mundur!",
    story:
      "Labirin berhitung muncul di hadapanmu. Pintu hanya akan terbuka jika kamu bisa menghitung mundur dari angka yang diberikan hingga 1, mengumpulkan semua angka dalam sebuah wadah ajaib.",
    problem:
      "Buat fungsi `countDown(n)` yang mengembalikan array berisi angka dari `n` hingga `1` secara berurutan.",
    hint: "Gunakan loop `for` dari `n` turun ke `1`, dan `.push()` setiap angka ke dalam array.",
    starterCode: `function countDown(n) {
  const result = [];
  // Isi result dengan angka dari n hingga 1
  
  return result;
}`,
    solutionFn: "countDown",
    testCases: [
      {
        description: "countDown(5) = [5,4,3,2,1]",
        input: [5],
        expected: [5, 4, 3, 2, 1],
      },
      {
        description: "countDown(3) = [3,2,1]",
        input: [3],
        expected: [3, 2, 1],
      },
      { description: "countDown(1) = [1]", input: [1], expected: [1] },
    ],
    xpReward: 150,
    difficulty: "easy",
    tags: ["loop", "for", "array"],
  },
  {
    id: "ch2-q2",
    chapterId: 2,
    order: 2,
    title: "Deret Fibonacci!",
    story:
      "Di jantung labirin tersimpan gulungan misterius bertuliskan angka 1, 1, 2, 3, 5, 8... \"Ini adalah kunci labirin!\" bisik suara misterius. \"Teruskan deret ini!\"",
    problem:
      "Buat fungsi `fibonacci(n)` yang mengembalikan array berisi `n` angka pertama dari deret Fibonacci.",
    hint:
      "Mulai dengan [1, 1]. Setiap angka berikutnya adalah jumlah dua angka sebelumnya.",
    starterCode: `function fibonacci(n) {
  if (n <= 0) return [];
  if (n === 1) return [1];
  
  const result = [1, 1];
  // Lanjutkan deret fibonacci hingga n angka
  
  return result;
}`,
    solutionFn: "fibonacci",
    testCases: [
      { description: "fibonacci(5) = [1,1,2,3,5]", input: [5], expected: [1, 1, 2, 3, 5] },
      { description: "fibonacci(1) = [1]", input: [1], expected: [1] },
      { description: "fibonacci(7) = [1,1,2,3,5,8,13]", input: [7], expected: [1, 1, 2, 3, 5, 8, 13] },
    ],
    xpReward: 200,
    difficulty: "medium",
    tags: ["loop", "fibonacci", "array"],
  },
];

// ============================================================
// CHAPTER 3 — The Function Fortress (Functions)
// ============================================================
const chapter3Quests: Quest[] = [
  {
    id: "ch3-q1",
    chapterId: 3,
    order: 1,
    title: "Balik Kata!",
    story:
      "Gerbang benteng terkunci oleh sebuah kata sandi yang tertulis terbalik. \"Balikkan kata ini dan gerbang akan terbuka!\" teriak penjaga benteng dari menara.",
    problem:
      "Buat fungsi `reverseString(str)` yang mengembalikan string yang dibalik karakternya.",
    hint:
      "Kamu bisa split string menjadi array, balik array dengan `.reverse()`, lalu join kembali dengan `.join('')`.",
    starterCode: `function reverseString(str) {
  // Kembalikan str yang dibalik
  
}`,
    solutionFn: "reverseString",
    testCases: [
      { description: "reverseString('hello') = 'olleh'", input: ["hello"], expected: "olleh" },
      { description: "reverseString('dungeon') = 'noegnud'", input: ["dungeon"], expected: "noegnud" },
      { description: "reverseString('a') = 'a'", input: ["a"], expected: "a" },
    ],
    xpReward: 150,
    difficulty: "easy",
    tags: ["string", "array", "method"],
  },
  {
    id: "ch3-q2",
    chapterId: 3,
    order: 2,
    title: "Temukan Angka Terbesar!",
    story:
      "Di dalam benteng tersimpan banyak kristal ajaib dengan nilai berbeda. Sang raja berkata: \"Hanya yang bisa menemukan kristal paling kuat yang layak menjadi pahlawan!\"",
    problem:
      "Buat fungsi `findMax(arr)` yang menerima array of numbers dan mengembalikan angka terbesar.",
    hint:
      "Kamu bisa gunakan `Math.max(...arr)` atau loop untuk membandingkan setiap elemen.",
    starterCode: `function findMax(arr) {
  // Kembalikan angka terbesar dari array
  
}`,
    solutionFn: "findMax",
    testCases: [
      { description: "findMax([3,1,4,1,5,9]) = 9", input: [[3, 1, 4, 1, 5, 9]], expected: 9 },
      { description: "findMax([1]) = 1", input: [[1]], expected: 1 },
      { description: "findMax([-5,-1,-3]) = -1", input: [[-5, -1, -3]], expected: -1 },
    ],
    xpReward: 160,
    difficulty: "easy",
    tags: ["array", "Math", "loop"],
  },
];

// ============================================================
// CHAPTER 4 — The Array Abyss (Array & Object)
// ============================================================
const chapter4Quests: Quest[] = [
  {
    id: "ch4-q1",
    chapterId: 4,
    order: 1,
    title: "Duplikat Hilang!",
    story:
      "Di jurang kegelapan, ribuan bayangan duplikat bermunculan membingungkan. \"Singkirkan semua duplikat!\" seru mentor-mu. \"Hanya yang unik yang bisa bertahan!\"",
    problem:
      "Buat fungsi `removeDuplicates(arr)` yang mengembalikan array baru tanpa elemen duplikat.",
    hint: "Kamu bisa gunakan `Set` untuk menghilangkan duplikat: `[...new Set(arr)]`.",
    starterCode: `function removeDuplicates(arr) {
  // Kembalikan array tanpa duplikat
  
}`,
    solutionFn: "removeDuplicates",
    testCases: [
      {
        description: "removeDuplicates([1,2,2,3,3,4]) = [1,2,3,4]",
        input: [[1, 2, 2, 3, 3, 4]],
        expected: [1, 2, 3, 4],
      },
      {
        description: "removeDuplicates([1,1,1]) = [1]",
        input: [[1, 1, 1]],
        expected: [1],
      },
    ],
    xpReward: 180,
    difficulty: "medium",
    tags: ["array", "Set", "filter"],
  },
];

// ============================================================
// CHAPTER 5 — Boss Tower (Boss Challenge)
// ============================================================
const chapter5Quests: Quest[] = [
  {
    id: "ch5-boss",
    chapterId: 5,
    order: 1,
    title: "⚔️ BOSS: Sang Naga Palindrom!",
    story:
      "Di puncak menara berdiri Naga Palindrom — makhluk kuno yang kata-katanya sama dibaca dari kiri maupun kanan. \"Kalahkan aku! Buktikan kamu bisa mengenali palindrom!\" raungan sang naga menggetarkan seluruh dungeon.",
    problem:
      "Buat fungsi `isPalindrome(str)` yang mengembalikan `true` jika `str` adalah palindrom (dibaca sama dari depan maupun belakang, abaikan spasi dan kapital).",
    hint:
      "Bersihkan string (lowercase, hapus non-alfanumerik), lalu bandingkan dengan versi terbaliknya.",
    starterCode: `function isPalindrome(str) {
  // Bersihkan string: lowercase, hapus karakter non-alfanumerik
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Cek apakah cleaned sama dengan versi terbaliknya
  
}`,
    solutionFn: "isPalindrome",
    testCases: [
      { description: "'racecar' adalah palindrom", input: ["racecar"], expected: true },
      { description: "'hello' bukan palindrom", input: ["hello"], expected: false },
      { description: "'A man a plan a canal Panama' adalah palindrom", input: ["A man a plan a canal Panama"], expected: true },
      { description: "'level' adalah palindrom", input: ["level"], expected: true },
    ],
    xpReward: 500,
    difficulty: "boss",
    tags: ["string", "palindrom", "boss", "regex"],
  },
];

// ============================================================
// SEMUA CHAPTER
// ============================================================
export const chapters: Chapter[] = [
  {
    id: 1,
    title: "The Starter's Cave",
    subtitle: "Gua Para Pemula",
    emoji: "🟢",
    description: "Pelajari dasar variabel, tipe data, dan fungsi sederhana. Tempat setiap petualang memulai perjalanan.",
    requiredLevel: 1,
    color: "from-emerald-900/50 to-emerald-700/20",
    quests: chapter1Quests,
  },
  {
    id: 2,
    title: "The Loop Labyrinth",
    subtitle: "Labirin Perulangan",
    emoji: "🟡",
    description: "Kuasai for loop, while loop, dan rekursi untuk menembus labirin yang tak berujung.",
    requiredLevel: 2,
    color: "from-yellow-900/50 to-yellow-700/20",
    quests: chapter2Quests,
  },
  {
    id: 3,
    title: "The Function Fortress",
    subtitle: "Benteng Fungsi",
    emoji: "🟠",
    description: "Bangun senjata dari fungsi-fungsi canggih. Pelajari higher-order functions dan closures.",
    requiredLevel: 4,
    color: "from-orange-900/50 to-orange-700/20",
    quests: chapter3Quests,
  },
  {
    id: 4,
    title: "The Array Abyss",
    subtitle: "Jurang Array",
    emoji: "🔴",
    description: "Selami kedalaman array dan object. Manipulasi data seperti seorang wizard sejati.",
    requiredLevel: 6,
    color: "from-red-900/50 to-red-700/20",
    quests: chapter4Quests,
  },
  {
    id: 5,
    title: "The Boss Tower",
    subtitle: "Menara Sang Boss",
    emoji: "💀",
    description: "Hadapi boss akhir dungeon. Gabungkan semua ilmu untuk mengalahkan tantangan terbesar!",
    requiredLevel: 8,
    color: "from-purple-900/50 to-purple-700/20",
    quests: chapter5Quests,
  },
];

// Helper: get quest by id
export function getQuestById(id: string): Quest | undefined {
  for (const chapter of chapters) {
    const q = chapter.quests.find((q) => q.id === id);
    if (q) return q;
  }
  return undefined;
}

// Helper: get all quests flat
export function getAllQuests(): Quest[] {
  return chapters.flatMap((c) => c.quests);
}
