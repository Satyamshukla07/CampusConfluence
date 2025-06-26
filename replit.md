# Campus Yuva - English Learning Platform

## Overview

Campus Yuva is a comprehensive English learning platform designed specifically for Indian college students to improve their English proficiency and career prospects. The platform combines language practice modules, collaborative study groups, job opportunities, and community features to create a holistic learning environment.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state and React hooks for local state
- **UI Components**: Radix UI primitives wrapped in custom shadcn/ui components

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Development Mode**: Development server with hot module replacement via Vite integration

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Type-safe database schema definitions shared between client and server
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### User Management System
- User registration and authentication
- Profile management with college information
- English proficiency level tracking
- Progress tracking with scores for speaking, writing, and reading
- Streak and practice hour counters

### Practice Module System
- Interactive learning modules for different English skills (speaking, writing, reading, listening)
- Difficulty-based content (beginner, intermediate, advanced)
- JSON-based exercise storage for flexible content structure
- Progress tracking per module with completion status and scores

### Study Groups Feature
- Collaborative learning groups based on skill focus
- Group creation and management
- Member participation tracking
- Type-based categorization (speaking, writing, general)

### Job Board Integration
- Job posting management for recruiters
- Application tracking system
- Skill matching between students and job requirements
- College-based filtering and targeting

### Community Platform
- Social feed for student interactions
- Achievement sharing and motivation
- Question and answer system
- Study tips and resource sharing

### Real-time Practice Features
- Audio recording capabilities for speaking practice
- Interactive exercise sessions
- Progress tracking during practice sessions
- Modal-based practice interface

## Data Flow

### Authentication Flow
1. User registration with college and proficiency level information
2. Login verification with email/password
3. Session management (currently simplified, ready for proper session handling)

### Practice Flow
1. User selects practice module based on skill type and difficulty
2. Interactive exercises loaded from JSON-based content
3. Progress tracked and updated in real-time
4. Scores calculated and stored for analytics

### Study Group Flow
1. Users can browse available study groups
2. Join groups based on interest and skill focus
3. Participate in group activities and discussions
4. Track group progress and individual contributions

### Job Application Flow
1. Students browse job postings with skill matching
2. Apply to relevant positions
3. Recruiters manage applications and candidate communication
4. Progress tracking for application status

## External Dependencies

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless UI primitives for accessibility
- **Lucide React**: Icon library for consistent iconography
- **class-variance-authority**: For component variant management

### State Management and Data Fetching
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation for type safety

### Development Tools
- **TypeScript**: Type safety across the entire application
- **Vite**: Fast build tool with HMR support
- **ESBuild**: Fast bundling for production builds
- **Drizzle Kit**: Database schema management and migrations

### Database and Backend
- **PostgreSQL**: Primary database with ACID compliance
- **Neon Database**: Serverless PostgreSQL provider
- **Express.js**: Web framework for API endpoints
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Hot Module Replacement**: Vite-powered development server
- **Database**: PostgreSQL module configured in Replit
- **Port Configuration**: Development server on port 5000

### Production Build
- **Build Process**: Vite builds client-side assets, ESBuild bundles server
- **Static Assets**: Client built to `dist/public` directory
- **Server Bundle**: Server code bundled for Node.js execution
- **Environment Variables**: DATABASE_URL required for database connection

### Deployment Configuration
- **Target**: Autoscale deployment on Replit
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Health Check**: Waits for port 5000 in development

## Changelog

```
Changelog:
- June 26, 2025: Initial setup with React frontend and Express backend
- June 26, 2025: Successfully migrated from in-memory storage to PostgreSQL database
- June 26, 2025: Implemented multi-college architecture with UUID-based identification
- June 26, 2025: Database seeded with Delhi University and sample users (student and recruiter roles)
- June 26, 2025: All features now working with persistent PostgreSQL storage
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```