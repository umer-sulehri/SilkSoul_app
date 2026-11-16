import Link from "next/link";
import { Container } from "@/components/ui/layout";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center">
      <Container size="narrow" className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">404</p>
        <h1 className="mt-3 font-serif text-4xl text-ink sm:text-5xl">
          This page has wandered off.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          The page you are looking for may have moved, or the product may no longer be
          available.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={buttonVariants({})}>Back home</Link>
          <Link href="/products" className={buttonVariants({ variant: "outline" })}>
            Shop products
          </Link>
        </div>
      </Container>
    </div>
  );
}
