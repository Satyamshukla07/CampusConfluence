import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertPracticeModuleSchema, insertUserProgressSchema, insertStudyGroupSchema, insertJobPostingSchema, insertChatMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // College routes
  app.get("/api/colleges", async (req, res) => {
    try {
      const colleges = await storage.getColleges();
      res.json(colleges);
    } catch (error) {
      console.error("Error fetching colleges:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/colleges/domain/:domain", async (req, res) => {
    try {
      const college = await storage.getCollegeByDomain(req.params.domain);
      if (!college) {
        return res.status(404).json({ message: "College not found" });
      }
      res.json(college);
    } catch (error) {
      console.error("Error fetching college:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email, userData.collegeId);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password, collegeId } = req.body;
      
      // Find user by username and college
      const user = await storage.getUserByUsername(username, collegeId);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json(user);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const updatedUser = await storage.updateUser(req.params.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Practice module routes
  app.get("/api/practice-modules", async (req, res) => {
    try {
      const collegeId = req.query.collegeId as string;
      if (!collegeId) {
        return res.status(400).json({ message: "College ID is required" });
      }
      
      const modules = await storage.getPracticeModules(collegeId);
      res.json(modules);
    } catch (error) {
      console.error("Error fetching practice modules:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/practice-modules/:id", async (req, res) => {
    try {
      const module = await storage.getPracticeModule(req.params.id);
      if (!module) {
        return res.status(404).json({ message: "Practice module not found" });
      }
      res.json(module);
    } catch (error) {
      console.error("Error fetching practice module:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/practice-modules", async (req, res) => {
    try {
      const moduleData = insertPracticeModuleSchema.parse(req.body);
      const module = await storage.createPracticeModule(moduleData);
      res.status(201).json(module);
    } catch (error) {
      console.error("Error creating practice module:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User progress routes
  app.get("/api/users/:userId/progress", async (req, res) => {
    try {
      const progress = await storage.getUserProgress(req.params.userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users/:userId/progress", async (req, res) => {
    try {
      const progressData = insertUserProgressSchema.parse({
        ...req.body,
        userId: req.params.userId
      });
      const progress = await storage.createUserProgress(progressData);
      res.status(201).json(progress);
    } catch (error) {
      console.error("Error creating user progress:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/users/:userId/progress/:moduleId", async (req, res) => {
    try {
      const progress = await storage.updateUserProgress(req.params.userId, req.params.moduleId, req.body);
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      res.json(progress);
    } catch (error) {
      console.error("Error updating user progress:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Study group routes
  app.get("/api/study-groups", async (req, res) => {
    try {
      const collegeId = req.query.collegeId as string;
      if (!collegeId) {
        return res.status(400).json({ message: "College ID is required" });
      }
      
      const groups = await storage.getStudyGroups(collegeId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching study groups:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/study-groups", async (req, res) => {
    try {
      const groupData = insertStudyGroupSchema.parse(req.body);
      const group = await storage.createStudyGroup(groupData);
      res.status(201).json(group);
    } catch (error) {
      console.error("Error creating study group:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/study-groups/:groupId/join", async (req, res) => {
    try {
      const { userId } = req.body;
      const member = await storage.joinStudyGroup(req.params.groupId, userId);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error joining study group:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Job posting routes
  app.get("/api/job-postings", async (req, res) => {
    try {
      const collegeId = req.query.collegeId as string;
      if (!collegeId) {
        return res.status(400).json({ message: "College ID is required" });
      }
      
      const jobs = await storage.getJobPostings(collegeId);
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching job postings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/job-postings", async (req, res) => {
    try {
      const jobData = insertJobPostingSchema.parse(req.body);
      const job = await storage.createJobPosting(jobData);
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job posting:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/job-postings/:jobId/apply", async (req, res) => {
    try {
      const { userId } = req.body;
      const application = await storage.createApplication(req.params.jobId, userId);
      res.status(201).json(application);
    } catch (error) {
      console.error("Error submitting application:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Chat message routes
  app.get("/api/messages", async (req, res) => {
    try {
      const { userId, collegeId } = req.query;
      if (!userId || !collegeId) {
        return res.status(400).json({ message: "User ID and College ID are required" });
      }
      
      const messages = await storage.getMessages(userId as string, collegeId as string);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Forum routes
  app.get("/api/forum/posts", async (req, res) => {
    try {
      const collegeId = req.query.collegeId as string;
      if (!collegeId) {
        return res.status(400).json({ message: "College ID is required" });
      }
      
      const posts = await storage.getForumPosts(collegeId);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Seed database endpoint
  app.post("/api/seed", async (req, res) => {
    try {
      await storage.seedDatabase();
      res.json({ message: "Database seeded successfully" });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}