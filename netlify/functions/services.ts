import { Handler } from "@netlify/functions";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { z } from "zod";
import ws from "ws";
import * as schema from "../../shared/schema";
import { insertServiceSchema, updateServiceSchema } from "../../shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";

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
    const path = event.path.replace("/.netlify/functions/services", "");
    
    if (event.httpMethod === "GET") {
      const status = event.queryStringParameters?.status as "in_progress" | "completed" | "returned" | undefined;
      const date = event.queryStringParameters?.date as string | undefined;
      
      if (date) {
        // Get services by specific date
        const startDate = new Date(date);
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 1);
        
        const services = await db.select()
          .from(schema.services)
          .where(
            and(
              gte(schema.services.serviceDate, startDate.toISOString().split('T')[0]),
              lte(schema.services.serviceDate, endDate.toISOString().split('T')[0])
            )
          );
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(services),
        };
      } else if (status && (status === "in_progress" || status === "completed" || status === "returned")) {
        // Get services by status
        const services = await db.select()
          .from(schema.services)
          .where(eq(schema.services.status, status));
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(services),
        };
      } else {
        // Get all services
        const services = await db.select().from(schema.services);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(services),
        };
      }
    }

    if (event.httpMethod === "POST") {
      if (!event.body) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "Request body is required" }),
        };
      }

      const serviceData = insertServiceSchema.parse(JSON.parse(event.body));
      
      // Generate serial number
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const existingServices = await db.select()
        .from(schema.services)
        .where(gte(schema.services.createdAt, new Date(new Date().setHours(0, 0, 0, 0))));
      
      const serialNumber = `SN${today}${String(existingServices.length + 1).padStart(3, '0')}`;
      
      const [service] = await db
        .insert(schema.services)
        .values({ ...serviceData, serialNumber })
        .returning();

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(service),
      };
    }

    if (event.httpMethod === "PATCH") {
      const id = parseInt(path.split('/')[1]);
      if (!id || !event.body) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "Invalid request" }),
        };
      }

      const { status } = updateServiceSchema.parse({ ...JSON.parse(event.body), id });
      
      const updateData: any = { status };
      if (status === "completed") {
        updateData.completedAt = new Date();
      } else if (status === "returned") {
        updateData.returnedAt = new Date();
      }

      const [updatedService] = await db
        .update(schema.services)
        .set(updateData)
        .where(eq(schema.services.id, id))
        .returning();

      if (!updatedService) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: "Service not found" }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(updatedService),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  } catch (error) {
    console.error("Services function error:", error);
    
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