# BM Screeners 1.0.2 — konfigurasi dan diagnosis build Vercel

## Hasil pemeriksaan ZIP

ZIP yang diunggah identik dengan paket v1.0.1 yang berhasil dibangun pada pengujian lokal. Seluruh 72 file, termasuk modul Supabase, tersedia. Peringatan dependensi lama dan install-scripts dapat direproduksi dengan npm 12.2.2; paket v1.0.1 tetap berhasil dibangun dalam pengujian tersebut.

Penyebab spesifik deployment Vercel belum dapat ditetapkan dari baris `BUILD_UTILS_SPAWN_1` saja. Versi ini menyamakan konfigurasi instalasi dengan kebutuhan build dan menambahkan pesan error per tahap. Hasil lokal belum membuktikan deployment di akun Vercel sudah berhasil.

## Perubahan

- `package.json` dan `.nvmrc` menetapkan Node.js 24.x.
- Install Command menjadi `npm ci --include=dev`, agar TypeScript dan alat CSS tetap terpasang ketika lingkungan memakai mode produksi atau menghilangkan devDependencies secara default.
- Kebijakan npm mengizinkan skrip pemasangan `esbuild@0.28.2` secara spesifik. Postinstall `core-js` yang menampilkan banner pendanaan dinonaktifkan melalui `allowScripts`; fungsi pustakanya tetap tersedia.
- `npm run build` menjalankan pemeriksaan runtime/dependensi, pemeriksaan file, lalu `next build`. Setiap kegagalan mempertahankan status gagal dan menampilkan kode `Error: [BM_BUILD_...]` beserta tahapnya.
- Pemeriksaan TypeScript dan kompilasi Next.js tetap aktif. Folder source, fitur aplikasi, serta database mengikuti versi 1.0.1.

## Cara memasang

1. Ekstrak `BM-Screeners-Vercel-v1.0.2.zip` ke folder baru.
2. Unggah seluruh isi folder ke repository GitHub yang dihubungkan ke Vercel. Pastikan `scripts/build.mjs`, `scripts/check-project.mjs`, `package.json`, `package-lock.json`, `vercel.json`, dan seluruh folder `src` ikut terunggah.
3. Commit/push. Pastikan deployment menggunakan commit terbaru tersebut.
4. Periksa pengaturan berikut:

| Pengaturan       | Nilai                                           |
| ---------------- | ----------------------------------------------- |
| Framework        | Next.js                                         |
| Root Directory   | Root repository jika `package.json` ada di sana |
| Node.js          | 24.x                                            |
| Install Command  | `npm ci --include=dev`                          |
| Build Command    | `npm run build`                                 |
| Output Directory | Default Next.js                                 |

5. Jalankan deployment baru. Awal build harus menampilkan `[BM BUILD] BM Screeners 1.0.2`; teks ini menunjukkan paket baru benar-benar digunakan.

## Membaca kegagalan berikutnya

| Kode                                 | Yang perlu diperiksa                                                        |
| ------------------------------------ | --------------------------------------------------------------------------- |
| `BM_BUILD_NODE`                      | Runtime yang dipilih belum Node.js 24.x                                     |
| `BM_BUILD_DEPENDENCY`                | Dependensi build belum terpasang; periksa hasil install dan `--include=dev` |
| `BM_BUILD_SOURCE` / `BM_SOURCE_FILE` | File source belum terunggah atau nama/path berbeda                          |
| `BM_BUILD_NEXT` / `BM_BUILD_DETAIL`  | Kesalahan kompilasi atau TypeScript; sertakan detail sebelum kode tersebut  |
| `BM_BUILD_SETUP`                     | Konfigurasi atau file pendukung tidak dapat dibaca                          |

Jika gagal, salin log lengkap mulai `[BM BUILD]` sampai baris terakhir. Bila penanda tersebut tidak ada, periksa commit, Root Directory, file yang diunggah, dan Build Command. Jika hanya daftar peringatan yang terlihat, buka seluruh Build Logs dan kosongkan filter pencarian bila ada.

`npm warn deprecated` dari dependensi ExcelJS masih dapat tampil. `cache-dir` tidak didefinisikan dalam source paket; jika muncul, pengaturannya berasal dari lingkungan npm di luar paket. Peringatan tersebut sendiri belum menetapkan penyebab kegagalan build.

## Menjalankan lokal

```bash
npm ci --include=dev
npm run build
npm start
```

Referensi: [npm install-scripts](https://docs.npmjs.com/cli/v12/commands/npm-install-scripts/), [konfigurasi npm](https://docs.npmjs.com/using-npm/config/), [Build Logs Vercel](https://vercel.com/docs/deployments/logs).
