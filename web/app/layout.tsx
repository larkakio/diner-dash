import type { Metadata, Viewport } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const orbitron = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const rajdhani = Rajdhani({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const baseAppId = process.env.NEXT_PUBLIC_BASE_APP_ID ?? "";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://diner-dash-rho.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Neon Diner Dash",
  description:
    "Cyberpunk time-management diner — swipe to move, serve guests, daily check-in on Base.",
  icons: {
    icon: "/app-icon.jpg",
    apple: "/app-icon.jpg",
  },
  openGraph: {
    title: "Neon Diner Dash",
    description: "Swipe the floor. Serve the future. Base.",
    images: [{ url: "/app-thumbnail.jpg", width: 1200, height: 628 }],
  },
  other: baseAppId
    ? {
        "base:app_id": baseAppId,
      }
    : {},
};

export const viewport: Viewport = {
  themeColor: "#050508",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${orbitron.variable} ${rajdhani.variable} min-h-dvh bg-[#050508] font-[family-name:var(--font-ui)] text-white antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
