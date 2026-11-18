import Link from "next/link";
import {
  ArrowUpRight,
  ScanLine,
  ShieldCheck,
  LineChart,
  SlidersHorizontal,
  Layers3,
  ArrowRight,
  Check,
} from "lucide-react";
export default function Home() {
  return (
    <div className="landing">
      <header className="landing-header">
        <Link href="/" className="brand">
          <span className="brand-mark">
            bm<span>↗</span>
          </span>
          <span>
            BM<span className="brand-light">Screeners</span>
          </span>
        </Link>
        <nav>
          <a href="#features">Fitur</a>
          <Link href="/help">Metodologi</Link>
          <Link href="/login">Masuk</Link>
          <Link className="btn btn-primary" href="/dashboard">
            Buka workspace
            <ArrowUpRight size={16} />
          </Link>
        </nav>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-badge">
              <i className="status-dot" />
              WORKSPACE RISET SAHAM INDONESIA
            </span>
            <h1>
              Pasar penuh peluang.
              <br />
              <em>Temukan milik Anda.</em>
            </h1>
            <p>
              Saring saham IDX, pahami momentum, dan susun rencana dengan risiko
              terukur. Semua riset Anda, dalam satu workspace.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary large" href="/dashboard">
                Jelajahi BM Screeners
                <ArrowUpRight size={18} />
              </Link>
              <a className="btn btn-secondary large" href="#features">
                Lihat fitur
                <ArrowRight size={18} />
              </a>
            </div>
            <div className="hero-trust">
              <span>
                <Check size={14} />
                Metodologi terbuka
              </span>
              <span>
                <Check size={14} />
                Data berlabel jelas
              </span>
              <span>
                <Check size={14} />
                Desktop & mobile
              </span>
            </div>
          </div>
          <div className="hero-terminal">
            <div className="terminal-header">
              <span>
                <i />
                <i />
                <i />
              </span>
              <span>BM Screeners · Preview demo</span>
              <ScanLine size={16} />
            </div>
            <div className="terminal-body">
              <span className="eyebrow">MARKET OVERVIEW</span>
              <h2>Riset yang lebih terarah.</h2>
              <div className="hero-chart">
                <svg
                  viewBox="0 0 500 150"
                  role="img"
                  aria-label="Ilustrasi tren, bukan data pasar"
                >
                  <defs>
                    <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="#30ceb0" stopOpacity=".25" />
                      <stop offset="1" stopColor="#30ceb0" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 120 L25 113 L45 126 L65 99 L90 105 L110 85 L135 96 L160 62 L180 75 L210 53 L232 69 L255 48 L275 57 L298 26 L320 42 L340 30 L360 40 L390 16 L410 23 L440 8 L465 17 L500 3 L500 150 L0 150 Z"
                    fill="url(#chart-fill)"
                  />
                  <path
                    d="M0 120 L25 113 L45 126 L65 99 L90 105 L110 85 L135 96 L160 62 L180 75 L210 53 L232 69 L255 48 L275 57 L298 26 L320 42 L340 30 L360 40 L390 16 L410 23 L440 8 L465 17 L500 3"
                    fill="none"
                    stroke="#30ceb0"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>
              <div className="preview-table">
                <div>
                  <span>STRATEGI</span>
                  <span>INDIKATOR</span>
                  <span>PROSES</span>
                </div>
                {[
                  ["Trend Following", "EMA + ADX", "Saring"],
                  ["Breakout 21", "Harga + Volume", "Konfirmasi"],
                  ["Trading plan", "Modal + Risiko", "Rencanakan"],
                ].map(([a, b, c]) => (
                  <div key={a}>
                    <strong>{a}</strong>
                    <span>{b}</span>
                    <b>
                      {c}
                      <ArrowUpRight size={12} />
                    </b>
                  </div>
                ))}
              </div>
              <p className="muted">
                Ilustrasi tampilan. Data demo bukan harga pasar aktual.
              </p>
            </div>
            <div className="floating-label">
              <ShieldCheck size={22} />
              <div>
                <strong>Risiko selalu terlihat.</strong>
                <small>Entry, stop, target & ukuran posisi</small>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="features">
          <span className="eyebrow">DARI PENEMUAN KE KEPUTUSAN</span>
          <h2>Lengkapi proses investasi Anda.</h2>
          <div className="feature-grid">
            {[
              [
                SlidersHorizontal,
                "Screener yang fleksibel",
                "Gabungkan filter teknikal dan fundamental. Simpan kriteria yang cocok dengan strategi Anda.",
              ],
              [
                LineChart,
                "Konteks di balik harga",
                "Candlestick, indikator, kekuatan relatif, dan rincian BM Score yang dapat diperiksa.",
              ],
              [
                Layers3,
                "Riset yang tersimpan",
                "Kelola watchlist, portofolio, jurnal, dan laporan dalam satu workspace.",
              ],
              [
                ShieldCheck,
                "Rencana dengan batas risiko",
                "Hitung lot, biaya, stop-loss, target, dan uji aturan pada data historis.",
              ],
            ].map(([Icon, title, copy]) => {
              const I = Icon as typeof ShieldCheck;
              return (
                <article key={String(title)}>
                  <I size={23} />
                  <h3>{String(title)}</h3>
                  <p>{String(copy)}</p>
                </article>
              );
            })}
          </div>
        </section>
        <section className="landing-cta">
          <h2>Bangun proses. Ukur keputusan.</h2>
          <p>
            Mulai menjelajah dengan mode demo, lalu hubungkan sumber data Anda.
          </p>
          <Link href="/dashboard" className="btn btn-primary large">
            Buka workspace
            <ArrowUpRight size={18} />
          </Link>
        </section>
      </main>
      <footer className="landing-footer">
        <span>© 2026 BM Screeners.</span>
        <span>Temukan peluang, ukur risiko.</span>
        <Link href="/help">Metodologi & batasan</Link>
      </footer>
    </div>
  );
}
