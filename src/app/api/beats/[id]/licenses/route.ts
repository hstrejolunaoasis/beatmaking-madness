import { dbService } from "@/lib/services/db.service";
import { jsonResponse, successResponse, handleApiError } from "@/lib/utils/api";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    // Ensure beat exists
    const beat = await dbService.getBeat(id);
    if (!beat) {
      return jsonResponse({ success: false, message: "Beat not found" }, 404);
    }

    const licenses = await dbService.getBeatLicenses(id);
    return jsonResponse(successResponse(licenses));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { licenseIds } = await request.json();
    const { id } = await params;

    if (!Array.isArray(licenseIds)) {
      return jsonResponse(
        { success: false, message: "licenseIds must be an array" },
        400
      );
    }

    // Ensure beat exists
    const beat = await dbService.getBeat(id);
    if (!beat) {
      return jsonResponse({ success: false, message: "Beat not found" }, 404);
    }

    await dbService.updateBeatLicenses(id, licenseIds);
    return jsonResponse(
      successResponse(null, "Beat licenses updated successfully")
    );
  } catch (error) {
    return handleApiError(error);
  }
} 