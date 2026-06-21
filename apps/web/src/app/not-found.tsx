import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#b7791f]">
        Not found
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-[#18211f]">This page is not available</h1>
      <p className="mt-4 text-[#66736d]">
        The equipment may have moved, sold, or not been published yet.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/catalog"
          className="inline-flex h-12 items-center justify-center rounded-lg bg-[#17463a] px-5 font-semibold text-white"
        >
          Browse catalog
        </Link>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-lg border border-[#17463a] px-5 font-semibold text-[#17463a]"
        >
          Home
        </Link>
      </div>
    </section>
  );
}
