import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/layouts/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ShipKit",
    template: "%s | ShipKit",
  },
  description:
    "Production-ready SaaS starter kit with auth, billing, multi-tenancy, and RBAC.",
  openGraph: {
    title: "ShipKit",
    description:
      "Production-ready SaaS starter kit with auth, billing, multi-tenancy, and RBAC.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=document.documentElement;if(t==="dark")d.classList.add("dark");else if(t==="light")d.classList.add("light");else if(window.matchMedia("(prefers-color-scheme:dark)").matches)d.classList.add("dark");else d.classList.add("light")}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          {children}
          <Toaster richColors position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
