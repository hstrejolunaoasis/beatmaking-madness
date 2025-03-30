import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

export function successResponse<T>(data: T, message = "Success"): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function errorResponse(error: any, message = "Error"): ApiResponse {
  return {
    success: false,
    message,
    error,
  };
}

export function jsonResponse<T>(data: ApiResponse<T>, status = 200) {
  return NextResponse.json(data, { status });
}

export function handleApiError(error: unknown) {
  console.error("API Error:", error);
  
  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: { target?: string[] }; message?: string };
    
    // Database constraint errors
    if (prismaError.code === 'P2002') {
      const target = prismaError.meta?.target?.join(', ') || 'field';
      return jsonResponse(
        { success: false, message: `A record with this ${target} already exists.` },
        409
      );
    }
    
    // Record not found
    if (prismaError.code === 'P2025') {
      return jsonResponse(
        { success: false, message: 'Record not found.' },
        404
      );
    }
    
    // Invalid data
    if (prismaError.code === 'P2000') {
      return jsonResponse(
        { success: false, message: prismaError.message || 'Input value is too long for the field.' },
        400
      );
    }
    
    // Required field missing
    if (prismaError.code === 'P2003' || prismaError.code === 'P2004') {
      return jsonResponse(
        { success: false, message: prismaError.message || 'Required field is missing or invalid.' },
        400
      );
    }
  }
  
  // Handle other error types
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'An unexpected error occurred';
  
  return jsonResponse(
    { success: false, message: errorMessage },
    500
  );
} 