import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/common/Header";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { DevModeProvider } from "@/components/dev-mode-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Beatmaking Madness - Premium Beats Store",
  description: "High-quality beats for artists and producers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <DevModeProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 bg-background">
                {children}
              </main>
              <footer className="py-6 border-t">
                <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                  <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Beatmaking Madness. All rights reserved.
                  </p>
                  <div className="flex items-center gap-4">
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                      Terms
                    </a>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                      Privacy
                    </a>
                  </div>
                </div>
              </footer>
            </div>
          </DevModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
