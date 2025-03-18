import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/supabase/server-actions";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const licenses = await db.license.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json(licenses);
  } catch (error) {
    console.error("[LICENSES_GET]", error);
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
    
    const { name, type, description, price, features, active } = body;
    
    if (!name || !type || !description || price === undefined || !features) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    
    const license = await db.license.create({
      data: {
        name,
        type,
        description,
        price,
        features,
        active: active ?? true,
      },
    });
    
    return NextResponse.json(license);
  } catch (error) {
    console.error("[LICENSES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 