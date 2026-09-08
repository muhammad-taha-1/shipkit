import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Shield,
  CreditCard,
  Users,
  Bell,
  Upload,
  Zap,
  Lock,
  BarChart3,
  Mail,
  Clock,
  Server,
  TestTube,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "Authentication",
    description:
      "NextAuth v5 with credentials, Google, and GitHub OAuth. Email verification and password reset built in.",
  },
  {
    icon: Users,
    title: "Multi-Tenancy & RBAC",
    description:
      "Organization-based teams with Owner, Admin, and Member roles. 11 granular permissions enforced everywhere.",
  },
  {
    icon: CreditCard,
    title: "Stripe Billing",
    description:
      "Free, Pro, and Enterprise plans with checkout, webhooks, customer portal, and trial support.",
  },
  {
    icon: Mail,
    title: "Transactional Email",
    description:
      "Resend integration with React Email templates for welcome, verification, invitation, and notification emails.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description:
      "In-app and email notifications with per-type preferences, bell popover, and cursor-paginated history.",
  },
  {
    icon: Upload,
    title: "File Uploads",
    description:
      "Uploadthing with per-plan storage limits, user avatars, org logos, and drag-and-drop.",
  },
  {
    icon: BarChart3,
    title: "Dashboard & Analytics",
    description:
      "Stats cards, activity feed, and full audit logging. Super Admin panel with user and org management.",
  },
  {
    icon: Clock,
    title: "Background Jobs",
    description:
      "Inngest for async email delivery, cron cleanup tasks, and trial reminders with graceful fallback.",
  },
  {
    icon: Shield,
    title: "Rate Limiting",
    description:
      "Upstash Redis with sliding window presets. Falls back to in-memory when Redis is unavailable.",
  },
  {
    icon: TestTube,
    title: "Testing",
    description:
      "Vitest with 100+ unit tests covering utils, permissions, billing, validations, and rate limiting.",
  },
  {
    icon: Server,
    title: "Docker & CI/CD",
    description:
      "Multi-stage Dockerfile, GitHub Actions pipeline, and Husky pre-commit hooks with lint-staged.",
  },
  {
    icon: Zap,
    title: "Modern Stack",
    description:
      "Next.js 16, TypeScript 5, Tailwind CSS 4, Prisma 7, and shadcn/ui. Production-ready from day one.",
  },
];

const steps = [
  {
    step: "1",
    title: "Clone & Install",
    description: "Clone the repo, install dependencies, and copy the env file.",
  },
  {
    step: "2",
    title: "Configure",
    description: "Add your Stripe, Resend, and database credentials to .env.",
  },
  {
    step: "3",
    title: "Ship",
    description: "Run migrations, start the dev server, and start building your SaaS.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-muted),transparent_70%)]" />
        <div className="mx-auto max-w-4xl px-4 py-24 text-center md:py-32">
          <div className="bg-background text-muted-foreground mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm">
            <Zap className="h-3.5 w-3.5" />
            Open-source SaaS starter kit
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Ship your SaaS
            <br />
            <span className="text-muted-foreground">in days, not months</span>
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">
            Auth, billing, multi-tenancy, RBAC, email, file uploads, notifications, background jobs,
            and more — all wired up and ready to go. Stop rebuilding boilerplate. Start shipping
            features.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button size="lg" render={<Link href="/register" />}>
              Get Started Free
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              render={
                <a
                  href="https://github.com/muhammad-taha-1/shipkit"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              View on GitHub
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-muted/20 border-t py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need to launch</h2>
            <p className="text-muted-foreground mt-3">
              Production-ready features, not proof-of-concept demos.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="bg-background">
                <CardHeader className="pb-3">
                  <div className="bg-primary/10 mb-2 flex h-9 w-9 items-center justify-center rounded-lg">
                    <feature.icon className="text-primary h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Up and running in minutes</h2>
            <p className="text-muted-foreground mt-3">Three steps to your own SaaS platform.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="bg-primary text-primary-foreground mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/20 border-t py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Ready to ship?</h2>
          <p className="text-muted-foreground mt-3">
            Join developers who chose to ship features instead of rebuilding boilerplate.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button size="lg" render={<Link href="/register" />}>
              Start Building
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" render={<Link href="/pricing" />}>
              View Pricing
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
