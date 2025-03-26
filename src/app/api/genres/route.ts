import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { slugify } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Schema for genre validation
const genreSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

// GET - Fetch all genres
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";
    
    const genres = await db.genre.findMany({
      where: activeOnly ? { active: true } : {},
      orderBy: { name: "asc" },
    });
    
    return NextResponse.json(genres);
  } catch (error) {
    console.error("Failed to fetch genres:", error);
    return NextResponse.json(
      { error: "Failed to fetch genres" },
      { status: 500 }
    );
  }
}

// POST - Create a new genre
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has admin role
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const validatedData = genreSchema.parse(body);
    
    // Generate slug from name
    const slug = slugify(validatedData.name);
    
    // Check if genre with this name or slug already exists
    const existingGenre = await db.genre.findFirst({
      where: {
        OR: [
          { name: validatedData.name },
          { slug }
        ]
      }
    });
    
    if (existingGenre) {
      return NextResponse.json(
        { error: "Genre with this name already exists" },
        { status: 400 }
      );
    }
    
    // Create new genre
    const genre = await db.genre.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        active: validatedData.active,
      },
    });
    
    return NextResponse.json(genre, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Failed to create genre:", error);
    return NextResponse.json(
      { error: "Failed to create genre" },
      { status: 500 }
    );
  }
} 