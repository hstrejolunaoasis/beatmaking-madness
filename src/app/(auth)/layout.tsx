import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-10 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">BeatMaking Madness</span>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 