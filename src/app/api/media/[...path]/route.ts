import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/supabase/server-actions";
import path from "path";
import fs from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join("/");
    
    // Handle special case for waveform placeholder
    if (filePath === "waveform-placeholder.svg") {
      const publicFilePath = path.join(process.cwd(), "public", "waveform-placeholder.svg");
      
      // Check if the file exists
      try {
        await fs.promises.access(publicFilePath);
      } catch (error) {
        return new NextResponse("Waveform placeholder not found", { status: 404 });
      }
      
      // Read the file
      const fileBuffer = await fs.promises.readFile(publicFilePath);
      
      // Return the file with appropriate headers
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
    
    // For regular Supabase files, continue with original implementation
    
    // Require authentication - this is essential for the bucket policy
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Add 'private/' prefix if not already there to match bucket policy
    let supabasePath = filePath;
    if (!supabasePath.startsWith("private/")) {
      supabasePath = `private/${supabasePath}`;
    }
    
    console.log("Accessing file:", supabasePath);
    
    // Create a Supabase client with admin privileges
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Get a signed URL with a short expiry
    const { data, error } = await supabaseAdmin.storage
      .from("beats")
      .createSignedUrl(supabasePath, 300); // 5 minutes expiry

    if (error || !data?.signedUrl) {
      console.error("Error getting file:", error);
      return new NextResponse("File not found", { status: 404 });
    }

    // Redirect to the signed URL
    return NextResponse.redirect(data.signedUrl);
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 