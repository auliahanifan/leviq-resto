import Link from "next/link";
import styles from "./day-1.module.css";

type Entry = {
  idx: string;
  time: string;
  text: string;
};

type Session = {
  num: string;
  title: string;
  effort: "high" | "xhigh";
  id: string;
  entries: Entry[];
};

const SESSIONS: Session[] = [
  {
    num: "Sesi 01",
    title: "Penyusunan PRD",
    effort: "high",
    id: "a96d83e8",
    entries: [
      {
        idx: "01",
        time: "21:00:12",
        text: "bikin PRD (Product Requirement Document) file\n\nsaya punya restoran, ingin buat aplikasi kasir\n\ninterview me until 95% confident",
      },
      { idx: "02", time: "21:08:36", text: "LeviqResto" },
    ],
  },
  {
    num: "Sesi 02",
    title: "Hubungkan ke GitHub",
    effort: "high",
    id: "fb6514ef",
    entries: [
      { idx: "03", time: "21:13:57", text: "connect folder ini ke github" },
      { idx: "04", time: "21:18:02", text: "sudah" },
    ],
  },
  {
    num: "Sesi 03",
    title: "Rapikan struktur dokumen",
    effort: "high",
    id: "905ceaa6",
    entries: [
      {
        idx: "05",
        time: "21:18:43",
        text: "buat folder docs pindahkan PRD.md ke folder docs",
      },
      { idx: "06", time: "21:19:13", text: "commit and push" },
    ],
  },
  {
    num: "Sesi 04",
    title: "Susun daftar tugas",
    effort: "high",
    id: "849e2a12",
    entries: [
      {
        idx: "07",
        time: "21:20:04",
        text: "buat kan list of task untuk implement PRD.md\n\nbuat di 1 file khusus\n\ndi docs/tasks",
      },
      { idx: "08", time: "21:22:21", text: "commit and push" },
    ],
  },
  {
    num: "Sesi 05",
    title: "Implementasi Fase 0",
    effort: "high",
    id: "bc35732b",
    entries: [
      {
        idx: "09",
        time: "21:22:58",
        text: "implement task Fase 0 — Setup Project\npastikan file task ter update\n\nand tiap sub task commit",
      },
    ],
  },
  {
    num: "Sesi 06",
    title: "Implementasi paralel seluruh fase",
    effort: "xhigh",
    id: "ba0de00c",
    entries: [
      {
        idx: "10",
        time: "21:35:46",
        text: "Implement semua task yang blm dikerjakan di tasks.md\n\nJangan lupa update file tasks.md nya jika sudah selesai\nCommit and push setiap sub task\n\nKerjakan secara paralel jika memungkinkan",
      },
      { idx: "11", time: "22:15:16", text: "continue" },
      { idx: "12", time: "23:45:53", text: "Can you fix all of that?" },
    ],
  },
];

export default function Day1PromptHistoryPage() {
  const totalPrompts = SESSIONS.reduce((n, s) => n + s.entries.length, 0);

  return (
    <div className={styles.page}>
      <div className={styles.sheet}>
        <Link href="/prompt-histories" className={styles.backLink}>
          ← Riwayat Prompt
        </Link>

        <header className={styles.masthead}>
          <p className={styles.eyebrow}>Leviq Resto · Claude Code</p>
          <h1 className={styles.title}>Catatan Perintah Harian</h1>
          <div className={styles.metaLine}>
            <span>
              <b>Tanggal</b> 22 Juli 2026
            </span>
            <span>
              <b>Zona waktu</b> WIB (UTC+7)
            </span>
            <span>
              <b>Direktori</b> leviq-resto
            </span>
          </div>
        </header>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{totalPrompts}</span>
            <span className={styles.statLabel}>Perintah</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>
              {String(SESSIONS.length).padStart(2, "0")}
            </span>
            <span className={styles.statLabel}>Sesi</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>Sonnet 5</span>
            <span className={styles.statLabel}>Model</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>21:00–23:45</span>
            <span className={styles.statLabel}>Rentang WIB</span>
          </div>
        </div>

        {SESSIONS.map((session) => (
          <div className={styles.session} key={session.id}>
            <div className={styles.sessionHead}>
              <span className={styles.sessionNum}>{session.num}</span>
              <span className={styles.sessionTitle}>{session.title}</span>
              <span className={styles.effortPill} data-level={session.effort}>
                effort: {session.effort}
              </span>
              <span className={styles.sessionId}>{session.id}</span>
            </div>
            <div className={styles.entries}>
              {session.entries.map((entry) => (
                <div className={styles.entry} key={entry.idx}>
                  <div className={styles.entryMeta}>
                    <span className={styles.entryIdx}>{entry.idx}</span>
                    <span className={styles.entryTime}>{entry.time}</span>
                  </div>
                  <div className={styles.entryText}>{entry.text}</div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <footer className={styles.footer}>
          <span>Diekstrak dari log lokal Claude Code (~/.claude/projects)</span>
          <span>
            Hanya prompt asli dari pengguna — hasil tool &amp; balasan asisten
            tidak disertakan
          </span>
        </footer>
      </div>
    </div>
  );
}
