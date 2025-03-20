import { db } from "@/lib/db";
import type { Beat, User, Order, CartItem } from "@/types";
import { OrderStatus } from "@prisma/client";

export const dbService = {
  // Beat operations
  async getBeats() {
    return db.beat.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async getBeat(id: string) {
    return db.beat.findUnique({
      where: { id },
    });
  },

  async createBeat(data: Omit<Beat, "id" | "createdAt" | "updatedAt">) {
    return db.beat.create({
      data,
    });
  },

  async updateBeat(id: string, data: Partial<Beat>) {
    return db.beat.update({
      where: { id },
      data,
    });
  },

  async deleteBeat(id: string) {
    return db.beat.delete({
      where: { id },
    });
  },

  // Beat-License operations
  async getBeatLicenses(beatId: string) {
    const beatLicenses = await db.beatLicense.findMany({
      where: { beatId },
      include: {
        license: {
          include: {
            licenseType: true,
          },
        },
      },
    });
    
    return beatLicenses.map(bl => bl.license);
  },

  async updateBeatLicenses(beatId: string, licenseIds: string[]) {
    // First, delete all existing associations
    await db.beatLicense.deleteMany({
      where: { beatId },
    });
    
    // Then create new associations
    if (licenseIds.length > 0) {
      await db.beatLicense.createMany({
        data: licenseIds.map(licenseId => ({
          beatId,
          licenseId,
        })),
      });
    }
    
    return true;
  },

  // User operations
  async getUser(id: string) {
    return db.user.findUnique({
      where: { id },
      include: {
        orders: true,
      },
    });
  },

  async getUserByEmail(email: string) {
    return db.user.findUnique({
      where: { email },
    });
  },

  // Order operations
  async createOrder(userId: string, items: CartItem[], total: number) {
    return db.order.create({
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
    return db.order.update({
      where: { id: orderId },
      data: { status },
    });
  },

  async getUserOrders(userId: string) {
    return db.order.findMany({
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