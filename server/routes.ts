import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertJobPostingSchema, insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Login failed", error });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user", error });
    }
  });

  app.put("/api/users/:id/progress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { speaking, writing, reading } = req.body;
      
      const user = await storage.updateUserProgress(id, { speaking, writing, reading });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress", error });
    }
  });

  // Practice module routes
  app.get("/api/practice-modules", async (req, res) => {
    try {
      const modules = await storage.getPracticeModules();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ message: "Failed to get practice modules", error });
    }
  });

  app.get("/api/practice-modules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const module = await storage.getPracticeModule(id);
      
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }

      res.json(module);
    } catch (error) {
      res.status(500).json({ message: "Failed to get practice module", error });
    }
  });

  // User progress routes
  app.get("/api/users/:userId/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user progress", error });
    }
  });

  app.post("/api/users/:userId/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { moduleId, progress, score, completed } = req.body;
      
      const existingProgress = await storage.getUserProgressForModule(userId, moduleId);
      
      if (existingProgress) {
        const updated = await storage.updateUserProgress(userId, moduleId, {
          progress,
          score,
          completed,
        });
        res.json(updated);
      } else {
        const newProgress = await storage.createUserProgress({
          userId,
          moduleId,
          progress,
          score,
          completed,
        });
        res.json(newProgress);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress", error });
    }
  });

  // Study group routes
  app.get("/api/study-groups", async (req, res) => {
    try {
      const groups = await storage.getStudyGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to get study groups", error });
    }
  });

  app.get("/api/users/:userId/study-groups", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const groups = await storage.getStudyGroupsByUser(userId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user study groups", error });
    }
  });

  app.post("/api/study-groups/:groupId/join", async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const { userId } = req.body;
      
      const member = await storage.joinStudyGroup(groupId, userId);
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: "Failed to join study group", error });
    }
  });

  // Job posting routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobPostings();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to get job postings", error });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const jobData = insertJobPostingSchema.parse(req.body);
      const job = await storage.createJobPosting(jobData);
      res.json(job);
    } catch (error) {
      res.status(400).json({ message: "Invalid job data", error });
    }
  });

  app.post("/api/jobs/:jobId/apply", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const { userId } = req.body;
      
      const application = await storage.createApplication(jobId, userId);
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to apply for job", error });
    }
  });

  // Message routes
  app.get("/api/users/:userId/messages", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const messages = await storage.getMessages(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get messages", error });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data", error });
    }
  });

  app.get("/api/conversations/:user1Id/:user2Id", async (req, res) => {
    try {
      const user1Id = parseInt(req.params.user1Id);
      const user2Id = parseInt(req.params.user2Id);
      const conversation = await storage.getConversation(user1Id, user2Id);
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to get conversation", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
