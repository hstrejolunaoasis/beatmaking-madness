import { dbService } from "@/lib/services/db.service";
import { jsonResponse, successResponse, errorResponse, handleApiError } from "@/lib/utils/api";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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
    const { id } = await params;
    console.log("Updating beat:", id);
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

    // Verify the genre exists if genreId is being updated
    if (data.genreId) {
      const genre = await db.genre.findUnique({
        where: { id: data.genreId }
      });
      
      if (!genre) {
        return jsonResponse(
          { success: false, message: "Selected genre does not exist" },
          400
        );
      }
      
      // Make sure it's an active genre
      if (!genre.active) {
        return jsonResponse(
          { success: false, message: "Selected genre is inactive" },
          400
        );
      }
    }

    // Ensure beat exists
    const existingBeat = await dbService.getBeat(id);
    if (!existingBeat) {
      return jsonResponse({ success: false, message: "Beat not found" }, 404);
    }

    console.log("Updating beat in database");
    const beat = await dbService.updateBeat(id, data);
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
    const { id } = await params;
    // Ensure beat exists
    const existingBeat = await dbService.getBeat(id);
    if (!existingBeat) {
      return jsonResponse({ success: false, message: "Beat not found" }, 404);
    }

    await dbService.deleteBeat(id);
    return jsonResponse(successResponse(null, "Beat deleted successfully"));
  } catch (error) {
    return handleApiError(error);
  }
} 