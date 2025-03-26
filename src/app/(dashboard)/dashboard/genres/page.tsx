import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { GenresList } from "./_components/genres-list";
import { Metadata } from "next";
import { GenreCreateButton } from "./_components/genre-create-button";
import { PageHeader } from "@/components/page-header";
import { getCurrentUser } from "@/lib/supabase/server-actions";

export const metadata: Metadata = {
  title: "Manage Genres | Dashboard",
  description: "Manage music genres for your beats",
};

export default async function GenresPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user is admin (in a real app, you would check user.metadata to see if they have admin role)
  // For now we'll allow all authenticated users to access this page
  // TODO: Add proper role-based access when user roles are implemented

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