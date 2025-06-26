import { pgTable, text, serial, integer, boolean, timestamp, json, uuid, varchar } from "drizzle-orm/pg-core";
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

// Chat messages between users
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  collegeId: uuid("college_id").notNull(),
  senderId: uuid("sender_id").notNull(),
  receiverId: uuid("receiver_id"),
  groupId: uuid("group_id"), // for group chats
  content: text("content").notNull(),
  messageType: text("message_type").notNull().default("text"), // text, image, video, audio
  isRead: boolean("is_read").notNull().default(false),
  sentAt: timestamp("sent_at").defaultNow(),
});

// Forum posts for discussions
export const forumPosts = pgTable("forum_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  collegeId: uuid("college_id").notNull(),
  authorId: uuid("author_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // general, practice, career, tips
  tags: json("tags").notNull().default('[]'),
  likesCount: integer("likes_count").notNull().default(0),
  repliesCount: integer("replies_count").notNull().default(0),
  isSticky: boolean("is_sticky").notNull().default(false),
  isLocked: boolean("is_locked").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const forumReplies = pgTable("forum_replies", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull(),
  authorId: uuid("author_id").notNull(),
  content: text("content").notNull(),
  likesCount: integer("likes_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Video resumes with career tracking
export const videoResumes = pgTable("video_resumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"), // in seconds
  careerPath: text("career_path").notNull(),
  experienceLevel: text("experience_level").notNull(),
  location: text("location"),
  cefrTags: json("cefr_tags").notNull().default('[]'), // A1, A2, B1, B2, C1, C2
  skillTags: json("skill_tags").notNull().default('[]'),
  isPublic: boolean("is_public").notNull().default(true),
  viewsCount: integer("views_count").notNull().default(0),
  likesCount: integer("likes_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Relations
export const collegesRelations = relations(colleges, ({ many }) => ({
  users: many(users),
  practiceModules: many(practiceModules),
  studyGroups: many(studyGroups),
  chatMessages: many(chatMessages),
  forumPosts: many(forumPosts),
  jobPostings: many(jobPostings),
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
  sentMessages: many(chatMessages, { relationName: "sender" }),
  receivedMessages: many(chatMessages, { relationName: "receiver" }),
  forumPosts: many(forumPosts),
  forumReplies: many(forumReplies),
  videoResumes: many(videoResumes),
  jobApplications: many(jobApplications),
  recruiterActions: many(recruiterActions),
  adminLogs: many(adminLogs),
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

export const videoResumesRelations = relations(videoResumes, ({ one }) => ({
  user: one(users, {
    fields: [videoResumes.userId],
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

export type JobPosting = typeof jobPostings.$inferSelect;
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;

export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;

export type RecruiterAction = typeof recruiterActions.$inferSelect;
export type AdminLog = typeof adminLogs.$inferSelect;
