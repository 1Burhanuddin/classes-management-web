import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthNav } from "@/components/auth/auth-nav";
import { StoreProvider } from "@/store/provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Classes Management",
  description: "Classes management MVP for admins, teachers, and students.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <StoreProvider>
            <div className="app-shell">
              <header className="topbar">
                <Link className="brand" href="/">
                  Classes Management
                </Link>
                <AuthNav />
              </header>
              {children}
            </div>
          </StoreProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
