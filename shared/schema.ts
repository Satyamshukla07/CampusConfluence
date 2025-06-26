import { pgTable, text, serial, integer, boolean, timestamp, json, jsonb, uuid, varchar, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Colleges table for multi-tenant architecture
export const colleges = pgTable("colleges", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  domain: text("domain").notNull().unique(), // subdomain for white-labeling
  logo: text("logo"),
  primaryColor: text("primary_color").default("#3B82F6"),
  secondaryColor: text("secondary_color").default("#10B981"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced users table with roles and college association
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  collegeId: uuid("college_id").notNull(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("student"), // professor, student, moderator, master_trainer, recruiter, recruitment_coordinator, admin, super_admin
  englishLevel: text("english_level").default("beginner"), // beginner, intermediate, advanced
  cefrLevel: text("cefr_level"), // A1, A2, B1, B2, C1, C2
  careerPath: text("career_path"),
  experienceLevel: text("experience_level"), // entry, junior, mid, senior
  location: text("location"),
  practiceHours: integer("practice_hours").default(0),
  streak: integer("streak").default(0),
  speakingScore: integer("speaking_score").default(0),
  writingScore: integer("writing_score").default(0),
  readingScore: integer("reading_score").default(0),
  profilePicture: text("profile_picture"),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Practice modules table with college association
export const practiceModules = pgTable("practice_modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  collegeId: uuid("college_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // speaking, writing, reading, listening
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  cefrLevel: text("cefr_level"), // A1, A2, B1, B2, C1, C2
  duration: integer("duration").notNull(), // in minutes
  exercises: json("exercises").notNull().default('[]'), // JSON array of exercise data
  createdBy: uuid("created_by").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User progress tracking
export const userProgress = pgTable("user_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  moduleId: uuid("module_id").notNull(),
  progress: integer("progress").notNull().default(0), // percentage 0-100
  completed: boolean("completed").notNull().default(false),
  score: integer("score"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Study groups for collaboration
export const studyGroups = pgTable("study_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  collegeId: uuid("college_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // speaking, writing, general
  memberCount: integer("member_count").notNull().default(0),
  maxMembers: integer("max_members").notNull().default(20),
  isActive: boolean("is_active").notNull().default(true),
  nextSession: timestamp("next_session"),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const studyGroupMembers = pgTable("study_group_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").notNull(),
  userId: uuid("user_id").notNull(),
  role: text("role").notNull().default("member"), // admin, member
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Enhanced chat system with forums and groups
export const chatGroups = pgTable("chat_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  collegeId: uuid("college_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // central_forum, community_forum, private_group, direct_message
  category: text("category"), // general, practice, career, study_group, etc.
  creatorId: uuid("creator_id").notNull(),
  isPrivate: boolean("is_private").notNull().default(false),
  maxMembers: integer("max_members").default(100),
  memberCount: integer("member_count").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  allowFileSharing: boolean("allow_file_sharing").notNull().default(true),
  allowInvites: boolean("allow_invites").notNull().default(true),
  autoDeleteFiles: boolean("auto_delete_files").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatGroupMembers = pgTable("chat_group_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").notNull(),
  userId: uuid("user_id").notNull(),
  role: text("role").notNull().default("member"), // creator, admin, moderator, member
  joinedAt: timestamp("joined_at").defaultNow(),
  lastReadAt: timestamp("last_read_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  senderId: uuid("sender_id").notNull(),
  receiverId: uuid("receiver_id"), // null for group messages
  groupId: uuid("group_id"), // null for direct messages
  collegeId: uuid("college_id").notNull(),
  content: text("content").notNull(),
  originalContent: text("original_content"), // before grammar correction
  correctedContent: text("corrected_content"), // after grammar correction
  grammarSuggestions: json("grammar_suggestions").default('[]'), // LanguageTool suggestions
  messageType: text("message_type").notNull().default("text"), // text, image, audio, video, file, youtube_embed
  fileUrl: text("file_url"), // for media messages
  fileName: text("file_name"), // original file name
  fileSize: integer("file_size"), // in bytes
  fileMimeType: text("file_mime_type"), // MIME type
  youtubeUrl: text("youtube_url"), // extracted YouTube URL
  youtubeVideoId: text("youtube_video_id"), // extracted video ID
  expiresAt: timestamp("expires_at"), // for auto-deletion (24 hours)
  isEdited: boolean("is_edited").notNull().default(false),
  replyToId: uuid("reply_to_id"), // for threaded conversations
  isSystemMessage: boolean("is_system_message").notNull().default(false),
  sentAt: timestamp("sent_at").defaultNow(),
  readAt: timestamp("read_at"),
  deletedAt: timestamp("deleted_at"),
});

// RSS feed integration
export const rssFeeds = pgTable("rss_feeds", {
  id: uuid("id").primaryKey().defaultRandom(),
  collegeId: uuid("college_id").notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  category: text("category").notNull(), // news, blog, instagram, general
  isActive: boolean("is_active").notNull().default(true),
  isApproved: boolean("is_approved").notNull().default(false),
  lastFetchedAt: timestamp("last_fetched_at"),
  fetchInterval: integer("fetch_interval").notNull().default(3600), // seconds
  addedBy: uuid("added_by").notNull(),
  approvedBy: uuid("approved_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rssFeedItems = pgTable("rss_feed_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  feedId: uuid("feed_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  url: text("url").notNull(),
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at"),
  guid: text("guid").notNull(), // unique identifier from RSS
  isApproved: boolean("is_approved").notNull().default(true),
  discussionGroupId: uuid("discussion_group_id"), // auto-created discussion group
  likesCount: integer("likes_count").notNull().default(0),
  commentsCount: integer("comments_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced forum system
export const forumCategories = pgTable("forum_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  collegeId: uuid("college_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color").default("#0079F2"),
  order: integer("order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const forumPosts = pgTable("forum_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  collegeId: uuid("college_id").notNull(),
  categoryId: uuid("category_id"),
  groupId: uuid("group_id"), // if posted in a group forum
  authorId: uuid("author_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  originalContent: text("original_content"), // before grammar correction
  correctedContent: text("corrected_content"), // after grammar correction
  grammarSuggestions: json("grammar_suggestions").default('[]'),
  tags: json("tags").notNull().default('[]'),
  attachments: json("attachments").notNull().default('[]'), // file URLs and metadata
  likesCount: integer("likes_count").notNull().default(0),
  repliesCount: integer("replies_count").notNull().default(0),
  viewsCount: integer("views_count").notNull().default(0),
  isSticky: boolean("is_sticky").notNull().default(false),
  isLocked: boolean("is_locked").notNull().default(false),
  isPinned: boolean("is_pinned").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const forumReplies = pgTable("forum_replies", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull(),
  authorId: uuid("author_id").notNull(),
  content: text("content").notNull(),
  originalContent: text("original_content"), // before grammar correction
  correctedContent: text("corrected_content"), // after grammar correction
  grammarSuggestions: json("grammar_suggestions").default('[]'),
  attachments: json("attachments").notNull().default('[]'),
  likesCount: integer("likes_count").notNull().default(0),
  replyToId: uuid("reply_to_id"), // for nested replies
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// File management for auto-deletion
export const sharedFiles = pgTable("shared_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  collegeId: uuid("college_id").notNull(),
  uploaderId: uuid("uploader_id").notNull(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  fileType: text("file_type").notNull(), // image, audio, video, document
  isTemporary: boolean("is_temporary").notNull().default(true), // auto-delete after 24h
  expiresAt: timestamp("expires_at"),
  downloadCount: integer("download_count").notNull().default(0),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Grammar correction service logs
export const grammarCorrections = pgTable("grammar_corrections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  originalText: text("original_text").notNull(),
  correctedText: text("corrected_text"),
  suggestions: json("suggestions").notNull().default('[]'),
  language: text("language").notNull().default("en"),
  serviceUsed: text("service_used").notNull().default("languagetool"),
  processingTime: integer("processing_time"), // milliseconds
  isAccepted: boolean("is_accepted"), // did user accept the correction
  createdAt: timestamp("created_at").defaultNow(),
});

// Video resumes with comprehensive career tracking
export const videoResumes = pgTable("video_resumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"), // in seconds
  
  // Career Path Categories and Sub-Categories
  careerCategory: text("career_category").notNull(), // Technology, Finance & Management, Healthcare, Other Promising Fields, Other
  careerSubCategory: text("career_sub_category").notNull(),
  customCareerPath: text("custom_career_path"), // For "Other" category
  
  // CEFR Level assigned by Admin or Master Trainer
  cefrLevel: text("cefr_level"), // A1, A2, B1, B2, C1, C2
  cefrAssignedBy: uuid("cefr_assigned_by"), // Admin/Master Trainer who assigned the level
  cefrAssignedAt: timestamp("cefr_assigned_at"),
  
  // Video management
  version: integer("version").notNull().default(1), // Track when videos are replaced
  isActive: boolean("is_active").notNull().default(true),
  isPublic: boolean("is_public").notNull().default(true),
  
  // Analytics
  viewsCount: integer("views_count").notNull().default(0),
  recruiterViews: integer("recruiter_views").notNull().default(0),
  interestCount: integer("interest_count").notNull().default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recruiter activities tracking
export const recruiterActivities = pgTable("recruiter_activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  recruiterId: uuid("recruiter_id").notNull(),
  studentId: uuid("student_id").notNull(),
  videoResumeId: uuid("video_resume_id"),
  activityType: text("activity_type").notNull(), // viewed_profile, sent_interest, scheduled_interview, downloaded_resume
  notes: text("notes"),
  metadata: json("metadata").default('{}'), // Additional activity data
  createdAt: timestamp("created_at").defaultNow(),
});

// Interest notifications from recruiters to students
export const interestNotifications = pgTable("interest_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  recruiterId: uuid("recruiter_id").notNull(),
  studentId: uuid("student_id").notNull(),
  videoResumeId: uuid("video_resume_id").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("sent"), // sent, viewed, responded, archived
  emailSent: boolean("email_sent").notNull().default(false),
  emailSentAt: timestamp("email_sent_at"),
  viewedAt: timestamp("viewed_at"),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bulk upload sessions for student data
export const bulkUploadSessions = pgTable("bulk_upload_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  collegeId: uuid("college_id").notNull(),
  uploadedBy: uuid("uploaded_by").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  totalRecords: integer("total_records").notNull(),
  processedRecords: integer("processed_records").notNull().default(0),
  successfulRecords: integer("successful_records").notNull().default(0),
  failedRecords: integer("failed_records").notNull().default(0),
  status: text("status").notNull().default("processing"), // processing, completed, failed, cancelled
  errorLog: json("error_log").default('[]'),
  successLog: json("success_log").default('[]'),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Job postings with enhanced tracking
export const jobPostings = pgTable("job_postings", {
  id: uuid("id").primaryKey().defaultRandom(),
  collegeId: uuid("college_id").notNull(),
  recruiterId: uuid("recruiter_id").notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  salary: text("salary"),
  jobType: text("job_type").notNull(), // internship, full-time, part-time, contract
  careerPath: text("career_path").notNull(),
  experienceLevel: text("experience_level").notNull(),
  requirements: json("requirements").notNull().default('[]'),
  cefrRequirement: text("cefr_requirement"), // minimum CEFR level
  applicationCount: integer("application_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const jobApplications = pgTable("job_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull(),
  applicantId: uuid("applicant_id").notNull(),
  resumeId: uuid("resume_id"), // optional video resume
  coverLetter: text("cover_letter"),
  status: text("status").notNull().default("pending"), // pending, reviewing, interview, accepted, rejected
  recruiterNotes: text("recruiter_notes"),
  appliedAt: timestamp("applied_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recruiter actions tracking
export const recruiterActions = pgTable("recruiter_actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  recruiterId: uuid("recruiter_id").notNull(),
  actionType: text("action_type").notNull(), // job_posted, application_reviewed, interview_scheduled, etc.
  targetId: uuid("target_id"), // job id, application id, etc.
  details: json("details").notNull().default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin controls and logs
export const adminLogs = pgTable("admin_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id").notNull(),
  collegeId: uuid("college_id"),
  actionType: text("action_type").notNull(), // user_created, user_suspended, content_moderated, etc.
  targetType: text("target_type").notNull(), // user, post, group, etc.
  targetId: uuid("target_id"),
  details: json("details").notNull().default('{}'),
  createdAt: timestamp("created_at").defaultNow(),
});

// System Configuration Management for Admin Control Panel
export const systemConfigs = pgTable("system_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  configKey: varchar("config_key", { length: 100 }).unique().notNull(),
  configValue: jsonb("config_value").notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // theme, features, content, design
  isPublic: boolean("is_public").default(false),
  collegeId: uuid("college_id"), // null for global configs
  updatedBy: uuid("updated_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// CEFR Bulk Upload Sessions for Admin/Master Trainer
export const cefrBulkSessions = pgTable("cefr_bulk_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  uploadedBy: uuid("uploaded_by").notNull(),
  collegeId: uuid("college_id"),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 10 }).notNull(), // csv, xlsx
  totalRecords: integer("total_records").default(0),
  processedRecords: integer("processed_records").default(0),
  successfulRecords: integer("successful_records").default(0),
  failedRecords: integer("failed_records").default(0),
  status: varchar("status", { length: 20 }).default("pending"), // pending, processing, completed, failed
  errorLog: jsonb("error_log"),
  successLog: jsonb("success_log"),
  validationErrors: jsonb("validation_errors"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at")
});

// Analytics & Usage Tracking for Smart Reports
export const usageAnalytics = pgTable("usage_analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id"),
  collegeId: uuid("college_id").notNull(),
  sessionId: varchar("session_id", { length: 100 }),
  eventType: varchar("event_type", { length: 50 }).notNull(), // login, practice_start, video_upload, chat_message, etc
  eventData: jsonb("event_data"),
  duration: integer("duration"), // in seconds
  deviceType: varchar("device_type", { length: 20 }), // mobile, desktop, tablet
  browserInfo: varchar("browser_info", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  pageUrl: varchar("page_url", { length: 255 }),
  referrer: varchar("referrer", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow()
});

// Report Templates for Dashboard Analytics
export const reportTemplates = pgTable("report_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // usage, engagement, performance, cefr_distribution
  chartType: varchar("chart_type", { length: 30 }).notNull(), // line, bar, pie, heatmap, treemap
  dataSource: varchar("data_source", { length: 50 }).notNull(),
  query: text("query"), // SQL query template
  filters: jsonb("filters"),
  visualization: jsonb("visualization"),
  accessLevel: varchar("access_level", { length: 20 }).default("college"), // college, super_admin
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Content Moderation System with Free APIs
export const contentModerations = pgTable("content_moderations", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentType: varchar("content_type", { length: 50 }).notNull(), // post, comment, video, file, chat_message
  contentId: uuid("content_id").notNull(),
  userId: uuid("user_id"),
  moderationType: varchar("moderation_type", { length: 30 }).notNull(), // auto, manual, reported
  status: varchar("status", { length: 20 }).default("pending"), // pending, approved, rejected, flagged, escalated
  flaggedReason: varchar("flagged_reason", { length: 100 }),
  moderatorId: uuid("moderator_id"),
  moderatorNotes: text("moderator_notes"),
  autoModerationScore: real("auto_moderation_score"),
  autoModerationDetails: jsonb("auto_moderation_details"), // API response details
  reportedBy: uuid("reported_by"),
  reportReason: varchar("report_reason", { length: 100 }),
  reportDescription: text("report_description"),
  actionTaken: varchar("action_taken", { length: 50 }), // none, warning, content_removed, user_suspended
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, critical
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at")
});

// Moderation Rules Configuration
export const moderationRules = pgTable("moderation_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  ruleType: varchar("rule_type", { length: 50 }).notNull(), // keyword_filter, text_classifier, image_classifier
  category: varchar("category", { length: 50 }).notNull(), // spam, inappropriate, hate_speech, violence
  rule: jsonb("rule").notNull(), // contains keywords, patterns, or API config
  severity: varchar("severity", { length: 20 }).default("medium"), // low, medium, high, critical
  action: varchar("action", { length: 30 }).default("flag"), // flag, auto_remove, warn_user, escalate
  isActive: boolean("is_active").default(true),
  confidenceThreshold: real("confidence_threshold").default(0.7),
  createdBy: uuid("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// User Warnings & Sanctions Management
export const userWarnings = pgTable("user_warnings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  moderatorId: uuid("moderator_id").notNull(),
  warningType: varchar("warning_type", { length: 30 }).notNull(), // content_violation, behavior, spam, harassment
  reason: text("reason").notNull(),
  contentId: uuid("content_id"), // reference to flagged content
  severity: varchar("severity", { length: 20 }).default("low"), // low, medium, high, critical
  actionTaken: varchar("action_taken", { length: 50 }), // warning, content_removal, temporary_suspension, permanent_ban
  restrictionDetails: jsonb("restriction_details"), // specific restrictions applied
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  userNotified: boolean("user_notified").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Content Reports from Users
export const contentReports = pgTable("content_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentType: varchar("content_type", { length: 50 }).notNull(),
  contentId: uuid("content_id").notNull(),
  reportedBy: uuid("reported_by").notNull(),
  reportReason: varchar("report_reason", { length: 50 }).notNull(), // spam, inappropriate, harassment, fake_content
  description: text("description"),
  evidence: jsonb("evidence"), // screenshots, additional context
  status: varchar("status", { length: 20 }).default("pending"), // pending, reviewing, resolved, dismissed
  reviewedBy: uuid("reviewed_by"),
  reviewNotes: text("review_notes"),
  actionTaken: varchar("action_taken", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at")
});

// Relations
export const collegesRelations = relations(colleges, ({ many }) => ({
  users: many(users),
  practiceModules: many(practiceModules),
  studyGroups: many(studyGroups),
  chatGroups: many(chatGroups),
  chatMessages: many(chatMessages),
  forumCategories: many(forumCategories),
  forumPosts: many(forumPosts),
  jobPostings: many(jobPostings),
  rssFeeds: many(rssFeeds),
  sharedFiles: many(sharedFiles),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  college: one(colleges, {
    fields: [users.collegeId],
    references: [colleges.id],
  }),
  createdModules: many(practiceModules),
  progress: many(userProgress),
  createdGroups: many(studyGroups),
  groupMemberships: many(studyGroupMembers),
  createdChatGroups: many(chatGroups),
  chatGroupMemberships: many(chatGroupMembers),
  sentMessages: many(chatMessages, { relationName: "sender" }),
  receivedMessages: many(chatMessages, { relationName: "receiver" }),
  forumPosts: many(forumPosts),
  forumReplies: many(forumReplies),
  videoResumes: many(videoResumes),
  jobApplications: many(jobApplications),
  recruiterActions: many(recruiterActions),
  adminLogs: many(adminLogs),
  uploadedFiles: many(sharedFiles),
  grammarCorrections: many(grammarCorrections),
  addedRssFeeds: many(rssFeeds),
}));

export const practiceModulesRelations = relations(practiceModules, ({ one, many }) => ({
  college: one(colleges, {
    fields: [practiceModules.collegeId],
    references: [colleges.id],
  }),
  creator: one(users, {
    fields: [practiceModules.createdBy],
    references: [users.id],
  }),
  userProgress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  module: one(practiceModules, {
    fields: [userProgress.moduleId],
    references: [practiceModules.id],
  }),
}));

export const studyGroupsRelations = relations(studyGroups, ({ one, many }) => ({
  college: one(colleges, {
    fields: [studyGroups.collegeId],
    references: [colleges.id],
  }),
  creator: one(users, {
    fields: [studyGroups.createdBy],
    references: [users.id],
  }),
  members: many(studyGroupMembers),
  messages: many(chatMessages),
}));

export const studyGroupMembersRelations = relations(studyGroupMembers, ({ one }) => ({
  group: one(studyGroups, {
    fields: [studyGroupMembers.groupId],
    references: [studyGroups.id],
  }),
  user: one(users, {
    fields: [studyGroupMembers.userId],
    references: [users.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  college: one(colleges, {
    fields: [chatMessages.collegeId],
    references: [colleges.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [chatMessages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
  group: one(studyGroups, {
    fields: [chatMessages.groupId],
    references: [studyGroups.id],
  }),
}));

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  college: one(colleges, {
    fields: [forumPosts.collegeId],
    references: [colleges.id],
  }),
  author: one(users, {
    fields: [forumPosts.authorId],
    references: [users.id],
  }),
  replies: many(forumReplies),
}));

export const forumRepliesRelations = relations(forumReplies, ({ one }) => ({
  post: one(forumPosts, {
    fields: [forumReplies.postId],
    references: [forumPosts.id],
  }),
  author: one(users, {
    fields: [forumReplies.authorId],
    references: [users.id],
  }),
}));

export const videoResumesRelations = relations(videoResumes, ({ one, many }) => ({
  user: one(users, {
    fields: [videoResumes.userId],
    references: [users.id],
  }),
  cefrAssigner: one(users, {
    fields: [videoResumes.cefrAssignedBy],
    references: [users.id],
  }),
  recruiterActivities: many(recruiterActivities),
  interestNotifications: many(interestNotifications),
}));

export const recruiterActivitiesRelations = relations(recruiterActivities, ({ one }) => ({
  recruiter: one(users, {
    fields: [recruiterActivities.recruiterId],
    references: [users.id],
  }),
  student: one(users, {
    fields: [recruiterActivities.studentId],
    references: [users.id],
  }),
  videoResume: one(videoResumes, {
    fields: [recruiterActivities.videoResumeId],
    references: [videoResumes.id],
  }),
}));

export const interestNotificationsRelations = relations(interestNotifications, ({ one }) => ({
  recruiter: one(users, {
    fields: [interestNotifications.recruiterId],
    references: [users.id],
  }),
  student: one(users, {
    fields: [interestNotifications.studentId],
    references: [users.id],
  }),
  videoResume: one(videoResumes, {
    fields: [interestNotifications.videoResumeId],
    references: [videoResumes.id],
  }),
}));

export const bulkUploadSessionsRelations = relations(bulkUploadSessions, ({ one }) => ({
  college: one(colleges, {
    fields: [bulkUploadSessions.collegeId],
    references: [colleges.id],
  }),
  uploader: one(users, {
    fields: [bulkUploadSessions.uploadedBy],
    references: [users.id],
  }),
}));

export const jobPostingsRelations = relations(jobPostings, ({ one, many }) => ({
  college: one(colleges, {
    fields: [jobPostings.collegeId],
    references: [colleges.id],
  }),
  recruiter: one(users, {
    fields: [jobPostings.recruiterId],
    references: [users.id],
  }),
  applications: many(jobApplications),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one }) => ({
  job: one(jobPostings, {
    fields: [jobApplications.jobId],
    references: [jobPostings.id],
  }),
  applicant: one(users, {
    fields: [jobApplications.applicantId],
    references: [users.id],
  }),
  resume: one(videoResumes, {
    fields: [jobApplications.resumeId],
    references: [videoResumes.id],
  }),
}));

export const recruiterActionsRelations = relations(recruiterActions, ({ one }) => ({
  recruiter: one(users, {
    fields: [recruiterActions.recruiterId],
    references: [users.id],
  }),
}));

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminLogs.adminId],
    references: [users.id],
  }),
  college: one(colleges, {
    fields: [adminLogs.collegeId],
    references: [colleges.id],
  }),
}));

// New table relations for Admin Control Panel
export const systemConfigsRelations = relations(systemConfigs, ({ one }) => ({
  updatedBy: one(users, {
    fields: [systemConfigs.updatedBy],
    references: [users.id],
  }),
  college: one(colleges, {
    fields: [systemConfigs.collegeId],
    references: [colleges.id],
  }),
}));

export const cefrBulkSessionsRelations = relations(cefrBulkSessions, ({ one }) => ({
  uploader: one(users, {
    fields: [cefrBulkSessions.uploadedBy],
    references: [users.id],
  }),
  college: one(colleges, {
    fields: [cefrBulkSessions.collegeId],
    references: [colleges.id],
  }),
}));

export const usageAnalyticsRelations = relations(usageAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [usageAnalytics.userId],
    references: [users.id],
  }),
  college: one(colleges, {
    fields: [usageAnalytics.collegeId],
    references: [colleges.id],
  }),
}));

export const reportTemplatesRelations = relations(reportTemplates, ({ one }) => ({
  creator: one(users, {
    fields: [reportTemplates.createdBy],
    references: [users.id],
  }),
}));

export const contentModerationsRelations = relations(contentModerations, ({ one }) => ({
  user: one(users, {
    fields: [contentModerations.userId],
    references: [users.id],
  }),
  moderator: one(users, {
    fields: [contentModerations.moderatorId],
    references: [users.id],
  }),
  reporter: one(users, {
    fields: [contentModerations.reportedBy],
    references: [users.id],
  }),
}));

export const moderationRulesRelations = relations(moderationRules, ({ one }) => ({
  creator: one(users, {
    fields: [moderationRules.createdBy],
    references: [users.id],
  }),
}));

export const userWarningsRelations = relations(userWarnings, ({ one }) => ({
  user: one(users, {
    fields: [userWarnings.userId],
    references: [users.id],
  }),
  moderator: one(users, {
    fields: [userWarnings.moderatorId],
    references: [users.id],
  }),
}));

export const contentReportsRelations = relations(contentReports, ({ one }) => ({
  reporter: one(users, {
    fields: [contentReports.reportedBy],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [contentReports.reviewedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertCollegeSchema = createInsertSchema(colleges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPracticeModuleSchema = createInsertSchema(practiceModules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
});

export const insertStudyGroupSchema = createInsertSchema(studyGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  sentAt: true,
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVideoResumeSchema = createInsertSchema(videoResumes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  careerCategory: z.enum([
    "Technology",
    "Finance & Management", 
    "Healthcare",
    "Other Promising Fields",
    "Other"
  ]),
  careerSubCategory: z.string().min(1, "Sub-category is required"),
  customCareerPath: z.string().optional(),
  cefrLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
});

export const insertRecruiterActivitySchema = createInsertSchema(recruiterActivities).omit({
  id: true,
  createdAt: true,
});

export const insertInterestNotificationSchema = createInsertSchema(interestNotifications).omit({
  id: true,
  createdAt: true,
});

export const insertBulkUploadSessionSchema = createInsertSchema(bulkUploadSessions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertJobPostingSchema = createInsertSchema(jobPostings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({
  id: true,
  appliedAt: true,
  updatedAt: true,
});

// Types
export type College = typeof colleges.$inferSelect;
export type InsertCollege = z.infer<typeof insertCollegeSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PracticeModule = typeof practiceModules.$inferSelect;
export type InsertPracticeModule = z.infer<typeof insertPracticeModuleSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type StudyGroup = typeof studyGroups.$inferSelect;
export type InsertStudyGroup = z.infer<typeof insertStudyGroupSchema>;

export type StudyGroupMember = typeof studyGroupMembers.$inferSelect;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;

export type ForumReply = typeof forumReplies.$inferSelect;

export type VideoResume = typeof videoResumes.$inferSelect;
export type InsertVideoResume = z.infer<typeof insertVideoResumeSchema>;

export type RecruiterActivity = typeof recruiterActivities.$inferSelect;
export type InsertRecruiterActivity = z.infer<typeof insertRecruiterActivitySchema>;

export type InterestNotification = typeof interestNotifications.$inferSelect;
export type InsertInterestNotification = z.infer<typeof insertInterestNotificationSchema>;

export type BulkUploadSession = typeof bulkUploadSessions.$inferSelect;
export type InsertBulkUploadSession = z.infer<typeof insertBulkUploadSessionSchema>;

// Career path categories and sub-categories
export const CAREER_CATEGORIES = {
  "Technology": [
    "Engineering",
    "Software Development", 
    "Data Science",
    "Cybersecurity",
    "AI & ML",
    "Cloud Computing",
    "Game Development"
  ],
  "Finance & Management": [
    "CA",
    "CS", 
    "Investment Banking",
    "Finance Management",
    "Business Analyst",
    "Project Management",
    "HR",
    "Marketing",
    "Sales"
  ],
  "Healthcare": [
    "Medicine (MBBS, BDS)",
    "Pharmacy",
    "Nursing", 
    "Healthcare Management"
  ],
  "Other Promising Fields": [
    "Digital Marketing",
    "Animation & Multimedia",
    "Architecture",
    "Law",
    "Content Creation",
    "Civil Services",
    "Renewable Energy",
    "Teaching",
    "Research",
    "Entrepreneurship"
  ]
} as const;

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type JobPosting = typeof jobPostings.$inferSelect;
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;

export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;

export type RecruiterAction = typeof recruiterActions.$inferSelect;
export type AdminLog = typeof adminLogs.$inferSelect;
