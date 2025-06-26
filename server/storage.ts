import {
  users,
  practiceModules,
  userProgress,
  studyGroups,
  studyGroupMembers,
  jobPostings,
  applications,
  messages,
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
  type Application,
  type Message,
  type InsertMessage,
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  updateUserProgress(userId: number, scores: { speaking?: number; writing?: number; reading?: number }): Promise<User | undefined>;

  // Practice module operations
  getPracticeModules(): Promise<PracticeModule[]>;
  getPracticeModule(id: number): Promise<PracticeModule | undefined>;
  createPracticeModule(module: InsertPracticeModule): Promise<PracticeModule>;

  // User progress operations
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getUserProgressForModule(userId: number, moduleId: number): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(userId: number, moduleId: number, updates: Partial<InsertUserProgress>): Promise<UserProgress | undefined>;

  // Study group operations
  getStudyGroups(): Promise<StudyGroup[]>;
  getStudyGroup(id: number): Promise<StudyGroup | undefined>;
  createStudyGroup(group: InsertStudyGroup): Promise<StudyGroup>;
  getStudyGroupsByUser(userId: number): Promise<StudyGroup[]>;
  joinStudyGroup(groupId: number, userId: number): Promise<StudyGroupMember>;
  getStudyGroupMembers(groupId: number): Promise<StudyGroupMember[]>;

  // Job posting operations
  getJobPostings(): Promise<JobPosting[]>;
  getJobPosting(id: number): Promise<JobPosting | undefined>;
  createJobPosting(job: InsertJobPosting): Promise<JobPosting>;
  getJobPostingsByRecruiter(recruiterId: number): Promise<JobPosting[]>;

  // Application operations
  getApplications(userId: number): Promise<Application[]>;
  createApplication(jobId: number, userId: number): Promise<Application>;
  getApplicationsForJob(jobId: number): Promise<Application[]>;

  // Message operations
  getMessages(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private practiceModules: Map<number, PracticeModule>;
  private userProgress: Map<string, UserProgress>;
  private studyGroups: Map<number, StudyGroup>;
  private studyGroupMembers: Map<string, StudyGroupMember>;
  private jobPostings: Map<number, JobPosting>;
  private applications: Map<string, Application>;
  private messages: Map<number, Message>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.practiceModules = new Map();
    this.userProgress = new Map();
    this.studyGroups = new Map();
    this.studyGroupMembers = new Map();
    this.jobPostings = new Map();
    this.applications = new Map();
    this.messages = new Map();
    this.currentId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample user
    const sampleUser: User = {
      id: 1,
      username: "arjunkumar",
      email: "arjun@example.com",
      password: "password123",
      firstName: "Arjun",
      lastName: "Kumar",
      college: "Delhi University",
      userType: "student",
      englishLevel: "intermediate",
      practiceHours: 24,
      streak: 7,
      speakingScore: 78,
      writingScore: 85,
      readingScore: 92,
      profilePicture: null,
      createdAt: new Date(),
    };
    this.users.set(1, sampleUser);

    // Create sample recruiter
    const sampleRecruiter: User = {
      id: 2,
      username: "recruiter1",
      email: "recruiter@techcorp.com",
      password: "password123",
      firstName: "Sarah",
      lastName: "Johnson",
      college: null,
      userType: "recruiter",
      englishLevel: "advanced",
      practiceHours: 0,
      streak: 0,
      speakingScore: 0,
      writingScore: 0,
      readingScore: 0,
      profilePicture: null,
      createdAt: new Date(),
    };
    this.users.set(2, sampleRecruiter);

    // Create sample practice modules
    const modules = [
      {
        id: 1,
        title: "Pronunciation Practice",
        description: "Focus on vowel sounds",
        type: "speaking",
        difficulty: "intermediate",
        duration: 15,
        exercises: [
          { word: "beat", type: "pronunciation" },
          { word: "bit", type: "pronunciation" },
          { word: "bet", type: "pronunciation" },
          { word: "bat", type: "pronunciation" },
        ],
        createdAt: new Date(),
      },
      {
        id: 2,
        title: "Essay Writing",
        description: "Argumentative essays",
        type: "writing",
        difficulty: "intermediate",
        duration: 30,
        exercises: [
          { topic: "Technology in Education", type: "essay" },
          { topic: "Climate Change Solutions", type: "essay" },
        ],
        createdAt: new Date(),
      },
      {
        id: 3,
        title: "Reading Comprehension",
        description: "News articles analysis",
        type: "reading",
        difficulty: "intermediate",
        duration: 20,
        exercises: [
          { article: "Tech News Article", questions: 5 },
          { article: "Business News Article", questions: 5 },
        ],
        createdAt: new Date(),
      },
      {
        id: 4,
        title: "Conversation Practice",
        description: "Job interview scenarios",
        type: "speaking",
        difficulty: "advanced",
        duration: 20,
        exercises: [
          { scenario: "Tell me about yourself", type: "interview" },
          { scenario: "Why do you want this job?", type: "interview" },
        ],
        createdAt: new Date(),
      },
    ];

    modules.forEach(module => this.practiceModules.set(module.id, module));

    // Create sample user progress
    this.userProgress.set("1-1", {
      id: 1,
      userId: 1,
      moduleId: 1,
      progress: 40,
      completed: false,
      score: null,
      completedAt: null,
      createdAt: new Date(),
    });

    this.userProgress.set("1-3", {
      id: 2,
      userId: 1,
      moduleId: 3,
      progress: 100,
      completed: true,
      score: 92,
      completedAt: new Date(),
      createdAt: new Date(),
    });

    this.userProgress.set("1-4", {
      id: 3,
      userId: 1,
      moduleId: 4,
      progress: 60,
      completed: false,
      score: null,
      completedAt: null,
      createdAt: new Date(),
    });

    // Create sample study groups
    const groups = [
      {
        id: 1,
        name: "Business English Club",
        description: "Practice business communication",
        type: "speaking",
        memberCount: 12,
        maxMembers: 20,
        isActive: true,
        nextSession: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        createdBy: 1,
        createdAt: new Date(),
      },
      {
        id: 2,
        name: "Speaking Practice Group",
        description: "Daily speaking exercises",
        type: "speaking",
        memberCount: 8,
        maxMembers: 15,
        isActive: true,
        nextSession: new Date(Date.now() + 26 * 60 * 60 * 1000), // tomorrow
        createdBy: 1,
        createdAt: new Date(),
      },
      {
        id: 3,
        name: "Writing Workshop",
        description: "Improve your writing skills",
        type: "writing",
        memberCount: 15,
        maxMembers: 20,
        isActive: true,
        nextSession: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // next week
        createdBy: 1,
        createdAt: new Date(),
      },
    ];

    groups.forEach(group => this.studyGroups.set(group.id, group));

    // Create sample job postings
    const jobs = [
      {
        id: 1,
        title: "Content Writer Intern",
        company: "TechCorp Solutions",
        description: "Write engaging content for our tech blog",
        location: "Remote",
        salary: "₹15,000/month",
        duration: "internship",
        requirements: ["Strong English skills", "Creative writing", "Tech interest"],
        postedBy: 2,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 2,
        title: "Customer Support Trainee",
        company: "Global Services Ltd",
        description: "Handle customer queries via chat and email",
        location: "Bangalore",
        salary: "₹20,000/month",
        duration: "internship",
        requirements: ["Excellent communication", "Problem-solving", "Patience"],
        postedBy: 2,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 3,
        title: "Junior Developer",
        company: "StartupHub Inc",
        description: "Join our development team",
        location: "Mumbai",
        salary: "₹4.5 LPA",
        duration: "full-time",
        requirements: ["Programming skills", "Team collaboration", "Learning mindset"],
        postedBy: 2,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    jobs.forEach(job => this.jobPostings.set(job.id, job));

    this.currentId = 10;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserProgress(userId: number, scores: { speaking?: number; writing?: number; reading?: number }): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;

    const updatedUser = {
      ...user,
      speakingScore: scores.speaking ?? user.speakingScore,
      writingScore: scores.writing ?? user.writingScore,
      readingScore: scores.reading ?? user.readingScore,
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Practice module operations
  async getPracticeModules(): Promise<PracticeModule[]> {
    return Array.from(this.practiceModules.values());
  }

  async getPracticeModule(id: number): Promise<PracticeModule | undefined> {
    return this.practiceModules.get(id);
  }

  async createPracticeModule(insertModule: InsertPracticeModule): Promise<PracticeModule> {
    const id = this.currentId++;
    const module: PracticeModule = {
      ...insertModule,
      id,
      createdAt: new Date(),
    };
    this.practiceModules.set(id, module);
    return module;
  }

  // User progress operations
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(progress => progress.userId === userId);
  }

  async getUserProgressForModule(userId: number, moduleId: number): Promise<UserProgress | undefined> {
    return this.userProgress.get(`${userId}-${moduleId}`);
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = this.currentId++;
    const progress: UserProgress = {
      ...insertProgress,
      id,
      createdAt: new Date(),
      completedAt: null,
    };
    this.userProgress.set(`${insertProgress.userId}-${insertProgress.moduleId}`, progress);
    return progress;
  }

  async updateUserProgress(userId: number, moduleId: number, updates: Partial<InsertUserProgress>): Promise<UserProgress | undefined> {
    const key = `${userId}-${moduleId}`;
    const progress = this.userProgress.get(key);
    if (!progress) return undefined;

    const updatedProgress = {
      ...progress,
      ...updates,
      completedAt: updates.completed ? new Date() : progress.completedAt,
    };
    this.userProgress.set(key, updatedProgress);
    return updatedProgress;
  }

  // Study group operations
  async getStudyGroups(): Promise<StudyGroup[]> {
    return Array.from(this.studyGroups.values()).filter(group => group.isActive);
  }

  async getStudyGroup(id: number): Promise<StudyGroup | undefined> {
    return this.studyGroups.get(id);
  }

  async createStudyGroup(insertGroup: InsertStudyGroup): Promise<StudyGroup> {
    const id = this.currentId++;
    const group: StudyGroup = {
      ...insertGroup,
      id,
      createdAt: new Date(),
    };
    this.studyGroups.set(id, group);
    return group;
  }

  async getStudyGroupsByUser(userId: number): Promise<StudyGroup[]> {
    const memberKeys = Array.from(this.studyGroupMembers.keys()).filter(key => 
      this.studyGroupMembers.get(key)?.userId === userId
    );
    const groupIds = memberKeys.map(key => this.studyGroupMembers.get(key)?.groupId).filter(Boolean);
    return groupIds.map(id => this.studyGroups.get(id!)).filter(Boolean) as StudyGroup[];
  }

  async joinStudyGroup(groupId: number, userId: number): Promise<StudyGroupMember> {
    const id = this.currentId++;
    const member: StudyGroupMember = {
      id,
      groupId,
      userId,
      role: "member",
      joinedAt: new Date(),
    };
    this.studyGroupMembers.set(`${groupId}-${userId}`, member);

    // Update member count
    const group = this.studyGroups.get(groupId);
    if (group) {
      group.memberCount++;
      this.studyGroups.set(groupId, group);
    }

    return member;
  }

  async getStudyGroupMembers(groupId: number): Promise<StudyGroupMember[]> {
    return Array.from(this.studyGroupMembers.values()).filter(member => member.groupId === groupId);
  }

  // Job posting operations
  async getJobPostings(): Promise<JobPosting[]> {
    return Array.from(this.jobPostings.values()).filter(job => job.isActive);
  }

  async getJobPosting(id: number): Promise<JobPosting | undefined> {
    return this.jobPostings.get(id);
  }

  async createJobPosting(insertJob: InsertJobPosting): Promise<JobPosting> {
    const id = this.currentId++;
    const job: JobPosting = {
      ...insertJob,
      id,
      createdAt: new Date(),
    };
    this.jobPostings.set(id, job);
    return job;
  }

  async getJobPostingsByRecruiter(recruiterId: number): Promise<JobPosting[]> {
    return Array.from(this.jobPostings.values()).filter(job => job.postedBy === recruiterId);
  }

  // Application operations
  async getApplications(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(app => app.userId === userId);
  }

  async createApplication(jobId: number, userId: number): Promise<Application> {
    const id = this.currentId++;
    const application: Application = {
      id,
      jobId,
      userId,
      status: "pending",
      appliedAt: new Date(),
    };
    this.applications.set(`${jobId}-${userId}`, application);
    return application;
  }

  async getApplicationsForJob(jobId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(app => app.jobId === jobId);
  }

  // Message operations
  async getMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      msg => msg.senderId === userId || msg.receiverId === userId
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentId++;
    const message: Message = {
      ...insertMessage,
      id,
      sentAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      msg => (msg.senderId === user1Id && msg.receiverId === user2Id) ||
             (msg.senderId === user2Id && msg.receiverId === user1Id)
    ).sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
  }
}

export const storage = new MemStorage();
