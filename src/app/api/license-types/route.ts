import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/supabase/server-actions";

export async function GET() {
  try {
    const licenseTypes = await db.licenseType.findMany({
      orderBy: {
        name: "asc",
      },
    });
    
    return NextResponse.json(licenseTypes);
  } catch (error) {
    console.error("[LICENSE_TYPES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const body = await req.json();
    
    const { name, slug, description } = body;
    
    if (!name || !slug) {
      return new NextResponse("Name and slug are required", { status: 400 });
    }
    
    // Check if a license type with the same name or slug already exists
    const existingLicenseType = await db.licenseType.findFirst({
      where: {
        OR: [
          { name },
          { slug },
        ],
      },
    });
    
    if (existingLicenseType) {
      return new NextResponse("A license type with this name or slug already exists", { status: 400 });
    }
    
    const licenseType = await db.licenseType.create({
      data: {
        name,
        slug,
        description,
      },
    });
    
    return NextResponse.json(licenseType);
  } catch (error) {
    console.error("[LICENSE_TYPES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 