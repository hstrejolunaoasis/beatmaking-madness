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
    console.log("Media API request for:", filePath);
    
    // Handle special case for waveform placeholder
    if (filePath === "waveform-placeholder.svg") {
      const publicFilePath = path.join(process.cwd(), "public", "waveform-placeholder.svg");
      
      // Check if the file exists
      try {
        await fs.promises.access(publicFilePath);
        // Read the file
        const fileBuffer = await fs.promises.readFile(publicFilePath);
        console.log("Serving waveform placeholder SVG from file");
        
        // Return the file with appropriate headers
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch (error) {
        console.error("Waveform placeholder not found at:", publicFilePath);
        // Generate a simple fallback SVG inline
        const fallbackSvg = `<svg width="800" height="100" viewBox="0 0 800 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,50 Q20,30 40,50 T80,50 T120,50 T160,50 T200,50 T240,50 T280,50 T320,50 T360,50 T400,50 T440,50 T480,50 T520,50 T560,50 T600,50 T640,50 T680,50 T720,50 T760,50 T800,50" 
                stroke="currentColor" stroke-width="2" fill="none" />
          <path d="M0,50 Q30,10 60,50 T120,50 T180,50 T240,50 T300,50 T360,50 T420,50 T480,50 T540,50 T600,50 T660,50 T720,50 T780,50" 
                stroke="currentColor" stroke-width="1.5" fill="none" stroke-opacity="0.7" />
          <path d="M0,50 Q40,20 80,50 T160,50 T240,50 T320,50 T400,50 T480,50 T560,50 T640,50 T720,50 T800,50" 
                stroke="currentColor" stroke-width="1" fill="none" stroke-opacity="0.5" />
        </svg>`;
        
        console.log("Serving inline fallback waveform SVG");
        return new NextResponse(fallbackSvg, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }
    
    // For regular Supabase files, continue with original implementation
    
    // Require authentication - this is essential for the bucket policy
    const user = await getCurrentUser();
    if (!user) {
      console.error("Unauthorized access attempt for file:", filePath);
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Add 'private/' prefix if not already there to match bucket policy
    let supabasePath = filePath;
    if (!supabasePath.startsWith("private/")) {
      supabasePath = `private/${supabasePath}`;
    }
    
    console.log("Accessing Supabase file:", supabasePath);
    
    // Create a Supabase client with admin privileges
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Check if the file exists first
    try {
      // Try to extract the folder path and filename
      const lastSlashIndex = supabasePath.lastIndexOf('/');
      const folderPath = lastSlashIndex > 0 ? supabasePath.substring(0, lastSlashIndex) : '';
      const fileName = lastSlashIndex > 0 ? supabasePath.substring(lastSlashIndex + 1) : supabasePath;
      
      console.log(`Checking if file exists: folder=${folderPath}, file=${fileName}`);
      
      // List the files in the folder to see if our file exists
      const { data: fileList, error: listError } = await supabaseAdmin.storage
        .from("beats")
        .list(folderPath, {
          search: fileName,
          limit: 1
        });
      
      if (listError || !fileList || fileList.length === 0) {
        console.error("File not found in Supabase:", supabasePath, listError);
        
        // Try without the 'private/' prefix as a fallback
        if (supabasePath.startsWith('private/')) {
          const altPath = supabasePath.substring(8);
          console.log("Trying alternate path:", altPath);
          return NextResponse.redirect(new URL(`/api/media/${altPath}`, request.url));
        }
        
        return new NextResponse("File not found in storage", { status: 404 });
      }
      
      console.log("File found in storage:", fileList[0].name);
      
      // Try to get the file directly first for better performance
      const { data: fileData, error: downloadError } = await supabaseAdmin.storage
        .from("beats")
        .download(supabasePath);
        
      if (!downloadError && fileData) {
        console.log("Successfully downloaded file, serving directly");
        
        // Determine content type based on file extension
        const fileExt = fileName.split('.').pop()?.toLowerCase();
        let contentType = 'application/octet-stream';
        
        if (fileExt === 'mp3') contentType = 'audio/mpeg';
        else if (fileExt === 'wav') contentType = 'audio/wav';
        else if (fileExt === 'jpg' || fileExt === 'jpeg') contentType = 'image/jpeg';
        else if (fileExt === 'png') contentType = 'image/png';
        else if (fileExt === 'svg') contentType = 'image/svg+xml';
        
        // Serve the file directly
        return new NextResponse(fileData, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400', // 1 day cache
          }
        });
      }
      
      // Fallback to signed URL if direct download fails
      console.log("Direct download failed, falling back to signed URL");
      
    } catch (checkError) {
      console.error("Error checking file existence:", checkError);
      // Continue with signed URL as fallback
    }

    // Get a signed URL with a short expiry
    const { data, error } = await supabaseAdmin.storage
      .from("beats")
      .createSignedUrl(supabasePath, 300); // 5 minutes expiry

    if (error || !data?.signedUrl) {
      console.error("Error getting signed URL:", error);
      return new NextResponse("File not found or inaccessible", { status: 404 });
    }

    console.log("Redirecting to signed URL with expiry");
    // Redirect to the signed URL
    return NextResponse.redirect(data.signedUrl);
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse(`Internal Server Error: ${error instanceof Error ? error.message : "Unknown error"}`, { status: 500 });
  }
} 