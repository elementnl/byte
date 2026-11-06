import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Onest } from "next/font/google";
import { currentUser } from "@/server/supabase";
import { getSettings } from "@/server/settings";
import "./globals.css";

const body = Onest({ variable: "--font-body", subsets: ["latin"] });
const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Byte",
  description: "A tiny nutrition log.",
  appleWebApp: { capable: true, title: "Byte", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

async function theme() {
  const user = await currentUser();
  return user ? (await getSettings(user.id)).theme : "light";
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme={await theme()} className={`${body.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
