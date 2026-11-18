import Link from "next/link";
export default function NotFound() {
  return (
    <main className="setup-page">
      <span className="eyebrow">404 / BM SCREENERS</span>
      <h1>Halaman tidak ditemukan.</h1>
      <p>Gunakan menu workspace untuk melanjutkan riset.</p>
      <Link href="/dashboard" className="btn btn-primary">
        Buka dashboard
      </Link>
    </main>
  );
}
