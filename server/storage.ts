import {
  colleges,
  users,
  practiceModules,
  userProgress,
  studyGroups,
  studyGroupMembers,
  jobPostings,
  jobApplications,
  chatGroups,
  chatGroupMembers,
  chatMessages,
  forumCategories,
  forumPosts,
  forumReplies,
  rssFeeds,
  rssFeedItems,
  sharedFiles,
  grammarCorrections,
  videoResumes,
  type College,
  type InsertCollege,
  type User,
  type InsertUser,
  type PracticeModule,
  type InsertPracticeModule,
  type UserProgress,
  type InsertUserProgress,
  type StudyGroup,
  type InsertStudyGroup,
  type StudyGroupMember,
  type JobPosting,
  type InsertJobPosting,
  type JobApplication,
  type InsertJobApplication,
  type ChatMessage,
  type InsertChatMessage,
  type ForumPost,
  type VideoResume,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // College operations
  getColleges(): Promise<College[]>;
  getCollege(id: string): Promise<College | undefined>;
  getCollegeByDomain(domain: string): Promise<College | undefined>;
  createCollege(college: InsertCollege): Promise<College>;

  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string, collegeId: string): Promise<User | undefined>;
  getUserByEmail(email: string, collegeId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  updateUserScores(userId: string, scores: { speaking?: number; writing?: number; reading?: number }): Promise<User | undefined>;

  // Practice module operations
  getPracticeModules(collegeId: string): Promise<PracticeModule[]>;
  getPracticeModule(id: string): Promise<PracticeModule | undefined>;
  createPracticeModule(module: InsertPracticeModule): Promise<PracticeModule>;

  // User progress operations
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getUserProgressForModule(userId: string, moduleId: string): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(userId: string, moduleId: string, updates: Partial<InsertUserProgress>): Promise<UserProgress | undefined>;

  // Study group operations
  getStudyGroups(collegeId: string): Promise<StudyGroup[]>;
  getStudyGroup(id: string): Promise<StudyGroup | undefined>;
  createStudyGroup(group: InsertStudyGroup): Promise<StudyGroup>;
  getStudyGroupsByUser(userId: string): Promise<StudyGroup[]>;
  joinStudyGroup(groupId: string, userId: string): Promise<StudyGroupMember>;
  getStudyGroupMembers(groupId: string): Promise<StudyGroupMember[]>;

  // Job posting operations
  getJobPostings(collegeId: string): Promise<JobPosting[]>;
  getJobPosting(id: string): Promise<JobPosting | undefined>;
  createJobPosting(job: InsertJobPosting): Promise<JobPosting>;
  getJobPostingsByRecruiter(recruiterId: string): Promise<JobPosting[]>;

  // Application operations
  getApplications(userId: string): Promise<JobApplication[]>;
  createApplication(jobId: string, userId: string): Promise<JobApplication>;
  getApplicationsForJob(jobId: string): Promise<JobApplication[]>;

  // Enhanced chat group operations
  getChatGroups(collegeId: string, type?: string): Promise<any[]>;
  getChatGroup(id: string): Promise<any | undefined>;
  createChatGroup(group: any): Promise<any>;
  updateChatGroup(id: string, updates: any): Promise<any | undefined>;
  deleteChatGroup(id: string, userId: string): Promise<boolean>;
  joinChatGroup(groupId: string, userId: string): Promise<any>;
  leaveChatGroup(groupId: string, userId: string): Promise<boolean>;
  getChatGroupMembers(groupId: string): Promise<any[]>;
  getUserChatGroups(userId: string): Promise<any[]>;

  // Enhanced messaging operations with grammar correction
  getMessages(groupId?: string, userId?: string, collegeId?: string): Promise<ChatMessage[]>;
  createMessage(message: InsertChatMessage): Promise<ChatMessage>;
  updateMessage(id: string, updates: any): Promise<ChatMessage | undefined>;
  deleteMessage(id: string, userId: string): Promise<boolean>;
  getConversation(user1Id: string, user2Id: string): Promise<ChatMessage[]>;
  processGrammarCorrection(text: string, userId: string): Promise<any>;

  // RSS feed operations
  getRssFeeds(collegeId: string): Promise<any[]>;
  createRssFeed(feed: any): Promise<any>;
  updateRssFeed(id: string, updates: any): Promise<any | undefined>;
  deleteRssFeed(id: string): Promise<boolean>;
  approveRssFeed(id: string, adminId: string): Promise<any | undefined>;
  getRssFeedItems(feedId: string): Promise<any[]>;
  createRssFeedItem(item: any): Promise<any>;
  approveRssFeedItem(id: string, adminId: string): Promise<any | undefined>;

  // Enhanced forum operations
  getForumCategories(collegeId: string): Promise<any[]>;
  createForumCategory(category: any): Promise<any>;
  getForumPosts(collegeId: string, categoryId?: string, groupId?: string): Promise<ForumPost[]>;
  getForumPost(id: string): Promise<ForumPost | undefined>;
  createForumPost(post: any): Promise<ForumPost>;
  updateForumPost(id: string, updates: any): Promise<ForumPost | undefined>;
  deleteForumPost(id: string, userId: string): Promise<boolean>;
  getForumReplies(postId: string): Promise<any[]>;
  createForumReply(reply: any): Promise<any>;
  updateForumReply(id: string, updates: any): Promise<any | undefined>;
  deleteForumReply(id: string, userId: string): Promise<boolean>;

  // File sharing operations
  uploadFile(fileData: any): Promise<any>;
  getFile(id: string): Promise<any | undefined>;
  deleteFile(id: string, userId: string): Promise<boolean>;
  getUserFiles(userId: string): Promise<any[]>;
  cleanupExpiredFiles(): Promise<number>;

  // Grammar correction operations
  saveGrammarCorrection(correction: any): Promise<any>;
  getGrammarHistory(userId: string): Promise<any[]>;

  // Video resume operations
  getVideoResumes(userId: string): Promise<VideoResume[]>;
  createVideoResume(resume: any): Promise<VideoResume>;

  // Seed data operations
  seedDatabase(): Promise<void>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // College operations
  async getColleges(): Promise<College[]> {
    return await db.select().from(colleges).where(eq(colleges.isActive, true));
  }

  async getCollege(id: string): Promise<College | undefined> {
    const [college] = await db.select().from(colleges).where(eq(colleges.id, id));
    return college;
  }

  async getCollegeByDomain(domain: string): Promise<College | undefined> {
    const [college] = await db.select().from(colleges).where(eq(colleges.domain, domain));
    return college;
  }

  async createCollege(insertCollege: InsertCollege): Promise<College> {
    const [college] = await db.insert(colleges).values(insertCollege).returning();
    return college;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string, collegeId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(eq(users.username, username), eq(users.collegeId, collegeId))
    );
    return user;
  }

  async getUserByEmail(email: string, collegeId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(
      and(eq(users.email, email), eq(users.collegeId, collegeId))
    );
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserScores(userId: string, scores: { speaking?: number; writing?: number; reading?: number }): Promise<User | undefined> {
    const updateData: any = { updatedAt: new Date() };
    if (scores.speaking !== undefined) updateData.speakingScore = scores.speaking;
    if (scores.writing !== undefined) updateData.writingScore = scores.writing;
    if (scores.reading !== undefined) updateData.readingScore = scores.reading;

    const [user] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Practice module operations
  async getPracticeModules(collegeId: string): Promise<PracticeModule[]> {
    return await db.select().from(practiceModules).where(
      and(eq(practiceModules.collegeId, collegeId), eq(practiceModules.isActive, true))
    );
  }

  async getPracticeModule(id: string): Promise<PracticeModule | undefined> {
    const [module] = await db.select().from(practiceModules).where(eq(practiceModules.id, id));
    return module;
  }

  async createPracticeModule(insertModule: InsertPracticeModule): Promise<PracticeModule> {
    const [module] = await db.insert(practiceModules).values(insertModule).returning();
    return module;
  }

  // User progress operations
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async getUserProgressForModule(userId: string, moduleId: string): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress).where(
      and(eq(userProgress.userId, userId), eq(userProgress.moduleId, moduleId))
    );
    return progress;
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db.insert(userProgress).values(insertProgress).returning();
    return progress;
  }

  async updateUserProgress(userId: string, moduleId: string, updates: Partial<InsertUserProgress>): Promise<UserProgress | undefined> {
    const [progress] = await db.update(userProgress)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(userProgress.userId, userId), eq(userProgress.moduleId, moduleId)))
      .returning();
    return progress;
  }

  // Study group operations
  async getStudyGroups(collegeId: string): Promise<StudyGroup[]> {
    return await db.select().from(studyGroups).where(
      and(eq(studyGroups.collegeId, collegeId), eq(studyGroups.isActive, true))
    );
  }

  async getStudyGroup(id: string): Promise<StudyGroup | undefined> {
    const [group] = await db.select().from(studyGroups).where(eq(studyGroups.id, id));
    return group;
  }

  async createStudyGroup(insertGroup: InsertStudyGroup): Promise<StudyGroup> {
    const [group] = await db.insert(studyGroups).values(insertGroup).returning();
    return group;
  }

  async getStudyGroupsByUser(userId: string): Promise<StudyGroup[]> {
    const memberGroups = await db.select({
      group: studyGroups
    })
    .from(studyGroupMembers)
    .innerJoin(studyGroups, eq(studyGroupMembers.groupId, studyGroups.id))
    .where(eq(studyGroupMembers.userId, userId));
    
    return memberGroups.map(result => result.group);
  }

  async joinStudyGroup(groupId: string, userId: string): Promise<StudyGroupMember> {
    const [member] = await db.insert(studyGroupMembers).values({
      groupId,
      userId,
      role: "member"
    }).returning();

    return member;
  }

  async getStudyGroupMembers(groupId: string): Promise<StudyGroupMember[]> {
    return await db.select().from(studyGroupMembers).where(eq(studyGroupMembers.groupId, groupId));
  }

  // Job posting operations
  async getJobPostings(collegeId: string): Promise<JobPosting[]> {
    return await db.select().from(jobPostings).where(
      and(eq(jobPostings.collegeId, collegeId), eq(jobPostings.isActive, true))
    );
  }

  async getJobPosting(id: string): Promise<JobPosting | undefined> {
    const [job] = await db.select().from(jobPostings).where(eq(jobPostings.id, id));
    return job;
  }

  async createJobPosting(insertJob: InsertJobPosting): Promise<JobPosting> {
    const [job] = await db.insert(jobPostings).values(insertJob).returning();
    return job;
  }

  async getJobPostingsByRecruiter(recruiterId: string): Promise<JobPosting[]> {
    return await db.select().from(jobPostings).where(eq(jobPostings.recruiterId, recruiterId));
  }

  // Application operations
  async getApplications(userId: string): Promise<JobApplication[]> {
    return await db.select().from(jobApplications).where(eq(jobApplications.applicantId, userId));
  }

  async createApplication(jobId: string, userId: string): Promise<JobApplication> {
    const [application] = await db.insert(jobApplications).values({
      jobId,
      applicantId: userId,
      status: "pending"
    }).returning();
    return application;
  }

  async getApplicationsForJob(jobId: string): Promise<JobApplication[]> {
    return await db.select().from(jobApplications).where(eq(jobApplications.jobId, jobId));
  }

  // Chat message operations
  async getMessages(userId: string, collegeId: string): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(
      and(
        eq(chatMessages.collegeId, collegeId),
        eq(chatMessages.receiverId, userId)
      )
    ).orderBy(desc(chatMessages.sentAt));
  }

  async createMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(insertMessage).returning();
    return message;
  }

  async getConversation(user1Id: string, user2Id: string): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(
      and(
        eq(chatMessages.senderId, user1Id),
        eq(chatMessages.receiverId, user2Id)
      )
    ).orderBy(desc(chatMessages.sentAt));
  }

  // Forum operations
  async getForumPosts(collegeId: string): Promise<ForumPost[]> {
    return await db.select().from(forumPosts).where(eq(forumPosts.collegeId, collegeId))
      .orderBy(desc(forumPosts.createdAt));
  }

  async createForumPost(post: any): Promise<ForumPost> {
    const [forumPost] = await db.insert(forumPosts).values(post).returning();
    return forumPost;
  }

  // Video resume operations
  async getVideoResumes(userId: string): Promise<VideoResume[]> {
    return await db.select().from(videoResumes).where(eq(videoResumes.userId, userId));
  }

  async createVideoResume(resume: any): Promise<VideoResume> {
    const [videoResume] = await db.insert(videoResumes).values(resume).returning();
    return videoResume;
  }

  // Seed database with sample data
  async seedDatabase(): Promise<void> {
    try {
      // Check if data already exists
      const existingColleges = await db.select().from(colleges);
      if (existingColleges.length > 0) {
        console.log("Database already seeded, skipping");
        return;
      }

      // Create sample college
      const [college] = await db.insert(colleges).values({
        name: "Delhi University",
        domain: "du.ac.in",
        isActive: true
      }).returning();

      // Create sample users using proper insert types
      const studentData = {
        collegeId: college.id,
        username: "arjun_student",
        email: "arjun@du.ac.in",
        password: "password123",
        firstName: "Arjun",
        lastName: "Kumar",
        role: "student" as const,
        englishLevel: "intermediate" as const,
        speakingScore: 75,
        writingScore: 82,
        readingScore: 88,
        practiceHours: 45,
        streak: 7,
        isActive: true
      };

      const [student] = await db.insert(users).values(studentData).returning();

      const recruiterData = {
        collegeId: college.id,
        username: "recruiter_tech",
        email: "hiring@techcorp.com",
        password: "password123",
        firstName: "Priya",
        lastName: "Sharma",
        role: "recruiter" as const,
        englishLevel: "advanced" as const,
        speakingScore: 95,
        writingScore: 92,
        readingScore: 96,
        practiceHours: 0,
        streak: 0,
        isActive: true
      };

      const [recruiter] = await db.insert(users).values(recruiterData).returning();

      // Create practice modules
      const moduleData = {
        collegeId: college.id,
        title: "Business English Conversation",
        description: "Practice professional conversations for workplace scenarios",
        type: "speaking" as const,
        difficulty: "intermediate" as const,
        duration: 30,
        exercises: [
          { type: "conversation", topic: "presentation" },
          { type: "conversation", topic: "meeting" },
          { type: "conversation", topic: "negotiation" }
        ],
        createdBy: student.id,
        isActive: true
      };

      const [practiceModule] = await db.insert(practiceModules).values(moduleData).returning();

      // Create study group
      const groupData = {
        collegeId: college.id,
        name: "Speaking Practice Circle",
        description: "Daily speaking practice sessions for intermediate learners",
        type: "speaking" as const,
        memberCount: 1,
        maxMembers: 8,
        isActive: true,
        nextSession: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdBy: student.id
      };

      const [studyGroup] = await db.insert(studyGroups).values(groupData).returning();

      // Create job posting
      const jobData = {
        collegeId: college.id,
        recruiterId: recruiter.id,
        title: "Junior Software Developer",
        company: "TechCorp Solutions",
        description: "Looking for fresh graduates with strong English communication skills for our development team.",
        location: "Bangalore, India",
        salary: "₹4-6 LPA",
        jobType: "full-time" as const,
        careerPath: "technology" as const,
        experienceLevel: "entry" as const,
        requirements: ["Strong communication skills", "Problem-solving", "Team collaboration", "Technical aptitude"],
        isActive: true
      };

      await db.insert(jobPostings).values(jobData);

      console.log("Database seeded successfully with sample data");
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }
}

export const storage = new DatabaseStorage();