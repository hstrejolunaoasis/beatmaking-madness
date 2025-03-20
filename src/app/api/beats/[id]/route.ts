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
    console.log("Updating beat:", params.id);
    console.log("Update data:", JSON.stringify(data, null, 2));

    // Validate the beat data with more detailed errors
    if (!data.title || !data.producer) {
      const missingFields = [];
      if (!data.title) missingFields.push("Title");
      if (!data.producer) missingFields.push("Producer");
      
      return jsonResponse(
        { 
          success: false, 
          message: `Missing required fields: ${missingFields.join(", ")}` 
        },
        400
      );
    }

    // Validate numeric fields if present
    if (data.price !== undefined && (isNaN(parseFloat(data.price)) || parseFloat(data.price) <= 0)) {
      return jsonResponse(
        { success: false, message: "Price must be a positive number" },
        400
      );
    }

    if (data.bpm !== undefined && (isNaN(parseInt(data.bpm)) || parseInt(data.bpm) < 40 || parseInt(data.bpm) > 300)) {
      return jsonResponse(
        { success: false, message: "BPM must be a number between 40 and 300" },
        400
      );
    }

    // Make sure tags is an array if present
    if (data.tags !== undefined) {
      if (typeof data.tags === 'string') {
        data.tags = data.tags.split(',').map((tag: string) => tag.trim());
      } else if (!Array.isArray(data.tags)) {
        data.tags = [];
      }
    }

    // Ensure beat exists
    const existingBeat = await dbService.getBeat(params.id);
    if (!existingBeat) {
      return jsonResponse({ success: false, message: "Beat not found" }, 404);
    }

    console.log("Updating beat in database");
    const beat = await dbService.updateBeat(params.id, data);
    console.log("Beat updated successfully");
    
    return jsonResponse(successResponse(beat, "Beat updated successfully"));
  } catch (error) {
    console.error("Error updating beat:", error);
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