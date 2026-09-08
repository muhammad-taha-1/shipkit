import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/modules/auth/auth";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            ShipKit
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            {session ? (
              <Button render={<Link href="/dashboard" />}>Dashboard</Button>
            ) : (
              <>
                <Button variant="ghost" render={<Link href="/login" />}>
                  Log in
                </Button>
                <Button render={<Link href="/register" />}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-muted/30 border-t">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <p className="text-lg font-bold">ShipKit</p>
              <p className="text-muted-foreground mt-2 text-sm">Ship your SaaS faster.</p>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold">Product</p>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <Link href="#features" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold">Developers</p>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <a
                    href="https://github.com/muhammad-taha-1/shipkit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground"
                  >
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold">Legal</p>
              <ul className="text-muted-foreground space-y-2 text-sm">
                <li>
                  <span className="cursor-default">Privacy Policy</span>
                </li>
                <li>
                  <span className="cursor-default">Terms of Service</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="text-muted-foreground mt-8 border-t pt-8 text-center text-sm">
            &copy; {new Date().getFullYear()} ShipKit. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
