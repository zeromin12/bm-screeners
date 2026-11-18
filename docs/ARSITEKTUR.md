# Arsitektur dan batas operasional

Next.js menangani UI dan route handlers. Supabase Auth mengelola kredensial; aplikasi tidak menyimpan password sendiri. Cookie di-refresh melalui proxy Next.js; setiap API pribadi tetap memvalidasi pengguna di server. Profil role hanya dapat diubah dari konteks admin database/service, bukan metadata yang diedit anggota.

RLS dan grants diuji pada PostgreSQL lokal PGlite. Route record memakai allowlist tabel dan schema Zod per resource. Transaksi saham menggunakan RPC security-definer dengan pemeriksaan auth.uid, owner, tipe payload, advisory lock per pengguna dan ledger inventory. Grants langsung untuk mutasi tabel transactions dicabut agar validasi tersebut tidak dapat dilewati lewat Data API.

Model pribadi memakai tabel terpisah dengan payload JSON tervalidasi: watchlists, screeners, transactions, journal_entries, trading_plans, alerts, user_settings, backtests. Watchlist items disimpan dalam dokumen induk, sehingga tidak ada foreign key child yang dapat diarahkan ke induk milik pengguna lain. Portofolio diturunkan dari ledger transaksi dengan label portfolio.

Market data v1 disimpan sebagai satu snapshot di `market_snapshots`, bukan tabel historis terpisah. Ini menyederhanakan pemasangan dan membuat pergantian dataset atomik, namun memiliki batas ukuran/skalabilitas yang dinyatakan di README. Untuk rollout seluruh IDX intraday, migrasikan ke stock master, OHLCV per-symbol/date, quote snapshots, fundamental versions dan computed indicator snapshots; UI cukup menerima hasil screening dan memuat histori detail sesuai kebutuhan. Jangan memasarkan v1 sebagai layanan low-latency seluruh bursa.

Data pasar server di-cache singkat; data akun memakai cache private/no-store. Demo menggunakan dataset deterministik dan localStorage; tidak ada peniruan login anggota atau seolah database cloud sudah aktif. Data produksi kosong/gagal tidak beralih ke demo.

Job `/api/jobs` memakai bearer CRON_SECRET dan tidak dijalankan dari browser secara terus-menerus. Tanpa kredensial/scheduler, alert tidak berjalan otomatis. Event memiliki unique key `(alert_id,candle)`, cooldown, dan outbox claim atomik. Send Telegram adalah efek jaringan eksternal: jika respons tidak pasti, event ditandai uncertain. Operator harus menangani lease/retry/reconciliation jika menaikkan volume. Batas batch 25 pesan tidak dapat dijadikan antrian intraday besar tanpa worker tambahan.

Rate limit API disimpan di PostgreSQL, bukan memori serverless. Secrets hanya di environment server. Origin check melindungi request mutasi dari origin lintas situs. Logs tidak menyimpan token. App masih memerlukan kebijakan retensi/backup, monitoring biaya, security review deployment, dan pengujian provider operator untuk produksi publik.

Alur build standar: npm ci → typecheck/lint/test → next build. Tidak memakai static export karena login, database dan job memerlukan server. `vercel.json` tidak memaksakan output directory dan tidak membuat cron sebelum konfigurasi siap.

## Yang belum dapat diverifikasi tanpa akun operator

- Supabase hosted project, SMTP, email verification/reset dan callback pada domain sebenarnya.
- Pemasangan ke akun Vercel/GitHub pengguna.
- Konektivitas vendor data, hak penggunaan, cakupan seluruh IDX, freshness nyata.
- Webhook bot Telegram, pengiriman aktual dan scheduler terpasang.

Source, SQL, dan petunjuk konfigurasi disertakan. Keterbatasan ini bukan status koneksi berhasil.
