import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="flex flex-col items-center justify-center px-4 py-32 text-center bg-gradient-to-b from-background to-muted">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Premium Beats for
          <br />
          <span className="text-primary">Serious Artists</span>
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground mt-4 md:text-xl">
          Professional grade beats crafted with passion. Find your next hit today.
        </p>
        <div className="flex flex-col gap-4 mt-8 sm:flex-row">
          <Link
            href="/beats"
            className="inline-flex items-center justify-center h-11 px-8 font-medium transition-colors rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Browse Beats
          </Link>
          <Link
            href="/licensing"
            className="inline-flex items-center justify-center h-11 px-8 font-medium transition-colors rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          >
            Licensing Info
          </Link>
        </div>
      </section>
    </div>
  );
} 