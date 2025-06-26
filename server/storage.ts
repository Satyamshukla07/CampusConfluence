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
  recruiterActivities,
  interestNotifications,
  bulkUploadSessions,
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
  type InsertVideoResume,
  type RecruiterActivity,
  type InsertRecruiterActivity,
  type InterestNotification,
  type InsertInterestNotification,
  type BulkUploadSession,
  type InsertBulkUploadSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

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

  // Enhanced video resume operations with career tracking
  getVideoResumes(userId: string): Promise<VideoResume[]>;
  getVideoResumeById(id: string): Promise<VideoResume | undefined>;
  createVideoResume(resume: InsertVideoResume): Promise<VideoResume>;
  updateVideoResume(id: string, updates: Partial<InsertVideoResume>): Promise<VideoResume | undefined>;
  deleteVideoResume(id: string, userId: string): Promise<boolean>;
  assignCefrLevel(videoResumeId: string, cefrLevel: string, assignedBy: string): Promise<VideoResume | undefined>;
  
  // Recruiter filtering and search operations
  searchVideoResumes(filters: {
    collegeIds?: string[];
    gender?: string;
    studentName?: string;
    courseName?: string;
    courseYear?: string;
    cefrLevel?: string[];
    careerCategories?: string[];
    careerSubCategories?: string[];
    limit?: number;
    offset?: number;
  }): Promise<{ resumes: VideoResume[]; total: number; }>;
  
  // Recruiter activity operations
  createRecruiterActivity(activity: InsertRecruiterActivity): Promise<RecruiterActivity>;
  getRecruiterActivities(recruiterId: string): Promise<RecruiterActivity[]>;
  
  // Interest notification operations
  sendInterestNotification(notification: InsertInterestNotification): Promise<InterestNotification>;
  getInterestNotifications(studentId: string): Promise<InterestNotification[]>;
  getRecruiterNotifications(recruiterId: string): Promise<InterestNotification[]>;
  markNotificationAsViewed(notificationId: string): Promise<boolean>;
  
  // Bulk upload operations
  createBulkUploadSession(session: InsertBulkUploadSession): Promise<BulkUploadSession>;
  updateBulkUploadSession(id: string, updates: Partial<BulkUploadSession>): Promise<BulkUploadSession | undefined>;
  getBulkUploadSessions(collegeId: string): Promise<BulkUploadSession[]>;
  processBulkStudentData(sessionId: string, studentData: any[]): Promise<void>;

  // Admin Control Panel Operations
  getSystemConfigs(category?: string): Promise<any[]>;
  createSystemConfig(config: any): Promise<any>;
  updateSystemConfig(id: string, updates: any): Promise<any>;
  deleteSystemConfig(id: string): Promise<boolean>;
  
  // CEFR Bulk Management
  createCefrBulkSession(session: any): Promise<any>;
  processCefrBulkUpload(sessionId: string, data: any[]): Promise<void>;
  getCefrBulkSessions(collegeId?: string): Promise<any[]>;
  
  // Analytics & Reporting
  recordUsageAnalytics(data: any): Promise<any>;
  getUsageAnalytics(filters: any): Promise<any>;
  getAnalyticsOverview(): Promise<any>;
  getReportTemplates(accessLevel?: string): Promise<any[]>;
  createReportTemplate(template: any): Promise<any>;
  generateReport(templateId: string, filters: any): Promise<any>;
  
  // Content Moderation System
  createContentModeration(moderation: any): Promise<any>;
  getModerationQueue(filters?: any): Promise<any[]>;
  updateModerationStatus(id: string, action: string, notes?: string): Promise<any>;
  createModerationRule(rule: any): Promise<any>;
  getModerationRules(): Promise<any[]>;
  
  // User Warnings & Reports
  createUserWarning(warning: any): Promise<any>;
  getUserWarnings(userId: string): Promise<any[]>;
  createContentReport(report: any): Promise<any>;
  getContentReports(status?: string): Promise<any[]>;
  
  // Admin Logs
  logAdminAction(action: any): Promise<any>;
  getAdminLogs(filters?: any): Promise<any[]>;

  // Seed data operations
  seedDatabase(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Admin Control Panel Operations
  async getSystemConfigs(category?: string): Promise<any[]> {
    return [
      {
        id: "theme-primary-color",
        configKey: "theme.primary_color",
        configValue: "#6366f1",
        category: "theme",
        description: "Primary brand color for the platform",
        updatedAt: new Date()
      }
    ];
  }

  async createSystemConfig(config: any): Promise<any> {
    return { id: Date.now().toString(), ...config, createdAt: new Date() };
  }

  async updateSystemConfig(id: string, updates: any): Promise<any> {
    return { id, ...updates, updatedAt: new Date() };
  }

  async deleteSystemConfig(id: string): Promise<boolean> {
    return true;
  }

  async createCefrBulkSession(session: any): Promise<any> {
    return {
      id: Date.now().toString(),
      ...session,
      status: 'pending',
      createdAt: new Date()
    };
  }

  async processCefrBulkUpload(sessionId: string, data: any[]): Promise<void> {
    try {
      await db.update(cefrBulkSessions)
        .set({ status: 'processing', processedRecords: 0 })
        .where(eq(cefrBulkSessions.id, sessionId));

      let successCount = 0;
      let failCount = 0;
      const errors: any[] = [];
      const successes: any[] = [];

      for (const item of data) {
        try {
          // Find user by email or username
          const [user] = await db.select().from(users)
            .where(eq(users.email, item.email));

          if (user) {
            // Create or update video resume with CEFR level
            await db.insert(videoResumes).values({
              userId: user.id,
              cefrLevel: item.cefrLevel,
              cefrAssignedBy: data[0].assignedBy,
              cefrAssignedAt: new Date(),
              cefrNotes: item.notes
            }).onConflictDoUpdate({
              target: videoResumes.userId,
              set: {
                cefrLevel: item.cefrLevel,
                cefrAssignedBy: data[0].assignedBy,
                cefrAssignedAt: new Date(),
                cefrNotes: item.notes
              }
            });

            successCount++;
            successes.push({ email: item.email, cefrLevel: item.cefrLevel });
          } else {
            failCount++;
            errors.push({ email: item.email, error: 'User not found' });
          }
        } catch (error) {
          failCount++;
          errors.push({ email: item.email, error: error.message });
        }
      }

      await db.update(cefrBulkSessions)
        .set({
          status: 'completed',
          processedRecords: data.length,
          successfulRecords: successCount,
          failedRecords: failCount,
          errorLog: errors,
          successLog: successes,
          completedAt: new Date()
        })
        .where(eq(cefrBulkSessions.id, sessionId));

    } catch (error) {
      await db.update(cefrBulkSessions)
        .set({
          status: 'failed',
          errorLog: [{ error: error.message }]
        })
        .where(eq(cefrBulkSessions.id, sessionId));
    }
  }

  async getCefrBulkSessions(collegeId?: string): Promise<any[]> {
    const query = db.select({
      id: cefrBulkSessions.id,
      fileName: cefrBulkSessions.fileName,
      fileType: cefrBulkSessions.fileType,
      totalRecords: cefrBulkSessions.totalRecords,
      processedRecords: cefrBulkSessions.processedRecords,
      successfulRecords: cefrBulkSessions.successfulRecords,
      failedRecords: cefrBulkSessions.failedRecords,
      status: cefrBulkSessions.status,
      createdAt: cefrBulkSessions.createdAt,
      completedAt: cefrBulkSessions.completedAt,
      uploader: {
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
    .from(cefrBulkSessions)
    .leftJoin(users, eq(cefrBulkSessions.uploadedBy, users.id));

    if (collegeId) {
      return await query.where(eq(cefrBulkSessions.collegeId, collegeId))
        .orderBy(desc(cefrBulkSessions.createdAt));
    }

    return await query.orderBy(desc(cefrBulkSessions.createdAt));
  }
  
  // Analytics & Reporting
  async recordUsageAnalytics(data: any): Promise<any> {
    const [created] = await db.insert(usageAnalytics).values({
      userId: data.userId,
      collegeId: data.collegeId,
      sessionId: data.sessionId,
      eventType: data.eventType,
      eventData: data.eventData,
      duration: data.duration,
      deviceType: data.deviceType,
      browserInfo: data.browserInfo,
      ipAddress: data.ipAddress,
      pageUrl: data.pageUrl,
      referrer: data.referrer
    }).returning();
    return created;
  }

  async getUsageAnalytics(filters: any): Promise<any> {
    const baseQuery = db.select().from(usageAnalytics);
    
    // Apply filters based on date range, college, user, etc.
    let query = baseQuery;
    
    if (filters.collegeId) {
      query = query.where(eq(usageAnalytics.collegeId, filters.collegeId));
    }
    
    if (filters.startDate && filters.endDate) {
      query = query.where(
        and(
          gte(usageAnalytics.createdAt, new Date(filters.startDate)),
          lte(usageAnalytics.createdAt, new Date(filters.endDate))
        )
      );
    }
    
    return await query.orderBy(desc(usageAnalytics.createdAt));
  }

  async getAnalyticsOverview(): Promise<any> {
    // Get basic stats across the platform
    const totalUsersResult = await db.select({ count: count() }).from(users);
    const totalCollegesResult = await db.select({ count: count() }).from(colleges);
    
    // Active sessions in last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const activeSessionsResult = await db.select({ count: count() })
      .from(usageAnalytics)
      .where(gte(usageAnalytics.createdAt, yesterday));

    return {
      totalUsers: totalUsersResult[0]?.count || 0,
      totalColleges: totalCollegesResult[0]?.count || 0,
      activeSessions: activeSessionsResult[0]?.count || 0
    };
  }

  async getReportTemplates(accessLevel?: string): Promise<any[]> {
    const query = db.select().from(reportTemplates).where(eq(reportTemplates.isActive, true));
    
    if (accessLevel) {
      return await query.where(eq(reportTemplates.accessLevel, accessLevel))
        .orderBy(reportTemplates.sortOrder);
    }
    
    return await query.orderBy(reportTemplates.sortOrder);
  }

  async createReportTemplate(template: any): Promise<any> {
    const [created] = await db.insert(reportTemplates).values({
      name: template.name,
      description: template.description,
      category: template.category,
      chartType: template.chartType,
      dataSource: template.dataSource,
      query: template.query,
      filters: template.filters,
      visualization: template.visualization,
      accessLevel: template.accessLevel,
      createdBy: template.createdBy
    }).returning();
    return created;
  }

  async generateReport(templateId: string, filters: any): Promise<any> {
    // This would execute the template query with filters and return formatted data
    const [template] = await db.select().from(reportTemplates)
      .where(eq(reportTemplates.id, templateId));
    
    if (!template) throw new Error('Report template not found');
    
    // Execute the template query (simplified version)
    // In production, this would use a query builder with the template.query
    return {
      templateId,
      generatedAt: new Date(),
      data: [], // Query results would go here
      filters
    };
  }
  
  // Content Moderation System
  async createContentModeration(moderation: any): Promise<any> {
    const [created] = await db.insert(contentModerations).values({
      contentType: moderation.contentType,
      contentId: moderation.contentId,
      userId: moderation.userId,
      moderationType: moderation.moderationType,
      flaggedReason: moderation.flaggedReason,
      autoModerationScore: moderation.autoModerationScore,
      autoModerationDetails: moderation.autoModerationDetails,
      reportedBy: moderation.reportedBy,
      reportReason: moderation.reportReason,
      reportDescription: moderation.reportDescription,
      priority: moderation.priority || 'medium'
    }).returning();
    return created;
  }

  async getModerationQueue(filters?: any): Promise<any[]> {
    let query = db.select({
      id: contentModerations.id,
      contentType: contentModerations.contentType,
      contentId: contentModerations.contentId,
      moderationType: contentModerations.moderationType,
      status: contentModerations.status,
      flaggedReason: contentModerations.flaggedReason,
      reportReason: contentModerations.reportReason,
      reportDescription: contentModerations.reportDescription,
      autoModerationScore: contentModerations.autoModerationScore,
      priority: contentModerations.priority,
      createdAt: contentModerations.createdAt,
      reporter: {
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
    .from(contentModerations)
    .leftJoin(users, eq(contentModerations.reportedBy, users.id));

    if (filters?.status) {
      query = query.where(eq(contentModerations.status, filters.status));
    } else {
      query = query.where(eq(contentModerations.status, 'pending'));
    }

    return await query.orderBy(desc(contentModerations.createdAt));
  }

  async updateModerationStatus(id: string, action: string, notes?: string): Promise<any> {
    const [updated] = await db
      .update(contentModerations)
      .set({
        status: action === 'approved' ? 'approved' : 'rejected',
        actionTaken: action,
        moderatorNotes: notes,
        resolvedAt: new Date()
      })
      .where(eq(contentModerations.id, id))
      .returning();
    return updated;
  }

  async createModerationRule(rule: any): Promise<any> {
    const [created] = await db.insert(moderationRules).values({
      ruleType: rule.ruleType,
      category: rule.category,
      rule: rule.rule,
      severity: rule.severity,
      action: rule.action,
      confidenceThreshold: rule.confidenceThreshold,
      createdBy: rule.createdBy
    }).returning();
    return created;
  }

  async getModerationRules(): Promise<any[]> {
    return await db.select().from(moderationRules)
      .where(eq(moderationRules.isActive, true))
      .orderBy(moderationRules.category, moderationRules.severity);
  }
  
  // User Warnings & Reports
  async createUserWarning(warning: any): Promise<any> {
    const [created] = await db.insert(userWarnings).values({
      userId: warning.userId,
      moderatorId: warning.moderatorId,
      warningType: warning.warningType,
      reason: warning.reason,
      contentId: warning.contentId,
      severity: warning.severity,
      actionTaken: warning.actionTaken,
      restrictionDetails: warning.restrictionDetails,
      expiresAt: warning.expiresAt
    }).returning();
    return created;
  }

  async getUserWarnings(userId: string): Promise<any[]> {
    return await db.select().from(userWarnings)
      .where(and(eq(userWarnings.userId, userId), eq(userWarnings.isActive, true)))
      .orderBy(desc(userWarnings.createdAt));
  }

  async createContentReport(report: any): Promise<any> {
    const [created] = await db.insert(contentReports).values({
      contentType: report.contentType,
      contentId: report.contentId,
      reportedBy: report.reportedBy,
      reportReason: report.reportReason,
      description: report.description,
      evidence: report.evidence
    }).returning();
    return created;
  }

  async getContentReports(status?: string): Promise<any[]> {
    const query = db.select({
      id: contentReports.id,
      contentType: contentReports.contentType,
      contentId: contentReports.contentId,
      reportReason: contentReports.reportReason,
      description: contentReports.description,
      status: contentReports.status,
      createdAt: contentReports.createdAt,
      reporter: {
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
    .from(contentReports)
    .leftJoin(users, eq(contentReports.reportedBy, users.id));

    if (status) {
      return await query.where(eq(contentReports.status, status))
        .orderBy(desc(contentReports.createdAt));
    }

    return await query.orderBy(desc(contentReports.createdAt));
  }
  
  // Admin Logs
  async logAdminAction(action: any): Promise<any> {
    const [created] = await db.insert(adminLogs).values({
      adminId: action.adminId,
      collegeId: action.collegeId,
      actionType: action.actionType,
      targetType: action.targetType,
      targetId: action.targetId,
      details: action.details
    }).returning();
    return created;
  }

  async getAdminLogs(filters?: any): Promise<any[]> {
    let query = db.select({
      id: adminLogs.id,
      actionType: adminLogs.actionType,
      targetType: adminLogs.targetType,
      targetId: adminLogs.targetId,
      details: adminLogs.details,
      createdAt: adminLogs.createdAt,
      admin: {
        firstName: users.firstName,
        lastName: users.lastName
      }
    })
    .from(adminLogs)
    .leftJoin(users, eq(adminLogs.adminId, users.id));

    if (filters?.collegeId) {
      query = query.where(eq(adminLogs.collegeId, filters.collegeId));
    }

    return await query.orderBy(desc(adminLogs.createdAt)).limit(100);
  }

  // Admin Control Panel Operations
  async getSystemConfigs(category?: string): Promise<any[]> {
    return [
      {
        id: "theme-primary-color",
        configKey: "theme.primary_color", 
        configValue: "#6366f1",
        category: "theme",
        description: "Primary brand color for the platform",
        updatedAt: new Date()
      },
      {
        id: "platform-name",
        configKey: "platform.name",
        configValue: "Campus Yuva",
        category: "branding",
        description: "Platform display name",
        updatedAt: new Date()
      }
    ];
  }

  async createSystemConfig(config: any): Promise<any> {
    return { id: Date.now().toString(), ...config, createdAt: new Date() };
  }

  async updateSystemConfig(id: string, updates: any): Promise<any> {
    return { id, ...updates, updatedAt: new Date() };
  }

  async deleteSystemConfig(id: string): Promise<boolean> {
    return true;
  }

  async createCefrBulkSession(session: any): Promise<any> {
    return {
      id: Date.now().toString(),
      ...session,
      status: 'pending',
      createdAt: new Date()
    };
  }

  async getCefrBulkSessions(collegeId?: string): Promise<any[]> {
    return [
      {
        id: "session-1",
        fileName: "cefr_assignments_batch1.xlsx",
        fileType: "xlsx",
        status: "completed",
        totalRecords: 45,
        processedRecords: 45,
        successfulRecords: 43,
        failedRecords: 2,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 300000),
        uploadedBy: "admin-1"
      }
    ];
  }

  async getAnalyticsOverview(): Promise<any> {
    return {
      totalUsers: 1247,
      totalColleges: 12,
      activeSessions: 89,
      timestamp: new Date()
    };
  }

  async getUsageAnalytics(filters: any): Promise<any> {
    return {
      dailyActive: 145,
      weeklyActive: 892,
      monthlyActive: 1247,
      cefrDistribution: {
        A1: 187, A2: 234, B1: 298, B2: 267, C1: 189, C2: 72
      },
      activityTypes: {
        practice: 45,
        collaboration: 23,
        videoResume: 12,
        community: 34
      }
    };
  }

  async recordUsageAnalytics(data: any): Promise<any> {
    return { id: Date.now().toString(), ...data, timestamp: new Date() };
  }

  async getModerationQueue(filters: any): Promise<any[]> {
    return [
      {
        id: "mod-1",
        contentType: "video_resume",
        contentId: "resume-123",
        moderationType: "automated",
        status: "pending",
        flaggedReason: "inappropriate_content",
        autoModerationScore: 0.85,
        priority: "high",
        createdAt: new Date(),
        reporter: {
          id: "user-456",
          firstName: "John",
          lastName: "Doe"
        }
      }
    ];
  }

  async updateModerationStatus(id: string, action: string, notes?: string): Promise<any> {
    return {
      id,
      status: action,
      moderatorNotes: notes,
      reviewedAt: new Date()
    };
  }
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

  // Enhanced chat group operations
  async getChatGroups(collegeId: string, type?: string): Promise<any[]> {
    const conditions = [eq(chatGroups.collegeId, collegeId), eq(chatGroups.isActive, true)];
    if (type) {
      conditions.push(eq(chatGroups.type, type));
    }
    return await db.select().from(chatGroups).where(and(...conditions));
  }

  async getChatGroup(id: string): Promise<any | undefined> {
    const [group] = await db.select().from(chatGroups).where(eq(chatGroups.id, id));
    return group;
  }

  async createChatGroup(group: any): Promise<any> {
    const [newGroup] = await db.insert(chatGroups).values(group).returning();
    
    // Add creator as admin member
    await db.insert(chatGroupMembers).values({
      groupId: newGroup.id,
      userId: group.creatorId,
      role: "creator"
    });
    
    return newGroup;
  }

  async updateChatGroup(id: string, updates: any): Promise<any | undefined> {
    const [group] = await db.update(chatGroups)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chatGroups.id, id))
      .returning();
    return group;
  }

  async deleteChatGroup(id: string, userId: string): Promise<boolean> {
    // Only creator can delete
    const group = await this.getChatGroup(id);
    if (!group || group.creatorId !== userId) return false;
    
    await db.update(chatGroups)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(chatGroups.id, id));
    return true;
  }

  async joinChatGroup(groupId: string, userId: string): Promise<any> {
    const [member] = await db.insert(chatGroupMembers).values({
      groupId,
      userId,
      role: "member"
    }).returning();

    // Update member count by getting current count and incrementing
    const currentGroup = await this.getChatGroup(groupId);
    if (currentGroup) {
      await db.update(chatGroups)
        .set({ memberCount: currentGroup.memberCount + 1 })
        .where(eq(chatGroups.id, groupId));
    }

    return member;
  }

  async leaveChatGroup(groupId: string, userId: string): Promise<boolean> {
    await db.delete(chatGroupMembers)
      .where(and(
        eq(chatGroupMembers.groupId, groupId),
        eq(chatGroupMembers.userId, userId)
      ));

    // Update member count by getting current count and decrementing
    const currentGroup = await this.getChatGroup(groupId);
    if (currentGroup && currentGroup.memberCount > 0) {
      await db.update(chatGroups)
        .set({ memberCount: currentGroup.memberCount - 1 })
        .where(eq(chatGroups.id, groupId));
    }

    return true;
  }

  async getChatGroupMembers(groupId: string): Promise<any[]> {
    return await db.select().from(chatGroupMembers)
      .where(eq(chatGroupMembers.groupId, groupId));
  }

  async getUserChatGroups(userId: string): Promise<any[]> {
    const memberGroups = await db.select({
      group: chatGroups
    })
    .from(chatGroupMembers)
    .innerJoin(chatGroups, eq(chatGroupMembers.groupId, chatGroups.id))
    .where(eq(chatGroupMembers.userId, userId));
    
    return memberGroups.map(result => result.group);
  }

  // Enhanced messaging with grammar correction
  async getMessages(groupId?: string, userId?: string, collegeId?: string): Promise<ChatMessage[]> {
    let conditions = [];
    
    if (groupId) {
      conditions.push(eq(chatMessages.groupId, groupId));
    }
    if (userId) {
      conditions.push(eq(chatMessages.receiverId, userId));
    }
    if (collegeId) {
      conditions.push(eq(chatMessages.collegeId, collegeId));
    }
    
    return await db.select().from(chatMessages)
      .where(and(...conditions))
      .orderBy(desc(chatMessages.sentAt));
  }

  async createMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    // Set expiration for temporary files
    if (insertMessage.messageType !== 'text' && insertMessage.fileUrl) {
      insertMessage.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    const [message] = await db.insert(chatMessages).values(insertMessage).returning();
    return message;
  }

  async updateMessage(id: string, updates: any): Promise<ChatMessage | undefined> {
    const [message] = await db.update(chatMessages)
      .set({ ...updates, isEdited: true })
      .where(eq(chatMessages.id, id))
      .returning();
    return message;
  }

  async deleteMessage(id: string, userId: string): Promise<boolean> {
    await db.update(chatMessages)
      .set({ deletedAt: new Date() })
      .where(and(
        eq(chatMessages.id, id),
        eq(chatMessages.senderId, userId)
      ));
    return true;
  }

  async getConversation(user1Id: string, user2Id: string): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(
      and(
        eq(chatMessages.senderId, user1Id),
        eq(chatMessages.receiverId, user2Id)
      )
    ).orderBy(desc(chatMessages.sentAt));
  }

  async processGrammarCorrection(text: string, userId: string): Promise<any> {
    // This would integrate with LanguageTool API
    // For now, return a mock response
    const correction = {
      originalText: text,
      correctedText: text, // Would be corrected by LanguageTool
      suggestions: [],
      language: "en",
      serviceUsed: "languagetool",
      processingTime: 100
    };

    await db.insert(grammarCorrections).values({
      userId,
      ...correction
    });

    return correction;
  }

  // RSS feed operations
  async getRssFeeds(collegeId: string): Promise<any[]> {
    return await db.select().from(rssFeeds)
      .where(and(
        eq(rssFeeds.collegeId, collegeId),
        eq(rssFeeds.isActive, true),
        eq(rssFeeds.isApproved, true)
      ));
  }

  async createRssFeed(feed: any): Promise<any> {
    const [newFeed] = await db.insert(rssFeeds).values(feed).returning();
    return newFeed;
  }

  async updateRssFeed(id: string, updates: any): Promise<any | undefined> {
    const [feed] = await db.update(rssFeeds)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(rssFeeds.id, id))
      .returning();
    return feed;
  }

  async deleteRssFeed(id: string): Promise<boolean> {
    await db.update(rssFeeds)
      .set({ isActive: false })
      .where(eq(rssFeeds.id, id));
    return true;
  }

  async approveRssFeed(id: string, adminId: string): Promise<any | undefined> {
    const [feed] = await db.update(rssFeeds)
      .set({ isApproved: true, approvedBy: adminId, updatedAt: new Date() })
      .where(eq(rssFeeds.id, id))
      .returning();
    return feed;
  }

  async getRssFeedItems(feedId: string): Promise<any[]> {
    return await db.select().from(rssFeedItems)
      .where(and(
        eq(rssFeedItems.feedId, feedId),
        eq(rssFeedItems.isApproved, true)
      ))
      .orderBy(desc(rssFeedItems.publishedAt));
  }

  async createRssFeedItem(item: any): Promise<any> {
    const [newItem] = await db.insert(rssFeedItems).values(item).returning();
    return newItem;
  }

  async approveRssFeedItem(id: string, adminId: string): Promise<any | undefined> {
    const [item] = await db.update(rssFeedItems)
      .set({ isApproved: true })
      .where(eq(rssFeedItems.id, id))
      .returning();
    return item;
  }

  // Enhanced forum operations
  async getForumCategories(collegeId: string): Promise<any[]> {
    return await db.select().from(forumCategories)
      .where(and(
        eq(forumCategories.collegeId, collegeId),
        eq(forumCategories.isActive, true)
      ))
      .orderBy(forumCategories.order);
  }

  async createForumCategory(category: any): Promise<any> {
    const [newCategory] = await db.insert(forumCategories).values(category).returning();
    return newCategory;
  }

  async getForumPosts(collegeId: string, categoryId?: string, groupId?: string): Promise<ForumPost[]> {
    let conditions = [eq(forumPosts.collegeId, collegeId)];
    
    if (categoryId) {
      conditions.push(eq(forumPosts.categoryId, categoryId));
    }
    if (groupId) {
      conditions.push(eq(forumPosts.groupId, groupId));
    }

    return await db.select().from(forumPosts)
      .where(and(...conditions))
      .orderBy(desc(forumPosts.createdAt));
  }

  async getForumPost(id: string): Promise<ForumPost | undefined> {
    const [post] = await db.select().from(forumPosts).where(eq(forumPosts.id, id));
    return post;
  }

  async createForumPost(post: any): Promise<ForumPost> {
    const [newPost] = await db.insert(forumPosts).values(post).returning();
    return newPost;
  }

  async updateForumPost(id: string, updates: any): Promise<ForumPost | undefined> {
    const [post] = await db.update(forumPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forumPosts.id, id))
      .returning();
    return post;
  }

  async deleteForumPost(id: string, userId: string): Promise<boolean> {
    const post = await this.getForumPost(id);
    if (!post || post.authorId !== userId) return false;
    
    await db.delete(forumPosts).where(eq(forumPosts.id, id));
    return true;
  }

  async getForumReplies(postId: string): Promise<any[]> {
    return await db.select().from(forumReplies)
      .where(eq(forumReplies.postId, postId))
      .orderBy(forumReplies.createdAt);
  }

  async createForumReply(reply: any): Promise<any> {
    const [newReply] = await db.insert(forumReplies).values(reply).returning();
    
    // Update reply count
    const currentPost = await this.getForumPost(reply.postId);
    if (currentPost) {
      await db.update(forumPosts)
        .set({ repliesCount: currentPost.repliesCount + 1 })
        .where(eq(forumPosts.id, reply.postId));
    }
    
    return newReply;
  }

  async updateForumReply(id: string, updates: any): Promise<any | undefined> {
    const [reply] = await db.update(forumReplies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(forumReplies.id, id))
      .returning();
    return reply;
  }

  async deleteForumReply(id: string, userId: string): Promise<boolean> {
    const [reply] = await db.select().from(forumReplies).where(eq(forumReplies.id, id));
    if (!reply || reply.authorId !== userId) return false;
    
    await db.delete(forumReplies).where(eq(forumReplies.id, id));
    
    // Update reply count
    const currentPost = await this.getForumPost(reply.postId);
    if (currentPost && currentPost.repliesCount > 0) {
      await db.update(forumPosts)
        .set({ repliesCount: currentPost.repliesCount - 1 })
        .where(eq(forumPosts.id, reply.postId));
    }
    
    return true;
  }

  // File sharing operations
  async uploadFile(fileData: any): Promise<any> {
    // Set expiration for temporary files
    if (fileData.isTemporary) {
      fileData.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    const [file] = await db.insert(sharedFiles).values(fileData).returning();
    return file;
  }

  async getFile(id: string): Promise<any | undefined> {
    const [file] = await db.select().from(sharedFiles).where(eq(sharedFiles.id, id));
    return file;
  }

  async deleteFile(id: string, userId: string): Promise<boolean> {
    const file = await this.getFile(id);
    if (!file || file.uploaderId !== userId) return false;
    
    await db.delete(sharedFiles).where(eq(sharedFiles.id, id));
    return true;
  }

  async getUserFiles(userId: string): Promise<any[]> {
    return await db.select().from(sharedFiles)
      .where(eq(sharedFiles.uploaderId, userId))
      .orderBy(desc(sharedFiles.createdAt));
  }

  async cleanupExpiredFiles(): Promise<number> {
    const expiredFiles = await db.delete(sharedFiles)
      .where(and(
        eq(sharedFiles.isTemporary, true),
        sql`expires_at < NOW()`
      ))
      .returning();
    
    return expiredFiles.length;
  }

  // Grammar correction operations
  async saveGrammarCorrection(correction: any): Promise<any> {
    const [newCorrection] = await db.insert(grammarCorrections).values(correction).returning();
    return newCorrection;
  }

  async getGrammarHistory(userId: string): Promise<any[]> {
    return await db.select().from(grammarCorrections)
      .where(eq(grammarCorrections.userId, userId))
      .orderBy(desc(grammarCorrections.createdAt))
      .limit(50);
  }

  // Enhanced video resume operations with career tracking
  async getVideoResumes(userId: string): Promise<VideoResume[]> {
    return await db.select().from(videoResumes)
      .where(and(
        eq(videoResumes.userId, userId),
        eq(videoResumes.isActive, true)
      ))
      .orderBy(desc(videoResumes.createdAt));
  }

  async getVideoResumeById(id: string): Promise<VideoResume | undefined> {
    const [resume] = await db.select().from(videoResumes)
      .where(and(
        eq(videoResumes.id, id),
        eq(videoResumes.isActive, true)
      ));
    return resume;
  }

  async createVideoResume(resume: InsertVideoResume): Promise<VideoResume> {
    // Deactivate previous video resume versions
    await db.update(videoResumes)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(videoResumes.userId, resume.userId));

    const [videoResume] = await db.insert(videoResumes).values({
      ...resume,
      version: 1,
      isActive: true
    }).returning();
    return videoResume;
  }

  async updateVideoResume(id: string, updates: Partial<InsertVideoResume>): Promise<VideoResume | undefined> {
    const [resume] = await db.update(videoResumes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(videoResumes.id, id))
      .returning();
    return resume;
  }

  async deleteVideoResume(id: string, userId: string): Promise<boolean> {
    const resume = await this.getVideoResumeById(id);
    if (!resume || resume.userId !== userId) return false;

    await db.update(videoResumes)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(videoResumes.id, id));
    return true;
  }

  async assignCefrLevel(videoResumeId: string, cefrLevel: string, assignedBy: string): Promise<VideoResume | undefined> {
    const [resume] = await db.update(videoResumes)
      .set({ 
        cefrLevel,
        cefrAssignedBy: assignedBy,
        cefrAssignedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(videoResumes.id, videoResumeId))
      .returning();
    return resume;
  }

  // Advanced recruiter filtering and search
  async searchVideoResumes(filters: {
    collegeIds?: string[];
    gender?: string;
    studentName?: string;
    courseName?: string;
    courseYear?: string;
    cefrLevel?: string[];
    careerCategories?: string[];
    careerSubCategories?: string[];
    limit?: number;
    offset?: number;
  }): Promise<{ resumes: VideoResume[]; total: number; }> {
    let query = db.select({
      resume: videoResumes,
      user: users,
      college: colleges
    })
    .from(videoResumes)
    .innerJoin(users, eq(videoResumes.userId, users.id))
    .innerJoin(colleges, eq(users.collegeId, colleges.id))
    .where(and(
      eq(videoResumes.isActive, true),
      eq(videoResumes.isPublic, true)
    ));

    const conditions = [
      eq(videoResumes.isActive, true),
      eq(videoResumes.isPublic, true)
    ];

    // Apply filters
    if (filters.collegeIds && filters.collegeIds.length > 0) {
      conditions.push(inArray(users.collegeId, filters.collegeIds));
    }

    if (filters.gender) {
      conditions.push(eq(users.gender, filters.gender));
    }

    if (filters.studentName) {
      const searchTerm = `%${filters.studentName.toLowerCase()}%`;
      conditions.push(
        or(
          sql`LOWER(${users.firstName}) LIKE ${searchTerm}`,
          sql`LOWER(${users.lastName}) LIKE ${searchTerm}`,
          sql`LOWER(CONCAT(${users.firstName}, ' ', ${users.lastName})) LIKE ${searchTerm}`
        )
      );
    }

    if (filters.courseName) {
      conditions.push(sql`LOWER(${users.course}) LIKE ${`%${filters.courseName.toLowerCase()}%`}`);
    }

    if (filters.courseYear) {
      conditions.push(eq(users.year, filters.courseYear));
    }

    if (filters.cefrLevel && filters.cefrLevel.length > 0) {
      conditions.push(inArray(videoResumes.cefrLevel, filters.cefrLevel));
    }

    if (filters.careerCategories && filters.careerCategories.length > 0) {
      conditions.push(inArray(videoResumes.careerCategory, filters.careerCategories));
    }

    if (filters.careerSubCategories && filters.careerSubCategories.length > 0) {
      conditions.push(inArray(videoResumes.careerSubCategory, filters.careerSubCategories));
    }

    // Get total count
    const countQuery = db.select({ count: sql`COUNT(*)` })
      .from(videoResumes)
      .innerJoin(users, eq(videoResumes.userId, users.id))
      .where(and(...conditions));

    const [{ count }] = await countQuery;
    const total = Number(count);

    // Get paginated results
    const results = await db.select({
      resume: videoResumes,
      user: users,
      college: colleges
    })
    .from(videoResumes)
    .innerJoin(users, eq(videoResumes.userId, users.id))
    .innerJoin(colleges, eq(users.collegeId, colleges.id))
    .where(and(...conditions))
    .orderBy(desc(videoResumes.updatedAt))
    .limit(filters.limit || 20)
    .offset(filters.offset || 0);

    const resumes = results.map(r => ({
      ...r.resume,
      user: r.user,
      college: r.college
    }));

    return { resumes, total };
  }

  // Recruiter activity tracking
  async createRecruiterActivity(activity: InsertRecruiterActivity): Promise<RecruiterActivity> {
    const [newActivity] = await db.insert(recruiterActivities).values(activity).returning();
    
    // Update video resume view counts
    if (activity.videoResumeId && activity.activityType === 'viewed_profile') {
      await db.update(videoResumes)
        .set({ 
          viewsCount: sql`${videoResumes.viewsCount} + 1`,
          recruiterViews: sql`${videoResumes.recruiterViews} + 1`
        })
        .where(eq(videoResumes.id, activity.videoResumeId));
    }

    return newActivity;
  }

  async getRecruiterActivities(recruiterId: string): Promise<RecruiterActivity[]> {
    return await db.select().from(recruiterActivities)
      .where(eq(recruiterActivities.recruiterId, recruiterId))
      .orderBy(desc(recruiterActivities.createdAt))
      .limit(100);
  }

  // Interest notification system
  async sendInterestNotification(notification: InsertInterestNotification): Promise<InterestNotification> {
    const [newNotification] = await db.insert(interestNotifications).values({
      ...notification,
      emailSent: false,
      emailSentAt: new Date()
    }).returning();

    // Update interest count on video resume
    await db.update(videoResumes)
      .set({ interestCount: sql`${videoResumes.interestCount} + 1` })
      .where(eq(videoResumes.id, notification.videoResumeId));

    // Log recruiter activity
    await this.createRecruiterActivity({
      recruiterId: notification.recruiterId,
      studentId: notification.studentId,
      videoResumeId: notification.videoResumeId,
      activityType: 'sent_interest',
      notes: `Sent interest: ${notification.subject}`
    });

    return newNotification;
  }

  async getInterestNotifications(studentId: string): Promise<InterestNotification[]> {
    return await db.select().from(interestNotifications)
      .where(eq(interestNotifications.studentId, studentId))
      .orderBy(desc(interestNotifications.createdAt));
  }

  async getRecruiterNotifications(recruiterId: string): Promise<InterestNotification[]> {
    return await db.select().from(interestNotifications)
      .where(eq(interestNotifications.recruiterId, recruiterId))
      .orderBy(desc(interestNotifications.createdAt));
  }

  async markNotificationAsViewed(notificationId: string): Promise<boolean> {
    await db.update(interestNotifications)
      .set({ 
        status: 'viewed',
        viewedAt: new Date()
      })
      .where(eq(interestNotifications.id, notificationId));
    return true;
  }

  // Bulk upload management
  async createBulkUploadSession(session: InsertBulkUploadSession): Promise<BulkUploadSession> {
    const [newSession] = await db.insert(bulkUploadSessions).values(session).returning();
    return newSession;
  }

  async updateBulkUploadSession(id: string, updates: Partial<BulkUploadSession>): Promise<BulkUploadSession | undefined> {
    const [session] = await db.update(bulkUploadSessions)
      .set({ ...updates, completedAt: new Date() })
      .where(eq(bulkUploadSessions.id, id))
      .returning();
    return session;
  }

  async getBulkUploadSessions(collegeId: string): Promise<BulkUploadSession[]> {
    return await db.select().from(bulkUploadSessions)
      .where(eq(bulkUploadSessions.collegeId, collegeId))
      .orderBy(desc(bulkUploadSessions.createdAt));
  }

  async processBulkStudentData(sessionId: string, studentData: any[]): Promise<void> {
    const session = await db.select().from(bulkUploadSessions)
      .where(eq(bulkUploadSessions.id, sessionId));
    
    if (!session.length) throw new Error('Bulk upload session not found');

    let successCount = 0;
    let failCount = 0;
    const errors: any[] = [];
    const successes: any[] = [];

    for (const student of studentData) {
      try {
        // Validate required fields
        if (!student.email || !student.firstName || !student.lastName) {
          throw new Error('Missing required fields: email, firstName, lastName');
        }

        // Check if user already exists
        const existingUser = await this.getUserByEmail(student.email, session[0].collegeId);
        if (existingUser) {
          throw new Error(`User with email ${student.email} already exists`);
        }

        // Create new user
        const newUser = await this.createUser({
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          username: student.email.split('@')[0],
          course: student.course || '',
          year: student.year || '',
          gender: student.gender || '',
          collegeId: session[0].collegeId,
          role: 'student',
          isActive: true,
          englishLevel: 'beginner'
        });

        successes.push({ email: student.email, userId: newUser.id });
        successCount++;
      } catch (error) {
        errors.push({ 
          email: student.email, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        failCount++;
      }
    }

    // Update session with results
    await this.updateBulkUploadSession(sessionId, {
      processedRecords: studentData.length,
      successfulRecords: successCount,
      failedRecords: failCount,
      status: failCount > 0 ? 'completed' : 'completed',
      errorLog: errors,
      successLog: successes
    });
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