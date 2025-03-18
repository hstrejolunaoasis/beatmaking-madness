import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/supabase/server-actions";

export async function GET(
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
    
    const license = await db.license.findUnique({
      where: {
        id: params.licenseId,
      },
    });
    
    if (!license) {
      return new NextResponse("License not found", { status: 404 });
    }
    
    return NextResponse.json(license);
  } catch (error) {
    console.error("[LICENSE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
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
    
    const body = await req.json();
    
    const { name, type, description, price, features, active } = body;
    
    const license = await db.license.update({
      where: {
        id: params.licenseId,
      },
      data: {
        name,
        type,
        description,
        price,
        features,
        active,
      },
    });
    
    return NextResponse.json(license);
  } catch (error) {
    console.error("[LICENSE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
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
    
    await db.license.delete({
      where: {
        id: params.licenseId,
      },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[LICENSE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 