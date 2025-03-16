import { dbService } from "@/lib/services/db.service";
import { jsonResponse, successResponse, errorResponse, handleApiError } from "@/lib/utils/api";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // In a real app, this would be authenticated and get the current user ID
    const userId = "user-id-from-session"; // Placeholder
    
    const orders = await dbService.getUserOrders(userId);
    return jsonResponse(successResponse(orders));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate the order data
    if (!data.userId || !data.items || !data.total) {
      return jsonResponse(
        errorResponse(null, "Missing required fields"),
        400
      );
    }
    
    const order = await dbService.createOrder(
      data.userId,
      data.items,
      data.total
    );
    
    return jsonResponse(
      successResponse(order, "Order created successfully"),
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
} 