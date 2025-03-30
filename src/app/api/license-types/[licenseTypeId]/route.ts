import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/supabase/server-actions";

export async function GET(
  req: NextRequest,
  { params }: { params: { licenseTypeId: string } }
) {
  try {
    const { licenseTypeId } = await params;
    
    const licenseType = await db.licenseType.findUnique({
      where: {
        id: licenseTypeId,
      },
    });
    
    if (!licenseType) {
      return new NextResponse("License type not found", { status: 404 });
    }
    
    return NextResponse.json(licenseType);
  } catch (error) {
    console.error("[LICENSE_TYPE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { licenseTypeId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { licenseTypeId } = await params;
    const body = await req.json();
    
    const { name, slug, description } = body;
    
    if (!name || !slug) {
      return new NextResponse("Name and slug are required", { status: 400 });
    }
    
    // Check if the license type exists
    const existingLicenseType = await db.licenseType.findUnique({
      where: {
        id: licenseTypeId,
      },
    });
    
    if (!existingLicenseType) {
      return new NextResponse("License type not found", { status: 404 });
    }
    
    // Check if updating to a name or slug that already exists on another license type
    const duplicateLicenseType = await db.licenseType.findFirst({
      where: {
        AND: [
          { 
            OR: [
              { name },
              { slug },
            ],
          },
          {
            NOT: {
              id: licenseTypeId,
            },
          },
        ],
      },
    });
    
    if (duplicateLicenseType) {
      return new NextResponse("A license type with this name or slug already exists", { status: 400 });
    }
    
    const licenseType = await db.licenseType.update({
      where: {
        id: licenseTypeId,
      },
      data: {
        name,
        slug,
        description,
      },
    });
    
    return NextResponse.json(licenseType);
  } catch (error) {
    console.error("[LICENSE_TYPE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { licenseTypeId: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { licenseTypeId } = await params;
    
    // Check if the license type is being used by any licenses
    const licensesUsingType = await db.license.findFirst({
      where: {
        licenseTypeId: licenseTypeId,
      },
    });
    
    if (licensesUsingType) {
      return new NextResponse(
        "Cannot delete this license type because it is being used by one or more licenses", 
        { status: 400 }
      );
    }
    
    // Check if the license type is being used by any order items
    const orderItemsUsingType = await db.orderItem.findFirst({
      where: {
        licenseTypeId: licenseTypeId,
      },
    });
    
    if (orderItemsUsingType) {
      return new NextResponse(
        "Cannot delete this license type because it is being used by one or more order items", 
        { status: 400 }
      );
    }
    
    await db.licenseType.delete({
      where: {
        id: licenseTypeId,
      },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[LICENSE_TYPE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 