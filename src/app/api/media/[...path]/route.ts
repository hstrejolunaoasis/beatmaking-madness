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
    // Log request details
    const requestUrl = new URL(request.url);
    console.log("Media API request details:", {
      url: requestUrl.toString(),
      path: params.path,
      searchParams: Object.fromEntries(requestUrl.searchParams),
    });

    // Fix: Await params before accessing path property
    const pathParams = await params.path;
    const filePath = pathParams.join("/");
    
    // Handle special case for waveform placeholder
    if (filePath === "waveform-placeholder.svg") {
      const publicFilePath = path.join(process.cwd(), "public", "waveform-placeholder.svg");
      
      try {
        await fs.promises.access(publicFilePath);
        const fileBuffer = await fs.promises.readFile(publicFilePath);
        console.log("Serving waveform placeholder SVG from file");
        
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch (error) {
        console.error("Waveform placeholder not found:", error);
        // Generate a simple fallback SVG inline
        const fallbackSvg = `<svg width="800" height="100" viewBox="0 0 800 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,50 Q20,30 40,50 T80,50 T120,50 T160,50 T200,50 T240,50 T280,50 T320,50 T360,50 T400,50 T440,50 T480,50 T520,50 T560,50 T600,50 T640,50 T680,50 T720,50 T760,50 T800,50" 
                stroke="currentColor" stroke-width="2" fill="none" />
          <path d="M0,50 Q30,10 60,50 T120,50 T180,50 T240,50 T300,50 T360,50 T420,50 T480,50 T540,50 T600,50 T660,50 T720,50 T780,50" 
                stroke="currentColor" stroke-width="1.5" fill="none" stroke-opacity="0.7" />
          <path d="M0,50 Q40,20 80,50 T160,50 T240,50 T320,50 T400,50 T480,50 T560,50 T640,50 T720,50 T800,50" 
                stroke="currentColor" stroke-width="1" fill="none" stroke-opacity="0.5" />
        </svg>`;
        
        return new NextResponse(fallbackSvg, {
          headers: {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }
    
    // Require authentication for private files
    const user = await getCurrentUser();
    if (!user) {
      console.error("Unauthorized access attempt for file:", filePath);
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Improved path handling to prevent 'private/' duplication
    let supabasePath = filePath;
    
    // Log original path for debugging
    console.log("Path analysis:", {
      originalPath: filePath,
      containsPrivatePrefix: supabasePath.includes('private/')
    });
    
    // Handle paths with 'private/' prefix
    if (supabasePath.includes('private/')) {
      // Extract everything after the first occurrence of 'private/'
      const privateParts = supabasePath.split('private/');
      if (privateParts.length > 1) {
        supabasePath = `private/${privateParts[1]}`;
      }
    } else {
      // Add 'private/' prefix if not present
      supabasePath = `private/${supabasePath}`;
    }
    
    console.log("Accessing Supabase file:", supabasePath);
    
    // Create Supabase client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Try direct download first
    try {
      const { data: fileData, error: downloadError } = await supabaseAdmin.storage
        .from("beats")
        .download(supabasePath);
        
      if (!downloadError && fileData) {
        console.log("Successfully downloaded file");
        
        // Determine content type
        const fileExt = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream';
        
        if (fileExt === '.mp3') contentType = 'audio/mpeg';
        else if (fileExt === '.wav') contentType = 'audio/wav';
        else if (fileExt === '.jpg' || fileExt === '.jpeg') contentType = 'image/jpeg';
        else if (fileExt === '.png') contentType = 'image/png';
        else if (fileExt === '.svg') contentType = 'image/svg+xml';
        
        // Set appropriate cache control based on content type
        const cacheControl = contentType.startsWith('audio/') 
          ? 'public, max-age=3600' // 1 hour for audio files
          : 'public, max-age=86400'; // 1 day for other files
        
        return new NextResponse(fileData, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': cacheControl,
            'Accept-Ranges': 'bytes'
          }
        });
      }
    } catch (downloadError) {
      console.error("Direct download failed:", downloadError);
    }

    // Fallback to signed URL if direct download fails
    console.log("Falling back to signed URL");
    const { data, error } = await supabaseAdmin.storage
      .from("beats")
      .createSignedUrl(supabasePath, 300); // 5 minutes expiry

    if (error || !data?.signedUrl) {
      console.error("Error getting signed URL:", error);
      return new NextResponse("File not found or inaccessible", { 
        status: 404,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }

    console.log("Redirecting to signed URL");
    return NextResponse.redirect(data.signedUrl);
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse(
      `Internal Server Error: ${error instanceof Error ? error.message : "Unknown error"}`, 
      { 
        status: 500,
        headers: {
          'Content-Type': 'text/plain'
        }
      }
    );
  }
} 