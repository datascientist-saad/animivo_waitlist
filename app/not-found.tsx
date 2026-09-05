import Link from "next/link";
import { BrandMark } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-6">
        <BrandMark />
      </header>
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 pb-16 text-center">
        <p className="text-sm font-medium text-primary">Animivo</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          That link doesn’t lead anywhere. Head back to the waitlist to join the Founding 100.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground"
        >
          Back to the waitlist
        </Link>
      </main>
    </div>
  );
}
