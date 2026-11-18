# Kontrak provider BM Screeners v1

Adapter aktif: dataset demo deterministik, impor admin CSV/JSON, dan bridge HTTPS server-to-server. Tidak ada koneksi vendor live terkonfigurasi dalam paket.

Sebelum mengisi bridge, verifikasi dukungan saham IDX, klasifikasi instrumen, market timestamps, timezone, lisensi display/export/storage, pembatasan request, penyesuaian corporate actions, jumlah histori, SLA dan biaya dengan vendor. Portal resmi BEI: https://data.idx.co.id/.

`MARKET_BRIDGE_URL` adalah URL implementasi operator, bukan endpoint vendor yang diasumsikan tersedia. GET menerima bearer token opsional dan harus merespons JSON, tanpa redirect. Timeout 20 detik, maksimum respons 12 MB. Bridge harus mematuhi seluruh rate limit vendor.

## Envelope

```json
{
  "version": 1,
  "asOf": "2026-11-12T09:00:00.000Z",
  "source": "NAMA_PROVIDER_YANG_TERVERIFIKASI",
  "license": {
    "display": true,
    "export": false,
    "description": "Sesuai izin kontrak operator dengan provider"
  },
  "stocks": [],
  "benchmark": null,
  "calendar": null
}
```

`stocks` tidak boleh kosong pada impor. Contoh di bawah adalah **struktur dan angka ilustrasi**, bukan kutipan harga.

```json
{
  "symbol": "EXMP",
  "name": "Emiten Contoh",
  "sector": "Simulasi",
  "board": "Utama",
  "tradingStatus": "Aktif",
  "marketCap": null,
  "lotSize": 100,
  "priceBasis": "unadjusted",
  "quote": {
    "price": 100,
    "prevClose": 98,
    "open": 98,
    "high": 101,
    "low": 97,
    "volume": 10000,
    "value": null,
    "asOf": "2026-11-12T09:00:00.000Z",
    "fetchedAt": "2026-11-12T09:15:00.000Z",
    "source": "Impor contoh",
    "quality": "IMPORT",
    "delayMinutes": null
  },
  "bars": [
    {
      "time": "2026-11-12",
      "open": 98,
      "high": 101,
      "low": 97,
      "close": 100,
      "volume": 10000
    }
  ],
  "fundamentals": null,
  "foreignNet": null,
  "aggressionNet": null
}
```

- Enum board: `Utama`, `Pengembangan`, `Akselerasi`, `Pemantauan Khusus`.
- Status: `Aktif`, `Suspensi`, `Delisting`.
- Quality: `REAL-TIME`, `DELAYED`, `EOD`, `STALE`, `IMPORT`, `DEMO`.
- `DEMO` ditolak saat penyimpanan produksi; jangan sekadar mengganti label untuk mengelabui validasi.
- Pasokan hanya saham yang didukung, bukan waran/ETF dengan atribut saham. Simbol harus unik.
- `bars` adalah candle harian **selesai**, tanggal unik, terurut naik. Jangan masukkan candle hari berjalan yang belum selesai.
- Semua nilai harus finite; OHLC >0 dan high/low konsisten. Volume dalam lembar, value dalam rupiah.
- Nilai transaksi yang tidak tersedia harus null; tidak boleh otomatis close×volume.
- `asOf` menandai waktu pasar, `fetchedAt` menandai waktu pengambilan.
- Real-time menjadi STALE setelah 5 menit tanpa kutipan baru; delayed setelah delay yang diumumkan +5 menit. EOD/import menggunakan MARKET_MAX_AGE_HOURS (default 96 jam). Ini batas freshness operasional, bukan SLA.
- Pemrosesan hari libur dan sesi perlu verifikasi kalender vendor. Data terakhir pada hari libur dapat menjadi stale; operator menyesuaikan threshold EOD secara sadar.

## Fundamental

Jika tersedia, sertakan seluruh field berikut; nilai tidak tersedia tetap null:

`asOf` (tanggal laporan), `publishedAt` (waktu publikasi ISO), `period`, `roe`, `roa`, `npm`, `revenueGrowth`, `incomeGrowth`, `der`, `currentRatio`, `interestCoverage`, `ocf`, `fcf`, `eps`, `per`, `pbv`, `evEbitda`, `dividendYield`.

Definisi kontrak:

| Field                       | Basis                                                                                    |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| ROE                         | Net income attributable TTM / rata-rata ekuitas ×100; ekuitas nonpositif → null          |
| ROA                         | Net income TTM / rata-rata aset ×100                                                     |
| NPM                         | Net income TTM / revenue TTM ×100                                                        |
| revenueGrowth, incomeGrowth | TTM terbaru dibanding TTM tahun sebelumnya; basis nol/negatif yang tidak bermakna → null |
| DER                         | Utang berbunga / total equity; bukan total liabilitas secara otomatis                    |
| currentRatio                | Aset lancar / liabilitas lancar; sektor tidak relevan → null                             |
| interestCoverage            | EBIT TTM / beban bunga TTM; beban bunga tidak tersedia/nol → null                        |
| OCF                         | Arus kas operasi TTM dalam IDR                                                           |
| FCF                         | OCF TTM dikurangi capex kas (capex sebagai nilai pengeluaran positif)                    |
| EPS                         | Laba per saham TTM dengan penyesuaian saham yang konsisten                               |
| PER                         | Harga / EPS TTM; EPS <=0 → null                                                          |
| PBV                         | Harga / book value per share; ekuitas <=0 → null                                         |
| EV/EBITDA                   | Enterprise value / EBITDA TTM; denominator <=0 → null                                    |
| dividendYield               | Dividen kas trailing 12 bulan / harga ×100                                               |

Jika vendor memakai definisi berbeda, normalisasikan pada bridge atau tampilkan perbedaan di metadata/dokumentasi. Hindari membandingkan DER bank dengan perusahaan nonfinansial memakai ambang yang sama.

## Benchmark

`{"symbol":"IHSG","name":"IHSG","bars":[...]}` dengan schema OHLCV yang sama. Tanggal saham dan IHSG harus sama untuk perhitungan relative strength; jangan forward-fill hari yang hilang diam-diam.

## Kalender

Opsional `{"verifiedThrough":"YYYY-MM-DD","holidays":["YYYY-MM-DD"],"source":"sumber kalender"}`. Paket tidak menyertakan kalender bursa fiktif. Tanpa kalender yang benar, aplikasi tidak mengklaim pasar sedang buka.

## Cakupan lanjutan

Foreign flow hanya berasal dari data investor type resmi provider; satuan rupiah. Net aggression hanya dari feed trade classification yang terverifikasi; satuan rupiah dengan definisi buy-initiated minus sell-initiated. Jika berbeda definisi/satuan, jangan isi field sebelum normalisasi.

Corporate actions, berita, broker summary dan order book tidak ada dalam kontrak v1 dan tidak diaktifkan. Backtest produksi mensyaratkan `split-adjusted`; harga kutipan tetap harga nominal terkini. Provider bertanggung jawab atas penyesuaian histori serta volume yang konsisten. Retur dividen tidak dihitung.
