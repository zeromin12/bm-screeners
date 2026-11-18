# Panduan BM Screeners → GitHub → Vercel

Paket ini adalah **proyek Next.js**, bukan file HTML atau template Blogger. Gunakan source di dalam ZIP, bukan mengunggah file ZIP sebagai isi repository.

## A. Deploy demo terlebih dahulu

1. Ekstrak `BM-Screeners-Vercel-v1.0.2.zip` di komputer Windows Anda.
2. Buka folder hasil ekstrak. Pastikan terlihat `package.json`, `package-lock.json`, `src`, `public`, dan `supabase` pada tingkat teratas.
3. Buat repository GitHub, misalnya `bm-screeners`.
4. Unggah **isi folder proyek** ke root repository. File `package.json` harus terlihat di halaman utama repository. Jangan unggah `node_modules` atau `.next`.
5. Di Vercel, pilih **Add New → Project → Import Git Repository** lalu pilih repository tersebut.
6. Gunakan pengaturan berikut:

| Pengaturan           | Nilai                                        |
| -------------------- | -------------------------------------------- |
| Framework Preset     | Next.js                                      |
| Root Directory       | Kosong/default jika package.json ada di root |
| Install Command      | npm ci --include=dev                         |
| Build Command        | npm run build                                |
| Output Directory     | Bawaan Next.js; jangan isi dist              |
| Node.js              | 24.x                                         |
| Environment APP_MODE | demo (atau kosong, default demo)             |

7. Klik **Deploy**. Setelah berhasil, buka URL yang diberikan Vercel, lalu klik **Buka workspace**.
8. Buka Screener, klik preset, simpan watchlist, dan coba kalkulator. Label DEMO harus tetap terlihat.

**Jika mengunggah lewat halaman GitHub dan ada batas jumlah file:** unggah beberapa batch. Cara yang lebih nyaman adalah GitHub Desktop: Add existing repository → commit → Publish repository. Pastikan hidden file `.gitignore` dan `.env.example` ikut; jangan pernah unggah `.env.local`.

Tidak ada username/password demo. Mode demo memakai browser lokal dan dapat dicoba sebelum Anda menyiapkan Supabase.

## B. Aktifkan login dan database produksi

1. Buat project Supabase.
2. Buka **SQL Editor**, tempel seluruh isi `supabase/migrations/001_bm_screeners.sql`, kemudian jalankan **sekali**. Migration dibungkus transaksi; kegagalan membatalkan keseluruhan perubahan.
3. Di Authentication, aktifkan email/password, email confirmation, dan atur minimum password sesuai kebijakan Anda (UI registrasi mensyaratkan 12 karakter).
4. Untuk email produksi, konfigurasikan SMTP sendiri sesuai panduan Supabase. Pengiriman bawaan memiliki batasan, jadi jangan menganggap email verifikasi pasti terkirim ke setiap alamat tanpa konfigurasi.
5. Salin Project URL, publishable key, dan secret key dari pengaturan API Supabase. Legacy anon/service_role hanya digunakan bila proyek Anda memang masih memakai key lama; jangan mempertukarkan key publik dengan key rahasia.
6. Di Vercel → Settings → Environment Variables, isi:

| Variabel                             | Contoh/nilai                    | Keterangan                                   |
| ------------------------------------ | ------------------------------- | -------------------------------------------- |
| APP_MODE                             | production                      | Mengaktifkan akun dan database               |
| NEXT_PUBLIC_SUPABASE_URL             | Project URL Supabase Anda       | Boleh di browser                             |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Publishable key proyek Anda     | Dilindungi grants dan RLS                    |
| SUPABASE_SECRET_KEY                  | Secret key Supabase Anda        | Server saja; jangan beri awalan NEXT_PUBLIC_ |
| APP_URL                              | URL produksi Vercel Anda        | Contoh https://nama-proyek.vercel.app        |
| CRON_SECRET                          | String acak minimal 32 karakter | Otorisasi endpoint job                       |
| MARKET_MAX_AGE_HOURS                 | 96                              | Batas umur data EOD/import sebelum stale     |

7. Di Supabase Authentication → URL Configuration, atur **Site URL** sama dengan APP_URL. Tambahkan redirect yang diizinkan:
   - URL produksi Anda + `/auth/callback`
   - URL produksi Anda + `/auth/callback?next=/reset-password`
   - URL produksi Anda + `/auth/confirm`
   - `http://localhost:3000/auth/callback` untuk pengembangan lokal.
8. Gunakan domain preview yang spesifik dan database terpisah untuk preview. Jangan menambahkan wildcard terlalu luas pada allowlist auth produksi.
9. **Redeploy** Vercel setelah environment berubah. Variabel NEXT_PUBLIC dibundel saat build.
10. Daftar akun melalui `/register`, verifikasi email, lalu login.

Alur callback default menggunakan PKCE. Bila konfirmasi dibuka di perangkat/browser lain, gunakan template email Supabase berbasis token hash yang mengarah ke `/auth/confirm?token_hash={{ .TokenHash }}&type=email`, dan `type=recovery` untuk pemulihan. Sesuaikan template mengikuti dokumentasi resmi Supabase; jangan menaruh token di log.

## C. Jadikan akun Anda Admin

Setelah akun dibuat, salin UUID akun dari Authentication → Users. Jalankan di SQL Editor Supabase sebagai pemilik proyek:

```sql
update public.profiles
set role = 'admin'
where id = 'GANTI_DENGAN_UUID_AKUN_ANDA';
```

Jangan mengubah akun orang lain. Tidak ada endpoint publik untuk menaikkan role. Alternatif lokal: isi `.env.local` lalu jalankan `npm run admin -- UUID_AKUN_ANDA`.

Logout/login atau muat ulang untuk melihat menu Admin. Akun Member tidak dapat menambah role lewat profil atau request browser.

## D. Masukkan data pasar

Produksi dimulai dengan dataset kosong. Ini sengaja dilakukan agar data simulasi tidak tersamar sebagai harga live.

**Jalur 1 — CSV:** Admin → Template CSV → isi data yang Anda miliki hak penggunaannya → Impor. Kolom wajib: `symbol,name,sector,price,asOf`. Kolom opsional: `board,prevClose,volume,source`. Timestamp menggunakan ISO 8601, misalnya tanggal dan jam UTC dengan akhiran `Z`. UI memberi label IMPORT. CSV quotes tidak menghasilkan indikator historis atau fundamental.

**Jalur 2 — Snapshot JSON:** gunakan struktur `docs/PROVIDER.md`, berisi data emiten, OHLCV, fundamental, benchmark dan metadata lisensi. Unduhan snapshot dari demo hanya contoh struktur; data DEMO ditolak oleh penyimpanan produksi.

**Jalur 3 — Bridge provider:** sediakan endpoint HTTPS milik Anda/vendor yang mengeluarkan kontrak JSON tersebut. Isi `MARKET_BRIDGE_URL` dan `MARKET_BRIDGE_TOKEN`, redeploy, kemudian klik **Sinkronkan bridge**. Bridge bukan endpoint resmi BEI yang dibuat oleh aplikasi. Kredensial dan izin vendor tetap perlu disediakan.

Semua impor **mengganti snapshot aktif**, bukan menambahkan baris satu per satu. UI meminta konfirmasi. Cadangkan dataset lama bila diperlukan.

Batas v1: upload admin 3,4 MB, fetch bridge 12 MB, maksimum 2.000 saham dan 3.000 candle per saham secara skema (batas byte tetap berlaku lebih dahulu). Jangan menganggap semua kombinasi batas tersebut dapat dimuat sekaligus. Untuk universe IDX penuh dengan histori panjang, optimalkan ingestion/storage per simbol sebelum peluncuran berskala besar.

## E. Telegram dan alert server

1. Buat bot melalui BotFather di Telegram. Simpan token di environment Vercel sebagai `TELEGRAM_BOT_TOKEN` dan username bot tanpa `@` sebagai `TELEGRAM_BOT_USERNAME`.
2. Buat `TELEGRAM_WEBHOOK_SECRET` acak minimal 32 karakter. Gunakan karakter yang didukung Telegram: huruf, angka, `_` dan `-`.
3. Redeploy setelah seluruh environment diisi.
4. Untuk mengatur webhook dari komputer Anda, isi variabel yang sama di `.env.local`, kemudian jalankan:

```bash
node --env-file=.env.local scripts/setup-telegram.mjs
```

5. Login ke BM Screeners → Pengaturan → Hubungkan Telegram. Buka tautan dan tekan Start. Kode hanya sekali pakai, kedaluwarsa 10 menit, dan di database hanya disimpan hash-nya.
6. Refresh Pengaturan setelah verifikasi, kemudian gunakan **Kirim pesan tes**. Tombol tes mengirim ke chat akun yang sudah diverifikasi, bukan chat ID bebas.
7. Buat aturan alert. Atur jam aktif sesuai jadwal job. EOD biasanya memerlukan jam aktif yang mencakup proses setelah penutupan.

Job: `GET /api/jobs`, header `Authorization: Bearer CRON_SECRET`. Endpoint menolak request tanpa secret, dan menolak mode demo.

Untuk **Vercel Cron klasik harian**, contoh opsional tambahan ke `vercel.json`:

```json
"crons": [{ "path": "/api/jobs", "schedule": "15 10 * * 1-5" }]
```

Cron klasik memakai UTC; contoh tersebut pukul 17.15 WIB pada hari kerja. Tetapkan jam akhir alert paling sedikit 19 agar mencakup presisi jadwal Hobby yang tidak selalu tepat menitnya. Kalender hari kerja bukan kalender hari libur bursa. Bar yang sama tidak mengirim alert berulang karena kunci unik alert/candle.

Jadwal ini tidak diaktifkan otomatis dalam paket supaya demo bisa langsung di-deploy tanpa secrets. Verifikasi batas paket dan fitur Schedules/Cron terbaru sebelum mengaktifkan intraday. Sumber data EOD tetap EOD walaupun job dipanggil lebih sering.

Outbox memproses maksimal 25 pesan per panggilan. Jika respons Telegram tidak pasti, event menjadi `uncertain` dan tidak otomatis dikirim ulang untuk menghindari duplikasi. Ini bukan jaminan exactly-once dari jaringan eksternal. Periksa event gagal/uncertain di Admin. Untuk banyak pengguna, diperlukan worker queue, lease recovery, retry terjadwal, dan monitoring tambahan.

## F. Troubleshooting

Untuk `Module not found: Can't resolve @/lib/supabase/server`, gunakan paket v1.0.2 lengkap dan ikuti [PERBAIKAN-IMPORT.md](PERBAIKAN-IMPORT.md). Build memeriksa kelengkapan file sebelum kompilasi.

| Masalah                                    | Perbaikan                                                                                          |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| package.json tidak ditemukan               | Pastikan file berada di root GitHub, atau ubah Root Directory ke folder yang memilikinya           |
| Framework terdeteksi Other                 | Pilih Next.js dan periksa package.json                                                             |
| Output Directory dist gagal                | Hapus override; gunakan bawaan Next.js                                                             |
| npm ci --include=dev gagal                 | Unggah package.json dan package-lock.json dari paket yang sama; jangan mencampur versi proyek lama |
| Warning dependency transitive deprecated   | Baca log sampai akhir; warning berbeda dari build error. Jangan mengubah versi secara acak         |
| Supabase belum dikonfigurasi               | Isi URL/key publik lalu redeploy; secret server tetap terpisah                                     |
| Email konfirmasi tidak datang              | Periksa SMTP, rate limit, daftar penerima, Site URL dan redirect URL                               |
| Redirect login berulang                    | Periksa key proyek yang sama, cookies, auth callback, dan log server                               |
| Tabel belum siap / rate limiter belum siap | Jalankan migration SQL, pastikan transaksi migration selesai                                       |
| 401                                        | Session belum valid atau secret job tidak cocok                                                    |
| 403 / akses khusus admin                   | Verifikasi UUID dan role di profiles; jangan mematikan RLS                                         |
| Data produksi kosong                       | Impor dataset atau hubungkan bridge; tidak ada harga live bawaan                                   |
| Indikator “—”                              | Data kurang, tidak tersedia, atau metrik tidak bermakna; sediakan histori yang cukup               |
| Backtest unadjusted ditolak                | Provider perlu memasok histori split-adjusted yang terverifikasi                                   |
| Alert tidak terkirim                       | Periksa jam WIB, data stale, aturan, cooldown, webhook, chat, token, job dan status outbox         |
| File impor terlalu besar                   | Kurangi cakupan/histori atau integrasikan pipeline per simbol sebelum produksi besar               |

## G. Pengujian lokal

```bash
npm ci --include=dev
npm run typecheck
npm run lint
npm test
npm run build
```

Pengujian PostgreSQL memakai PGlite dengan simulasi role dan auth.uid, tidak memerlukan akun Supabase. Untuk smoke test browser di komputer Anda, jalankan `npm run dev` pada terminal pertama, lalu pada terminal lain:

```bash
npx playwright install chromium
npm run test:e2e
```

Uji auth produksi, email verifikasi/reset, provider sungguhan, dan Telegram setelah Anda mengisi kredensial. Jangan menyimpulkan pengujian lokal membuktikan koneksi eksternal sudah aktif.

Dokumentasi resmi: [Next.js di Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [konfigurasi build](https://vercel.com/docs/builds/configure-a-build), [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Cron](https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing).
