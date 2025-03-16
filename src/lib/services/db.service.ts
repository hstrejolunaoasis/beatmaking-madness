import { prisma } from "@/lib/db";
import type { Beat, User, Order, CartItem } from "@/types";
import { OrderStatus } from "@prisma/client";

export const dbService = {
  // Beat operations
  async getBeats() {
    return prisma.beat.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async getBeat(id: string) {
    return prisma.beat.findUnique({
      where: { id },
    });
  },

  async createBeat(data: Omit<Beat, "id" | "createdAt" | "updatedAt">) {
    return prisma.beat.create({
      data,
    });
  },

  // User operations
  async getUser(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        orders: true,
      },
    });
  },

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  // Order operations
  async createOrder(userId: string, items: CartItem[], total: number) {
    return prisma.order.create({
      data: {
        userId,
        total,
        items: {
          create: items.map((item) => ({
            beatId: item.beatId,
            licenseType: item.licenseType,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  },

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  },

  async getUserOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            beat: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },
}; 