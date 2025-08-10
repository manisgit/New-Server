import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertServiceSchema, updateServiceSchema, insertInventorySchema, updateInventoryCountSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create new service entry
  app.post("/api/services", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid service data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create service" });
      }
    }
  });

  // Get services by status
  app.get("/api/services", async (req, res) => {
    try {
      const status = req.query.status as "in_progress" | "completed" | "returned" | undefined;
      const date = req.query.date as string | undefined;
      
      if (date) {
        const services = await storage.getServicesByDate(date);
        res.json(services);
      } else if (status && (status === "in_progress" || status === "completed" || status === "returned")) {
        const services = await storage.getServicesByStatus(status);
        res.json(services);
      } else {
        const services = await storage.getAllServices();
        res.json(services);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Update service status (complete or return service)
  app.patch("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = updateServiceSchema.parse({ ...req.body, id });
      
      const updatedService = await storage.updateServiceStatus(id, status as "completed" | "returned");
      
      if (!updatedService) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      res.json(updatedService);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update service" });
      }
    }
  });

  // Inventory routes
  // Create new inventory item
  app.post("/api/inventory", async (req, res) => {
    try {
      const inventoryData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(inventoryData);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid inventory data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create inventory item" });
      }
    }
  });

  // Get all inventory items
  app.get("/api/inventory", async (req, res) => {
    try {
      const inventory = await storage.getAllInventoryItems();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  // Update inventory count
  app.patch("/api/inventory/:id/count", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = updateInventoryCountSchema.parse({ ...req.body, id });
      
      const updatedItem = await storage.updateInventoryCount(updateData);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid update data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update inventory count" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
