"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="setup-page">
      <h1>Halaman belum dapat dimuat.</h1>
      <p>
        Coba lagi. Jika berulang, periksa log Vercel dan konfigurasi
        environment.
      </p>
      <button className="btn btn-primary" onClick={() => reset()}>
        Coba lagi
      </button>
    </main>
  );
}
