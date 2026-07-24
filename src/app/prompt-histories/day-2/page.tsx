import Link from "next/link";
import styles from "./day-2.module.css";
import sessionsData from "./data.json";

type Tool = {
  name: string;
  detail: string;
};

type Entry = {
  idx: string;
  time: string;
  text: string;
  responseText: string;
  tools: Tool[];
};

type Session = {
  num: string;
  title: string;
  effort: "high" | "xhigh";
  id: string;
  entries: Entry[];
};

const SESSIONS = sessionsData as Session[];

export default function Day2PromptHistoryPage() {
  const totalPrompts = SESSIONS.reduce((n, s) => n + s.entries.length, 0);
  const totalTools = SESSIONS.reduce(
    (n, s) => n + s.entries.reduce((m, e) => m + e.tools.length, 0),
    0
  );

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
              <b>Tanggal</b> 23–24 Juli 2026 (20:00–12:00 WIB)
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
            <span className={styles.statNum}>{totalTools}</span>
            <span className={styles.statLabel}>Tool calls</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>Sonnet 5</span>
            <span className={styles.statLabel}>Model</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>20:30–07:55</span>
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
              {session.entries.map((entry) => {
                const hasDetail =
                  entry.responseText.trim().length > 0 ||
                  entry.tools.length > 0;
                return (
                  <div className={styles.entry} key={entry.idx}>
                    <div className={styles.entryMeta}>
                      <span className={styles.entryIdx}>{entry.idx}</span>
                      <span className={styles.entryTime}>{entry.time}</span>
                    </div>
                    <div className={styles.entryBody}>
                      <div className={styles.entryText}>{entry.text}</div>
                      {hasDetail && (
                        <details className={styles.details}>
                          <summary className={styles.summary}>
                            respons &amp; tool calls
                            {entry.tools.length > 0
                              ? ` (${entry.tools.length})`
                              : ""}
                          </summary>
                          {entry.responseText.trim().length > 0 && (
                            <div className={styles.responseText}>
                              {entry.responseText}
                            </div>
                          )}
                          {entry.tools.length > 0 && (
                            <>
                              <p className={styles.toolListLabel}>
                                Tool calls
                              </p>
                              <ul className={styles.toolList}>
                                {entry.tools.map((tool, i) => (
                                  <li className={styles.toolItem} key={i}>
                                    <span className={styles.toolName}>
                                      {tool.name}
                                    </span>
                                    <span className={styles.toolDetail}>
                                      {tool.detail}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                        </details>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <footer className={styles.footer}>
          <span>Diekstrak dari log lokal Claude Code (~/.claude/projects)</span>
          <span>
            Termasuk respons asisten &amp; tool calls apa adanya, tanpa
            filtering
          </span>
        </footer>
      </div>
    </div>
  );
}
