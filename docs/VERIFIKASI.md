# Status verifikasi BM Screeners 1.0.2

## Pemeriksaan konfigurasi build — 17 November 2026

- File unggahan dibandingkan dengan ZIP v1.0.1: identik, tidak ada file hilang atau isi berbeda.
- Instalasi bersih v1.0.2: Node.js 24.22.1 dan npm 12.2.2, dengan `NODE_ENV=production` serta `npm ci --include=dev`, berhasil.
- Kebijakan `allowScripts` diterima npm 12; peringatan skrip esbuild/core-js yang belum diizinkan tidak muncul lagi. Peringatan deprecation dependensi ExcelJS masih muncul.
- Build produksi v1.0.2 melalui `npm run build` berhasil: 122 import lokal valid, pemeriksaan TypeScript dan kompilasi Next.js selesai.
- Simulasi file `src/lib/supabase/server.ts` hilang menghasilkan exit 1 dan `Error: [BM_SOURCE_FILE]`.
- Simulasi paket TypeScript hilang menghasilkan exit 1 dan `Error: [BM_BUILD_DEPENDENCY]`.
- Perbandingan 44 file aplikasi/database terhadap unggahan memastikan isi file tersebut tetap sama. Versi, engines, dan dependensi package/lockfile sesuai.

Ini pemeriksaan lokal. Deployment pada akun Vercel pengguna belum dapat diverifikasi, dan penyebab kegagalan spesifik di akun tersebut belum direproduksi. Pengujian fitur dan UI di bawah merupakan hasil pemeriksaan sebelumnya; perubahan v1.0.2 berfokus pada konfigurasi serta pelaporan build.

## Pemeriksaan perbaikan import — 17 November 2026

- Node.js 24.22.1; dependensi terpasang dari lockfile dengan `npm ci`.
- 63 import beralias di 23 file aplikasi diganti menjadi jalur relatif. Perbandingan terhadap source asli memastikan perubahan pada file aplikasi hanya menyentuh jalur import.
- `npm run check:project` lulus: 122 import lokal valid dan file wajib lengkap.
- Pemeriksaan sebelum build diuji dengan simulasi `server.ts` hilang serta berubah nama menjadi `Server.ts`. Kedua kondisi dihentikan dengan pesan yang menyebutkan jalur file; file asli kemudian dipulihkan.
- `npm run build` lulus, termasuk kompilasi TypeScript serta route `/auth/callback` dan `/auth/confirm`.
- `npm test` lulus: 21 pengujian pada dua berkas.
- Versi dan daftar dependensi pada `package.json` serta `package-lock.json` sesuai.

Pengujian ini menggunakan source paket lengkap. Repository GitHub dan deployment Vercel pengguna belum diperiksa langsung. Pengujian antarmuka di bawah adalah catatan versi awal dan tidak diulang untuk perubahan import ini.

## Pemeriksaan versi awal — 13 November 2026

Paket diperiksa pada 13 November 2026. Ini laporan pengujian lokal, bukan bukti aplikasi sudah di-deploy di akun Vercel atau sudah terhubung ke layanan eksternal.

## Pemeriksaan yang dijalankan

- Instalasi dari lockfile dengan `npm ci` dan build produksi Next.js dengan `npm run build`.
- TypeScript: `npm run typecheck` lulus.
- ESLint: tidak ada error. Satu warning kompatibilitas React Compiler pada `useReactTable`; React Compiler tidak diaktifkan. Ini bukan kegagalan build.
- Vitest: **21 pengujian lulus**, termasuk perhitungan indikator, sizing risiko/lot/fee, average cost, backtest kausal, sanitasi CSV, freshness data, migration PostgreSQL, isolasi RLS antar-akun, transaksi atomik, dan deduplikasi outbox.
- Pemeriksaan antarmuka demo di browser: dashboard, preset harga di bawah Rp50, chart candlestick dan interval mingguan, simpan/reload watchlist, kalkulator dan simpan rencana, serta unduhan CSV/XLSX/PDF.
- Layout dashboard dan screener diperiksa pada frame 390 × 844; navigasi seluler berfungsi dan tidak ada overflow horizontal pada halaman. Tabel dan preset dapat digeser di dalam area masing-masing.

## Belum teruji dengan akun eksternal

- Deploy di akun Vercel milik Anda.
- Login, verifikasi email dan reset password terhadap project Supabase sungguhan beserta SMTP.
- Data vendor pasar aktual, ketentuan lisensi, cakupan seluruh IDX, keterlambatan feed, dan kualitas histori yang disesuaikan.
- Webhook Telegram, pengiriman pesan, dan pemanggilan job oleh scheduler produksi.
- Beban multi-pengguna besar dan pipeline intraday.

Kredensial layanan tersebut tidak disertakan. Jalankan pengujian integrasi setelah konfigurasi pada `PANDUAN-VERCEL.md` selesai. Pengujian browser manual di atas tidak berarti seluruh kombinasi form dan browser sudah diuji otomatis; suite Playwright juga disediakan untuk dijalankan di komputer Anda.
