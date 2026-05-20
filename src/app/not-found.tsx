import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <h1 className="font-display text-4xl font-bold text-ink">404</h1>
      <p className="mt-2 text-center text-slate-600">
        This page does not exist or the link is outdated.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
      >
        Back to home
      </Link>
    </div>
  );
}
