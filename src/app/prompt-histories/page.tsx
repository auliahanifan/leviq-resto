import Link from "next/link";
import styles from "./prompt-histories.module.css";

type Day = {
  slug: string;
  title: string;
  date: string;
  promptCount: number;
  sessionCount: number;
};

const DAYS: Day[] = [
  {
    slug: "day-1",
    title: "Hari 1",
    date: "22–23 Juli 2026",
    promptCount: 15,
    sessionCount: 6,
  },
  {
    slug: "day-2",
    title: "Hari 2",
    date: "23–24 Juli 2026",
    promptCount: 26,
    sessionCount: 12,
  },
];

export default function PromptHistoriesPage() {
  return (
    <div className={styles.page}>
      <div className={styles.sheet}>
        <header className={styles.masthead}>
          <p className={styles.eyebrow}>Leviq Resto · Claude Code</p>
          <h1 className={styles.title}>Riwayat Prompt</h1>
          <p className={styles.subtitle}>
            Catatan perintah asli yang dikirim ke Claude Code saat membangun
            proyek ini, dikelompokkan per hari.
          </p>
        </header>

        {DAYS.length === 0 ? (
          <p className={styles.empty}>Belum ada catatan.</p>
        ) : (
          <div className={styles.list}>
            {DAYS.map((day, i) => (
              <Link
                href={`/prompt-histories/${day.slug}`}
                className={styles.row}
                key={day.slug}
              >
                <span className={styles.rowNum}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={styles.rowBody}>
                  <span className={styles.rowTitle}>
                    {day.title} — {day.date}
                  </span>
                  <span className={styles.rowMeta}>
                    <span>{day.promptCount} perintah</span>
                    <span>{day.sessionCount} sesi</span>
                  </span>
                </span>
                <span className={styles.rowArrow}>→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
