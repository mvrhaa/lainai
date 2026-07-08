import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LainAI",
  description: "A polished AI dashboard for managing agents, chats, and user settings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}>
        <TRPCReactProvider>
          {children}
          <Toaster richColors closeButton position="bottom-right" />
        </TRPCReactProvider>
      </body>
    </html>
  );
}