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

  // Enhanced Chat Groups API
  app.get("/api/chat-groups", async (req, res) => {
    try {
      const { collegeId, type } = req.query;
      if (!collegeId) {
        return res.status(400).json({ message: "College ID is required" });
      }
      
      const groups = await storage.getChatGroups(collegeId as string, type as string);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching chat groups:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/chat-groups", async (req, res) => {
    try {
      const group = await storage.createChatGroup(req.body);
      res.status(201).json(group);
    } catch (error) {
      console.error("Error creating chat group:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/chat-groups/:id", async (req, res) => {
    try {
      const group = await storage.updateChatGroup(req.params.id, req.body);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      res.json(group);
    } catch (error) {
      console.error("Error updating chat group:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/chat-groups/:id", async (req, res) => {
    try {
      const { userId } = req.body;
      const success = await storage.deleteChatGroup(req.params.id, userId);
      if (!success) {
        return res.status(403).json({ message: "Not authorized to delete this group" });
      }
      res.json({ message: "Group deleted successfully" });
    } catch (error) {
      console.error("Error deleting chat group:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/chat-groups/:groupId/join", async (req, res) => {
    try {
      const { userId } = req.body;
      const member = await storage.joinChatGroup(req.params.groupId, userId);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error joining chat group:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/chat-groups/:groupId/leave", async (req, res) => {
    try {
      const { userId } = req.body;
      const success = await storage.leaveChatGroup(req.params.groupId, userId);
      res.json({ success });
    } catch (error) {
      console.error("Error leaving chat group:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/chat-groups/:groupId/members", async (req, res) => {
    try {
      const members = await storage.getChatGroupMembers(req.params.groupId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching group members:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/chat-groups", async (req, res) => {
    try {
      const groups = await storage.getUserChatGroups(req.params.userId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching user groups:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Enhanced Messages API with Grammar Correction
  app.get("/api/messages", async (req, res) => {
    try {
      const { groupId, userId, collegeId } = req.query;
      const messages = await storage.getMessages(
        groupId as string, 
        userId as string, 
        collegeId as string
      );
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = req.body;
      
      // Process grammar correction if enabled
      if (messageData.content && messageData.enableGrammarCheck) {
        const correction = await storage.processGrammarCorrection(
          messageData.content, 
          messageData.senderId
        );
        messageData.originalContent = messageData.content;
        messageData.correctedContent = correction.correctedText;
        messageData.grammarSuggestions = correction.suggestions;
      }

      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/messages/:id", async (req, res) => {
    try {
      const message = await storage.updateMessage(req.params.id, req.body);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      res.json(message);
    } catch (error) {
      console.error("Error updating message:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/messages/:id", async (req, res) => {
    try {
      const { userId } = req.body;
      const success = await storage.deleteMessage(req.params.id, userId);
      res.json({ success });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // RSS Feeds API
  app.get("/api/rss-feeds", async (req, res) => {
    try {
      const { collegeId } = req.query;
      if (!collegeId) {
        return res.status(400).json({ message: "College ID is required" });
      }
      
      const feeds = await storage.getRssFeeds(collegeId as string);
      res.json(feeds);
    } catch (error) {
      console.error("Error fetching RSS feeds:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/rss-feeds", async (req, res) => {
    try {
      const feed = await storage.createRssFeed(req.body);
      res.status(201).json(feed);
    } catch (error) {
      console.error("Error creating RSS feed:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/rss-feeds/:id/approve", async (req, res) => {
    try {
      const { adminId } = req.body;
      const feed = await storage.approveRssFeed(req.params.id, adminId);
      if (!feed) {
        return res.status(404).json({ message: "RSS feed not found" });
      }
      res.json(feed);
    } catch (error) {
      console.error("Error approving RSS feed:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/rss-feeds/:feedId/items", async (req, res) => {
    try {
      const items = await storage.getRssFeedItems(req.params.feedId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching RSS items:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Enhanced Forum API
  app.get("/api/forum/categories", async (req, res) => {
    try {
      const { collegeId } = req.query;
      if (!collegeId) {
        return res.status(400).json({ message: "College ID is required" });
      }
      
      const categories = await storage.getForumCategories(collegeId as string);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching forum categories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/forum/categories", async (req, res) => {
    try {
      const category = await storage.createForumCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating forum category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/forum/posts", async (req, res) => {
    try {
      const { collegeId, categoryId, groupId } = req.query;
      if (!collegeId) {
        return res.status(400).json({ message: "College ID is required" });
      }
      
      const posts = await storage.getForumPosts(
        collegeId as string, 
        categoryId as string, 
        groupId as string
      );
      res.json(posts);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/forum/posts", async (req, res) => {
    try {
      const postData = req.body;
      
      // Process grammar correction for post content
      if (postData.content && postData.enableGrammarCheck) {
        const correction = await storage.processGrammarCorrection(
          postData.content, 
          postData.authorId
        );
        postData.originalContent = postData.content;
        postData.correctedContent = correction.correctedText;
        postData.grammarSuggestions = correction.suggestions;
      }

      const post = await storage.createForumPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating forum post:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/forum/posts/:postId/replies", async (req, res) => {
    try {
      const replies = await storage.getForumReplies(req.params.postId);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching forum replies:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/forum/posts/:postId/replies", async (req, res) => {
    try {
      const replyData = { ...req.body, postId: req.params.postId };
      
      // Process grammar correction for reply content
      if (replyData.content && replyData.enableGrammarCheck) {
        const correction = await storage.processGrammarCorrection(
          replyData.content, 
          replyData.authorId
        );
        replyData.originalContent = replyData.content;
        replyData.correctedContent = correction.correctedText;
        replyData.grammarSuggestions = correction.suggestions;
      }

      const reply = await storage.createForumReply(replyData);
      res.status(201).json(reply);
    } catch (error) {
      console.error("Error creating forum reply:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // File Sharing API
  app.post("/api/files/upload", async (req, res) => {
    try {
      const file = await storage.uploadFile(req.body);
      res.status(201).json(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/files/:id", async (req, res) => {
    try {
      const file = await storage.getFile(req.params.id);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      res.json(file);
    } catch (error) {
      console.error("Error fetching file:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      const { userId } = req.body;
      const success = await storage.deleteFile(req.params.id, userId);
      if (!success) {
        return res.status(403).json({ message: "Not authorized to delete this file" });
      }
      res.json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/files", async (req, res) => {
    try {
      const files = await storage.getUserFiles(req.params.userId);
      res.json(files);
    } catch (error) {
      console.error("Error fetching user files:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Grammar Correction API
  app.post("/api/grammar/check", async (req, res) => {
    try {
      const { text, userId } = req.body;
      const correction = await storage.processGrammarCorrection(text, userId);
      res.json(correction);
    } catch (error) {
      console.error("Error processing grammar correction:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/users/:userId/grammar-history", async (req, res) => {
    try {
      const history = await storage.getGrammarHistory(req.params.userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching grammar history:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Enhanced Video Resume API with Career Tracking
  app.get("/api/video-resumes", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const resumes = await storage.getVideoResumes(userId as string);
      res.json(resumes);
    } catch (error) {
      console.error("Error fetching video resumes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/video-resumes/:id", async (req, res) => {
    try {
      const resume = await storage.getVideoResumeById(req.params.id);
      if (!resume) {
        return res.status(404).json({ message: "Video resume not found" });
      }
      res.json(resume);
    } catch (error) {
      console.error("Error fetching video resume:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/video-resumes", async (req, res) => {
    try {
      const resume = await storage.createVideoResume(req.body);
      res.status(201).json(resume);
    } catch (error) {
      console.error("Error creating video resume:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/video-resumes/:id", async (req, res) => {
    try {
      const resume = await storage.updateVideoResume(req.params.id, req.body);
      if (!resume) {
        return res.status(404).json({ message: "Video resume not found" });
      }
      res.json(resume);
    } catch (error) {
      console.error("Error updating video resume:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/video-resumes/:id", async (req, res) => {
    try {
      const { userId } = req.body;
      const success = await storage.deleteVideoResume(req.params.id, userId);
      if (!success) {
        return res.status(403).json({ message: "Not authorized to delete this video resume" });
      }
      res.json({ message: "Video resume deleted successfully" });
    } catch (error) {
      console.error("Error deleting video resume:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/video-resumes/:id/cefr-level", async (req, res) => {
    try {
      const { cefrLevel, assignedBy } = req.body;
      const resume = await storage.assignCefrLevel(req.params.id, cefrLevel, assignedBy);
      if (!resume) {
        return res.status(404).json({ message: "Video resume not found" });
      }
      res.json(resume);
    } catch (error) {
      console.error("Error assigning CEFR level:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Advanced Recruiter Search API with Multiple Filters
  app.get("/api/video-resumes/search", async (req, res) => {
    try {
      const {
        collegeIds,
        gender,
        studentName,
        courseName,
        courseYear,
        cefrLevel,
        careerCategories,
        careerSubCategories,
        limit = "20",
        offset = "0"
      } = req.query;

      const filters = {
        collegeIds: collegeIds ? (Array.isArray(collegeIds) ? collegeIds : [collegeIds]) : undefined,
        gender: gender as string,
        studentName: studentName as string,
        courseName: courseName as string,
        courseYear: courseYear as string,
        cefrLevel: cefrLevel ? (Array.isArray(cefrLevel) ? cefrLevel : [cefrLevel]) : undefined,
        careerCategories: careerCategories ? (Array.isArray(careerCategories) ? careerCategories : [careerCategories]) : undefined,
        careerSubCategories: careerSubCategories ? (Array.isArray(careerSubCategories) ? careerSubCategories : [careerSubCategories]) : undefined,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      };

      const results = await storage.searchVideoResumes(filters);
      res.json(results);
    } catch (error) {
      console.error("Error searching video resumes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Recruiter Activity Tracking API
  app.post("/api/recruiter-activities", async (req, res) => {
    try {
      const activity = await storage.createRecruiterActivity(req.body);
      res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating recruiter activity:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/recruiter-activities", async (req, res) => {
    try {
      const { recruiterId } = req.query;
      if (!recruiterId) {
        return res.status(400).json({ message: "Recruiter ID is required" });
      }
      
      const activities = await storage.getRecruiterActivities(recruiterId as string);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recruiter activities:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Interest Notification API (Email of Interest to Interview)
  app.post("/api/interest-notifications", async (req, res) => {
    try {
      const notification = await storage.sendInterestNotification(req.body);
      
      // In a real application, trigger email sending here
      // await emailService.sendInterestEmail(notification);
      
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error sending interest notification:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/interest-notifications", async (req, res) => {
    try {
      const { studentId, recruiterId } = req.query;
      
      let notifications;
      if (studentId) {
        notifications = await storage.getInterestNotifications(studentId as string);
      } else if (recruiterId) {
        notifications = await storage.getRecruiterNotifications(recruiterId as string);
      } else {
        return res.status(400).json({ message: "Either studentId or recruiterId is required" });
      }
      
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching interest notifications:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/interest-notifications/:id/viewed", async (req, res) => {
    try {
      const success = await storage.markNotificationAsViewed(req.params.id);
      res.json({ success });
    } catch (error) {
      console.error("Error marking notification as viewed:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Bulk Upload API for Student Data
  app.post("/api/bulk-upload", async (req, res) => {
    try {
      const session = await storage.createBulkUploadSession(req.body);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating bulk upload session:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/bulk-upload/:sessionId/process", async (req, res) => {
    try {
      const { studentData } = req.body;
      await storage.processBulkStudentData(req.params.sessionId, studentData);
      
      // Get updated session status
      const sessions = await storage.getBulkUploadSessions(req.body.collegeId);
      const updatedSession = sessions.find(s => s.id === req.params.sessionId);
      
      res.json(updatedSession);
    } catch (error) {
      console.error("Error processing bulk upload:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/bulk-upload/:collegeId/sessions", async (req, res) => {
    try {
      const sessions = await storage.getBulkUploadSessions(req.params.collegeId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching bulk upload sessions:", error);
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