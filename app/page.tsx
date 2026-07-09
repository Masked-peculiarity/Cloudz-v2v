import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center gap-8 p-8">
      <div>
        <h1 className="text-3xl font-semibold text-zinc-900">SafeSphere</h1>
        <p className="mt-2 text-zinc-600">
          Women&apos;s safety PWA — backend critical path is live.
        </p>
      </div>

      <nav className="flex flex-col gap-3 text-lg">
        <Link href="/auth" className="rounded border border-zinc-300 px-4 py-3 hover:bg-zinc-50">
          Sign in (Phone OTP)
        </Link>
        <Link href="/sos" className="rounded bg-red-600 px-4 py-3 text-white hover:bg-red-700">
          SOS Trigger (ShadowStream)
        </Link>
      </nav>

      <p className="text-sm text-zinc-500">
        Team: run <code className="rounded bg-zinc-100 px-1">supabase/schema.sql</code> in the
        Supabase SQL editor, then set env vars from{" "}
        <code className="rounded bg-zinc-100 px-1">.env.example</code>.
      </p>
    </div>
  );
}
