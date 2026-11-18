# Perbaikan module not found — BM Screeners 1.0.1

Paket ini memperbaiki ketergantungan import internal pada alias `@/`. Seluruh import internal yang sebelumnya memakai alias sekarang memakai jalur relatif. File Supabase tetap berada di `src/lib/supabase/server.ts`.

Contoh pada `src/app/auth/confirm/route.ts` dan `src/app/auth/callback/route.ts`:

```ts
import { serverClient } from "../../../lib/supabase/server";
```

`npm run build` sekarang memeriksa keberadaan file inti dan jalur import, termasuk huruf besar/kecil, sebelum menjalankan Next.js. Anda juga dapat menjalankannya dengan `npm run check:project`. TypeScript mengaktifkan `forceConsistentCasingInFileNames`.

## Memasang paket pengganti

1. Ekstrak `BM-Screeners-Vercel-v1.0.2.zip` ke folder baru di komputer Anda.
2. Cadangkan perubahan pribadi pada source proyek lama jika ada. Unggah seluruh isi paket baru ke repository GitHub yang terhubung dengan Vercel. Jangan hanya menyalin file `route.ts`.
3. Pada halaman utama repository harus terlihat `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `src`, dan `scripts`. Pertahankan seluruh struktur subfolder; jangan memindahkan isi `src` ke root.
4. Pastikan file `src/lib/supabase/server.ts` dan `src/lib/supabase/client.ts` ikut terunggah, dengan nama persis huruf kecil.
5. Commit dan push. Di Vercel, gunakan Framework Next.js dan Root Directory yang berisi `package.json`; untuk struktur paket ini gunakan root repository. Install Command: `npm ci --include=dev`; Build Command: `npm run build`; Output Directory: default Next.js.
6. Gunakan Node.js 24.x sesuai rentang `engines` paket. Jalankan deployment dari commit terbaru.

Setelah build dimulai, log seharusnya menampilkan `file wajib lengkap` dan `import lokal valid` sebelum Next.js melakukan kompilasi. Jika ada file yang belum diunggah atau salah penamaan, log akan menyebutkan jalurnya.

Paket asli v1.0 memiliki file Supabase dan alias yang lengkap. Repository yang mengalami error belum tersedia untuk diperiksa, sehingga penyebab spesifik pada repository tersebut belum dapat dipastikan. Paket ini menghilangkan ketergantungan source saat ini pada alias dan memudahkan deteksi unggahan yang tidak lengkap. Jalur relatif tetap memerlukan file tujuan diunggah lengkap.

Panduan konfigurasi akun, data pasar, dan Telegram tetap ada di `PANDUAN-VERCEL.md`.
