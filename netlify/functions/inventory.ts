import { Handler } from "@netlify/functions";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { z } from "zod";
import ws from "ws";
import * as schema from "../../shared/schema";
import { insertInventorySchema, updateInventoryCountSchema } from "../../shared/schema";
import { eq } from "drizzle-orm";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

export const handler: Handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const path = event.path.replace("/.netlify/functions/inventory", "");
    
    if (event.httpMethod === "GET") {
      const inventoryItems = await db.select().from(schema.inventory);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(inventoryItems),
      };
    }

    if (event.httpMethod === "POST") {
      if (!event.body) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "Request body is required" }),
        };
      }

      const inventoryData = insertInventorySchema.parse(JSON.parse(event.body));
      
      const [inventoryItem] = await db
        .insert(schema.inventory)
        .values(inventoryData)
        .returning();

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(inventoryItem),
      };
    }

    if (event.httpMethod === "PATCH") {
      const pathParts = path.split('/');
      const id = parseInt(pathParts[1]);
      
      if (!id || !event.body) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "Invalid request" }),
        };
      }

      if (pathParts.includes('count')) {
        // Update inventory count
        const { operation } = updateInventoryCountSchema.parse(JSON.parse(event.body));
        const action = operation;
        
        const [currentItem] = await db.select()
          .from(schema.inventory)
          .where(eq(schema.inventory.id, id));

        if (!currentItem) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: "Inventory item not found" }),
          };
        }

        const newCount = action === "add" 
          ? currentItem.count + 1 
          : Math.max(0, currentItem.count - 1);

        const [updatedItem] = await db
          .update(schema.inventory)
          .set({ count: newCount, updatedAt: new Date() })
          .where(eq(schema.inventory.id, id))
          .returning();

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedItem),
        };
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  } catch (error) {
    console.error("Inventory function error:", error);
    
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Invalid data", errors: error.errors }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};