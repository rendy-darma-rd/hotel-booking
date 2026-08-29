import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createPublicClient } from "@/lib/supabase/public";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { HotelSettings } from "@/types/database";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Hotel",
  description: "Book a room online",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = createPublicClient();
  const { data } = await supabase.from("hotel_settings").select("*").eq("id", true).single();
  const settings = data as HotelSettings | null;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-stone-900">
        <SiteHeader hotelName={settings?.hotel_name ?? "My Hotel"} />
        <main className="flex-1">{children}</main>
        <SiteFooter settings={settings} />
      </body>
    </html>
  );
}
