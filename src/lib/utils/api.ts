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

export async function handleApiError(error: unknown) {
  console.error("API Error:", error);
  
  if (error instanceof Error) {
    return jsonResponse(
      errorResponse(null, error.message),
      500
    );
  }
  
  return jsonResponse(
    errorResponse(null, "An unknown error occurred"),
    500
  );
} 