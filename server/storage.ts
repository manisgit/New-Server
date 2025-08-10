import { services, inventory, type Service, type InsertService, type UpdateService, type Inventory, type InsertInventory, type UpdateInventoryCount } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Service operations
  createService(service: InsertService): Promise<Service>;
  getServicesByStatus(status: "in_progress" | "completed" | "returned"): Promise<Service[]>;
  updateServiceStatus(id: number, status: "completed" | "returned"): Promise<Service | undefined>;
  getAllServices(): Promise<Service[]>;
  getServicesByDate(date: string): Promise<Service[]>;
  
  // Inventory operations
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  getAllInventoryItems(): Promise<Inventory[]>;
  updateInventoryCount(update: UpdateInventoryCount): Promise<Inventory | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Service operations
  async createService(insertService: InsertService): Promise<Service> {
    const serialNumber = `SRV${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    
    const [service] = await db
      .insert(services)
      .values({
        ...insertService,
        serialNumber,
        status: "in_progress" as const,
      })
      .returning();
    
    return service;
  }

  async getServicesByStatus(status: "in_progress" | "completed" | "returned"): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(eq(services.status, status));
  }

  async updateServiceStatus(id: number, status: "completed" | "returned"): Promise<Service | undefined> {
    const updateData: any = { status };
    
    if (status === "completed") {
      updateData.completedAt = new Date();
    } else if (status === "returned") {
      updateData.returnedAt = new Date();
    }

    const [updatedService] = await db
      .update(services)
      .set(updateData)
      .where(eq(services.id, id))
      .returning();
    
    return updatedService || undefined;
  }

  async getAllServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async getServicesByDate(date: string): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(and(
        eq(services.serviceDate, date),
        eq(services.status, "completed")
      ));
  }

  // Inventory operations
  async createInventoryItem(insertItem: InsertInventory): Promise<Inventory> {
    const [item] = await db
      .insert(inventory)
      .values({
        ...insertItem,
        count: 1,
      })
      .returning();
    
    return item;
  }

  async getAllInventoryItems(): Promise<Inventory[]> {
    return await db.select().from(inventory);
  }

  async updateInventoryCount(update: UpdateInventoryCount): Promise<Inventory | undefined> {
    // First get the current item to calculate new count
    const [currentItem] = await db
      .select()
      .from(inventory)
      .where(eq(inventory.id, update.id));
    
    if (!currentItem) return undefined;

    const newCount = update.operation === "add" 
      ? currentItem.count + update.amount 
      : Math.max(0, currentItem.count - update.amount);

    const [updatedItem] = await db
      .update(inventory)
      .set({ 
        count: newCount,
        updatedAt: new Date(),
      })
      .where(eq(inventory.id, update.id))
      .returning();
    
    return updatedItem || undefined;
  }
}

export const storage = new DatabaseStorage();
