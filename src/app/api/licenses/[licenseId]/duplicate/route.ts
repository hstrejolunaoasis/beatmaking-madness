import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/supabase/server-actions";

export async function POST(
  req: NextRequest,
  { params }: { params: { licenseId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    if (!params.licenseId) {
      return new NextResponse("License ID is required", { status: 400 });
    }
    
    // Find the original license
    const originalLicense = await db.license.findUnique({
      where: {
        id: params.licenseId,
      },
    });
    
    if (!originalLicense) {
      return new NextResponse("License not found", { status: 404 });
    }
    
    // Create a new license with the same properties but a new ID
    const newLicense = await db.license.create({
      data: {
        name: `${originalLicense.name} (Copy)`,
        type: originalLicense.type,
        description: originalLicense.description,
        price: originalLicense.price,
        features: originalLicense.features,
        active: originalLicense.active,
      },
    });
    
    return NextResponse.json(newLicense);
  } catch (error) {
    console.error("[LICENSE_DUPLICATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 