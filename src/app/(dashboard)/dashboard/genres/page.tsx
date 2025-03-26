import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { GenresList } from "./_components/genres-list";
import { Metadata } from "next";
import { GenreCreateButton } from "./_components/genre-create-button";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Manage Genres | Dashboard",
  description: "Manage music genres for your beats",
};

export default async function GenresPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const genres = await db.genre.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { beats: true },
      },
    },
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Genres Management"
        description="Create and manage music genres for your beats"
        action={<GenreCreateButton />}
      />

      <GenresList initialGenres={genres} />
    </div>
  );
} 