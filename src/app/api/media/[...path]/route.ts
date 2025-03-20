import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/supabase/server-actions";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Require authentication - this is essential for the bucket policy
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the file path from the URL params
    let filePath = params.path.join("/");
    
    // Add 'private/' prefix if not already there to match bucket policy
    if (!filePath.startsWith("private/")) {
      filePath = `private/${filePath}`;
    }
    
    console.log("Accessing file:", filePath);
    
    // Create a Supabase client with admin privileges
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Get a signed URL with a short expiry
    const { data, error } = await supabaseAdmin.storage
      .from("beats")
      .createSignedUrl(filePath, 300); // 5 minutes expiry

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