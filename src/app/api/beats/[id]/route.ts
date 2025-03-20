import { dbService } from "@/lib/services/db.service";
import { jsonResponse, successResponse, errorResponse, handleApiError } from "@/lib/utils/api";
import { NextRequest } from "next/server";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const beat = await dbService.getBeat(id);

    if (!beat) {
      return jsonResponse(
        errorResponse(null, "Beat not found"),
        404
      );
    }

    return jsonResponse(successResponse(beat));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    // Validate the beat data (would typically use zod here)
    if (!data.title || !data.producer) {
      return jsonResponse(
        { success: false, message: "Missing required fields" },
        400
      );
    }

    // Ensure beat exists
    const existingBeat = await dbService.getBeat(params.id);
    if (!existingBeat) {
      return jsonResponse({ success: false, message: "Beat not found" }, 404);
    }

    const beat = await dbService.updateBeat(params.id, data);
    return jsonResponse(successResponse(beat, "Beat updated successfully"));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure beat exists
    const existingBeat = await dbService.getBeat(params.id);
    if (!existingBeat) {
      return jsonResponse({ success: false, message: "Beat not found" }, 404);
    }

    await dbService.deleteBeat(params.id);
    return jsonResponse(successResponse(null, "Beat deleted successfully"));
  } catch (error) {
    return handleApiError(error);
  }
} 