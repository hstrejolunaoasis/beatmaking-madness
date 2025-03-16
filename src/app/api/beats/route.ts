import { dbService } from "@/lib/services/db.service";
import { jsonResponse, successResponse, handleApiError } from "@/lib/utils/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const beats = await dbService.getBeats();
    return jsonResponse(successResponse(beats));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate the beat data (would typically use zod here)
    if (!data.title || !data.producer || !data.price || !data.audioUrl) {
      return jsonResponse(
        { success: false, message: "Missing required fields" },
        400
      );
    }

    const beat = await dbService.createBeat(data);
    return jsonResponse(successResponse(beat, "Beat created successfully"), 201);
  } catch (error) {
    return handleApiError(error);
  }
} 