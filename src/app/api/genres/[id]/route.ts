import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { slugify } from "@/lib/utils";
import { getCurrentUser } from "@/lib/supabase/server-actions";

// Schema for genre update validation
const genreUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().optional().nullable(),
  active: z.boolean().optional(),
});

// GET - Fetch a specific genre
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    
    const genre = await db.genre.findUnique({
      where: { id },
      include: {
        _count: {
          select: { beats: true }
        }
      }
    });
    
    if (!genre) {
      return NextResponse.json(
        { error: "Genre not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(genre);
  } catch (error) {
    console.error("Failed to fetch genre:", error);
    return NextResponse.json(
      { error: "Failed to fetch genre" },
      { status: 500 }
    );
  }
}

// PATCH - Update a genre
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    const user = await getCurrentUser();
    
    // Check if user is authenticated and has admin role
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const validatedData = genreUpdateSchema.parse(body);
    
    // Check if genre exists
    const genre = await db.genre.findUnique({
      where: { id }
    });
    
    if (!genre) {
      return NextResponse.json(
        { error: "Genre not found" },
        { status: 404 }
      );
    }
    
    // Prepare update data
    const updateData: any = { ...validatedData };
    
    // If name is being updated, update slug as well
    if (validatedData.name) {
      const slug = slugify(validatedData.name);
      
      // Check if another genre already has this slug
      const existingGenre = await db.genre.findFirst({
        where: {
          OR: [
            { name: validatedData.name },
            { slug }
          ],
          NOT: { id }
        }
      });
      
      if (existingGenre) {
        return NextResponse.json(
          { error: "Genre with this name already exists" },
          { status: 400 }
        );
      }
      
      updateData.slug = slug;
    }
    
    // Update genre
    const updatedGenre = await db.genre.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { beats: true }
        }
      }
    });
    
    return NextResponse.json(updatedGenre);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Failed to update genre:", error);
    return NextResponse.json(
      { error: "Failed to update genre" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a genre
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    const user = await getCurrentUser();
    
    // Check if user is authenticated and has admin role
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if genre exists
    const genre = await db.genre.findUnique({
      where: { id },
      include: {
        _count: {
          select: { beats: true }
        }
      }
    });
    
    if (!genre) {
      return NextResponse.json(
        { error: "Genre not found" },
        { status: 404 }
      );
    }
    
    // Check if genre is being used by any beats
    if (genre._count.beats > 0) {
      return NextResponse.json(
        { error: "Cannot delete genre that is being used by beats", beatsCount: genre._count.beats },
        { status: 400 }
      );
    }
    
    // Delete genre
    await db.genre.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: "Genre deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete genre:", error);
    return NextResponse.json(
      { error: "Failed to delete genre" },
      { status: 500 }
    );
  }
} 