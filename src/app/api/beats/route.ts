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
    console.log("Received beat data:", JSON.stringify(data, null, 2));

    // Validate the beat data with more detailed errors
    const requiredFields = {
      title: "Title",
      producer: "Producer", 
      price: "Price", 
      audioUrl: "Audio file"
    };
    
    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!data[field]) {
        missingFields.push(label);
      }
    }
    
    if (missingFields.length > 0) {
      return jsonResponse(
        { 
          success: false, 
          message: `Missing required fields: ${missingFields.join(", ")}` 
        },
        400
      );
    }

    // Validate numeric fields
    if (isNaN(parseFloat(data.price)) || parseFloat(data.price) <= 0) {
      return jsonResponse(
        { success: false, message: "Price must be a positive number" },
        400
      );
    }

    if (isNaN(parseInt(data.bpm)) || parseInt(data.bpm) < 40 || parseInt(data.bpm) > 300) {
      return jsonResponse(
        { success: false, message: "BPM must be a number between 40 and 300" },
        400
      );
    }

    // Add a default empty description if not provided
    if (data.description === undefined) {
      data.description = "";
    }

    // Make sure tags is an array
    if (typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map((tag: string) => tag.trim());
    } else if (!Array.isArray(data.tags)) {
      data.tags = [];
    }

    console.log("Creating beat with data:", JSON.stringify(data, null, 2));
    const beat = await dbService.createBeat(data);
    console.log("Beat created successfully:", JSON.stringify(beat, null, 2));
    
    return jsonResponse(successResponse(beat, "Beat created successfully"), 201);
  } catch (error) {
    console.error("Error creating beat:", error);
    return handleApiError(error);
  }
} 