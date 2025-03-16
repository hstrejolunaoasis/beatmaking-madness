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