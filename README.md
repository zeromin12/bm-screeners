# BM Screeners 1.0.2

Website screener saham IDX dengan Next.js, TypeScript, Supabase, dan Vercel.

**Cara paling cepat:** ekstrak paket → unggah isi folder ke GitHub (package.json terlihat di root) → import repository di Vercel → Framework Next.js → Deploy. Default langsung membuka mode demo tanpa API key.

Panduan langkah demi langkah: **[PANDUAN-VERCEL.md](PANDUAN-VERCEL.md)**.

Konfigurasi build terbaru: **[PERBAIKAN-BUILD-VERCEL.md](PERBAIKAN-BUILD-VERCEL.md)**.

Perbaikan error import dan cara memperbarui repository: **[PERBAIKAN-IMPORT.md](PERBAIKAN-IMPORT.md)**.

## Menjalankan lokal

Gunakan Node.js 24.x dan npm.

```bash
npm ci --include=dev
npm run dev
```

Buka http://localhost:3000. Tidak ada akun/password demo yang harus diingat. Klik **Buka workspace**.

```bash
npm run check:project
npm run typecheck
npm run lint
npm test
npm run build
npm start
```

## Yang tersedia

- Landing page dan dashboard responsif, tema terang/gelap, pencarian ticker.
- 24 instrumen contoh sintetis (23 kode saham + 1 instrumen FCA fiktif). Jumlah emiten produksi mengikuti feed, tidak dikunci pada dataset contoh.
- Screener AND/OR, crossover ambang, filter sektor/papan, preset, sort, pagination, kolom pilihan.
- EMA/SMA, RSI, MACD, ATR, ADX, Stochastic, Bollinger, breakout 21, RVOL, pullback, relative strength.
- BM Score dengan bobot 30/20/15/15/10/5/5, rincian subskor dan coverage; bobot pribadi dapat diubah.
- Chart candlestick D/W/M, volume, EMA20/50, garis support/resistance.
- Watchlist majemuk, catatan/tag/target, impor CSV, perbandingan 2–4 saham.
- Kalkulator trading plan dengan biaya, slippage, batas modal/risiko, ukuran lot.
- Portofolio manual berbasis average cost dan journal; data demo di localStorage, data produksi di Supabase.
- Backtest dua strategi dengan sinyal bar selesai, fee, slippage, stop konservatif, drawdown dan expectancy.
- Ekspor CSV/XLSX/PDF dan cetak; formula injection CSV dinetralisasi.
- Login/register/verifikasi/reset password Supabase, role Member/Admin, RLS, bootstrap admin.
- Aturan alert harian, outbox server, verifikasi Telegram, webhook, job sinkronisasi/pengiriman.
- Admin mengimpor CSV quotes atau snapshot JSON, menyinkronkan bridge, dan memeriksa job/pengguna.

## Kondisi yang perlu dipahami

**Ini source aplikasi, bukan langganan data BEI.** Tidak ada API key pasar, Supabase, atau bot pribadi yang disisipkan. Demo selalu berlabel DEMO. Produksi tanpa data menampilkan setup/error, tidak mengganti data dengan simulasi.

Provider produksi yang siap digunakan di kode: **impor CSV/JSON** dan **adapter bridge JSON milik operator** sesuai [kontrak provider](docs/PROVIDER.md). Adapter belum terhubung ke vendor komersial tertentu. Anda atau vendor perlu menyediakan bridge/ekspor yang memiliki izin tampilan. Tidak ada endpoint Yahoo/Stockbit yang dikarang.

Fitur yang bergantung pada sumber data: saham seluruh IDX, benchmark IHSG, fundamental, calendar, histori panjang, dan flow. Intraday/VWAP, broker summary, order book, berita, corporate actions rinci, model LLM, serta backtest fundamental point-in-time belum diaktifkan di UI ini. Antarmuka menjelaskan data yang belum tersedia.

Backend snapshot cocok untuk paket awal dengan universe/histori terbatas. Batas upload admin 3,4 MB, fetch bridge 12 MB. Untuk seluruh IDX dengan histori panjang dan intraday, pecah ingestion/per-symbol storage dan gunakan worker/queue; jangan mengirim puluhan MB pada setiap pembukaan dashboard. Panduan arsitektur menjelaskan batas implementasi v1.

Dua strategi backtest bersifat simulasi tanpa impact pasar/order queue. Tidak tersedia eksekusi broker otomatis. Alert server memakai bobot standar BM-1.0 dan timeframe 1D. Jadwal EOD aktif harus berada dalam jam alert pengguna.

## Struktur

- `src/app`: halaman Next.js, callback auth, API.
- `src/components`: workspace dan modul antarmuka.
- `src/lib`: kontrak data, indikator, finance, screening, scoring, adapters, security.
- `supabase/migrations`: schema, grants, RLS, transaksi atomik, outbox dan rate limit.
- `tests`: pengujian domain dan PostgreSQL di PGlite; `tests/e2e` untuk smoke test browser.
- `scripts`: bootstrap admin, setup webhook, wrapper development.
- `docs`: metodologi, provider, operasional, batasan dan status verifikasi.

## Lisensi & atribusi

Kode proyek dapat Anda gunakan dan modifikasi untuk BM Screeners. Lisensi dependensi tetap berlaku. Chart: TradingView Lightweight Charts, Apache-2.0 dengan atribusi bawaan dan tautan TradingView. Ikon: Lucide (ISC). Data pasar tetap mengikuti lisensi vendor; hak ekspor tidak berasal dari kode aplikasi.

© 2026 BM Screeners. Temukan peluang, ukur risiko.
