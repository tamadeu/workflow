import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTicketSchema, 
  insertQueueSchema, 
  insertLabelSchema,
  insertTicketTypeSchema,
  insertWorkScheduleSchema,
  insertInventoryItemSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });
  
  // Tickets
  app.get("/api/tickets", async (req, res) => {
    try {
      const filters = req.query;
      const tickets = await storage.getTickets(filters);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
    }
  });
  
  app.get("/api/tickets/:id", async (req, res) => {
    try {
      const ticket = await storage.getTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ticket" });
    }
  });
  
  app.post("/api/tickets", async (req, res) => {
    try {
      const validatedData = insertTicketSchema.parse(req.body);
      const ticket = await storage.createTicket(validatedData);
      res.status(201).json(ticket);
    } catch (error) {
      res.status(400).json({ error: "Invalid ticket data" });
    }
  });
  
  app.patch("/api/tickets/:id", async (req, res) => {
    try {
      const ticket = await storage.updateTicket(req.params.id, req.body);
      if (!ticket) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ticket" });
    }
  });
  
  app.delete("/api/tickets/:id", async (req, res) => {
    try {
      const success = await storage.deleteTicket(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Ticket not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ticket" });
    }
  });
  
  // Queues
  app.get("/api/queues", async (req, res) => {
    try {
      const queues = await storage.getQueues();
      res.json(queues);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch queues" });
    }
  });
  
  app.post("/api/queues", async (req, res) => {
    try {
      const validatedData = insertQueueSchema.parse(req.body);
      const queue = await storage.createQueue(validatedData);
      res.status(201).json(queue);
    } catch (error) {
      res.status(400).json({ error: "Invalid queue data" });
    }
  });
  
  app.patch("/api/queues/:id", async (req, res) => {
    try {
      const queue = await storage.updateQueue(req.params.id, req.body);
      if (!queue) {
        return res.status(404).json({ error: "Queue not found" });
      }
      res.json(queue);
    } catch (error) {
      res.status(500).json({ error: "Failed to update queue" });
    }
  });
  
  app.delete("/api/queues/:id", async (req, res) => {
    try {
      const success = await storage.deleteQueue(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Queue not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete queue" });
    }
  });
  
  // Labels
  app.get("/api/labels", async (req, res) => {
    try {
      const labels = await storage.getLabels();
      res.json(labels);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch labels" });
    }
  });
  
  app.post("/api/labels", async (req, res) => {
    try {
      const validatedData = insertLabelSchema.parse(req.body);
      const label = await storage.createLabel(validatedData);
      res.status(201).json(label);
    } catch (error) {
      res.status(400).json({ error: "Invalid label data" });
    }
  });
  
  app.patch("/api/labels/:id", async (req, res) => {
    try {
      const label = await storage.updateLabel(req.params.id, req.body);
      if (!label) {
        return res.status(404).json({ error: "Label not found" });
      }
      res.json(label);
    } catch (error) {
      res.status(500).json({ error: "Failed to update label" });
    }
  });
  
  app.delete("/api/labels/:id", async (req, res) => {
    try {
      const success = await storage.deleteLabel(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Label not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete label" });
    }
  });
  
  // Ticket Types
  app.get("/api/ticket-types", async (req, res) => {
    try {
      const types = await storage.getTicketTypes();
      res.json(types);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ticket types" });
    }
  });
  
  app.post("/api/ticket-types", async (req, res) => {
    try {
      const validatedData = insertTicketTypeSchema.parse(req.body);
      const type = await storage.createTicketType(validatedData);
      res.status(201).json(type);
    } catch (error) {
      res.status(400).json({ error: "Invalid ticket type data" });
    }
  });
  
  // Work Schedules
  app.get("/api/work-schedules", async (req, res) => {
    try {
      const schedules = await storage.getWorkSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch work schedules" });
    }
  });
  
  app.post("/api/work-schedules", async (req, res) => {
    try {
      const validatedData = insertWorkScheduleSchema.parse(req.body);
      const schedule = await storage.createWorkSchedule(validatedData);
      res.status(201).json(schedule);
    } catch (error) {
      res.status(400).json({ error: "Invalid work schedule data" });
    }
  });
  
  // Inventory
  app.get("/api/inventory", async (req, res) => {
    try {
      const items = await storage.getInventoryItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory items" });
    }
  });
  
  app.post("/api/inventory", async (req, res) => {
    try {
      const validatedData = insertInventoryItemSchema.parse(req.body);
      const item = await storage.createInventoryItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid inventory item data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
