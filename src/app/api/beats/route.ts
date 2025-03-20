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
      audioUrl: "Audio file",
      imageUrl: "Image file"
    };
    
    // Add required fields based on schema that might be missing
    if (!Object.prototype.hasOwnProperty.call(requiredFields, "bpm")) {
      requiredFields["bpm"] = "BPM";
    }
    if (!Object.prototype.hasOwnProperty.call(requiredFields, "key")) {
      requiredFields["key"] = "Key";
    }
    if (!Object.prototype.hasOwnProperty.call(requiredFields, "genre")) {
      requiredFields["genre"] = "Genre";
    }
    if (!Object.prototype.hasOwnProperty.call(requiredFields, "mood")) {
      requiredFields["mood"] = "Mood";
    }
    if (!Object.prototype.hasOwnProperty.call(requiredFields, "waveformUrl")) {
      requiredFields["waveformUrl"] = "Waveform";
    }
    
    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!data[field]) {
        missingFields.push(label);
      }
    }
    
    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
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
      console.error("Invalid price:", data.price);
      return jsonResponse(
        { success: false, message: "Price must be a positive number" },
        400
      );
    }

    if (isNaN(parseInt(data.bpm)) || parseInt(data.bpm) < 40 || parseInt(data.bpm) > 300) {
      console.error("Invalid BPM:", data.bpm);
      return jsonResponse(
        { success: false, message: "BPM must be a number between 40 and 300" },
        400
      );
    }

    // Ensure all required number fields are actually numbers
    data.price = parseFloat(data.price);
    data.bpm = parseInt(data.bpm);
    
    // Ensure all required fields from the schema are present with default values if needed
    if (!data.key) data.key = "C";
    if (!data.genre) data.genre = "Other";
    if (!data.mood) data.mood = "Other";
    if (!data.description) data.description = "";

    // Make sure tags is an array
    if (typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map((tag: string) => tag.trim());
    } else if (!Array.isArray(data.tags)) {
      data.tags = [];
    }

    // Handle signed URLs in audioUrl and imageUrl
    // Strip Supabase query parameters which might cause issues
    if (data.audioUrl && data.audioUrl.includes('?')) {
      data.audioUrl = data.audioUrl.split('?')[0];
      console.log("Cleaned audioUrl:", data.audioUrl);
    }
    
    if (data.imageUrl && data.imageUrl.includes('?')) {
      data.imageUrl = data.imageUrl.split('?')[0];
      console.log("Cleaned imageUrl:", data.imageUrl);
    }

    // Handle missing waveform URL - create a default one based on the audio URL if needed
    if (!data.waveformUrl && data.audioUrl) {
      console.log("No waveform URL provided, creating a default one");
      // Extract the file path from the audio URL if it's a signed URL
      let audioPath = data.audioUrl;
      if (audioPath.includes('?')) {
        audioPath = audioPath.split('?')[0];
      }
      
      // Create a default waveform URL using the path
      data.waveformUrl = `/api/waveform?path=${encodeURIComponent(audioPath)}`;
      console.log("Created default waveform URL:", data.waveformUrl);
    }

    // Create prepared data object that matches the expected Beat model type
    const beatData = {
      title: data.title,
      producer: data.producer,
      price: data.price,
      bpm: data.bpm,
      key: data.key || "C",
      tags: Array.isArray(data.tags) ? data.tags : [],
      genre: data.genre || "Other",
      mood: data.mood || "Other",
      description: data.description || "",
      imageUrl: data.imageUrl,
      audioUrl: data.audioUrl,
      waveformUrl: data.waveformUrl
    };
    
    console.log("Creating beat with prepared data:", JSON.stringify(beatData, null, 2));
    try {
      const beat = await dbService.createBeat(beatData);
      console.log("Beat created successfully:", JSON.stringify(beat, null, 2));
      return jsonResponse(successResponse(beat, "Beat created successfully"), 201);
    } catch (dbError) {
      console.error("Database error creating beat:", dbError);
      // Return a more detailed error message
      const errorMessage = dbError instanceof Error 
        ? dbError.message 
        : "Unknown database error";
      return jsonResponse(
        { success: false, message: `Database error: ${errorMessage}` },
        500
      );
    }
  } catch (error) {
    console.error("Error creating beat:", error);
    return handleApiError(error);
  }
} 