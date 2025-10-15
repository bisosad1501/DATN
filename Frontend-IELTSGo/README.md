# IELTSGo - IELTS Learning Platform

A comprehensive IELTS learning platform built with Next.js 14, TypeScript, and TailwindCSS.

## Features

### For Students
- 🎓 **Expert Courses** - Learn from comprehensive courses designed by IELTS experts
- 🎯 **Practice Exercises** - Master all four skills with targeted practice exercises
- 📊 **Progress Tracking** - Monitor your improvement with detailed analytics
- 🏆 **Leaderboard** - Compete and learn with thousands of students worldwide
- 🔔 **Smart Notifications** - Stay updated with your learning progress

### For Instructors
- 📚 **Course Management** - Create and manage courses with curriculum builder
- ✍️ **Exercise Creation** - Build exercises with multiple question types
- 👨‍🎓 **Student Management** - Track student progress and provide feedback
- 💬 **Communication** - Message students and send announcements

### For Admins
- 👥 **User Management** - Manage users with CRUD operations
- 📝 **Content Moderation** - Review and approve content
- 📈 **Analytics Dashboard** - Comprehensive system analytics
- 🔔 **Notification Center** - Bulk send notifications with templates
- ⚙️ **System Settings** - Configure system settings and monitor health

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS v4
- **UI Components:** Shadcn/UI
- **Charts:** Recharts
- **HTTP Client:** Axios
- **Icons:** Lucide React

## Brand Colors

- **Primary Red:** #ED372A (Main brand color)
- **Secondary Dark:** #101615 (Text and dark elements)
- **Accent Cream:** #FEF7EC (Backgrounds and highlights)
- **Dark Red:** #B92819 (Shadows and depth)

## Getting Started

### Prerequisites
- **Node.js 18+** (recommended: 20.x LTS)
- **pnpm** (recommended) or npm/yarn
- **Backend services running** on `http://localhost:8080`

### Quick Setup (Recommended)

Run the automated setup script:

\`\`\`bash
cd Frontend-IELTSGo
./setup-frontend.sh
\`\`\`

The script will:
- ✅ Check Node.js version
- ✅ Detect and use the correct package manager (pnpm/npm/yarn)
- ✅ Create `.env.local` from example
- ✅ Install all dependencies
- ✅ Check backend connection
- ✅ Display next steps

### Manual Setup

If you prefer manual setup:

1. **Install dependencies:**
\`\`\`bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
\`\`\`

2. **Setup environment variables:**
\`\`\`bash
# Copy the example file
cp .env.local.example .env.local

# Edit the file with your configuration
nano .env.local
\`\`\`

Required variables:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_API_GATEWAY=http://localhost:8080
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

3. **Start backend services:**
\`\`\`bash
# In the root directory
cd ..
make dev
\`\`\`

4. **Run the development server:**
\`\`\`bash
# Using pnpm
pnpm dev

# Or using npm
npm run dev

# Or using yarn
yarn dev
\`\`\`

5. **Open your browser:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8080](http://localhost:8080)

### Team Members Setup

When cloning the repository:

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd DATN

# Setup frontend
cd Frontend-IELTSGo
./setup-frontend.sh

# Follow the instructions displayed by the script
\`\`\`

### Troubleshooting

**Backend not running:**
\`\`\`bash
cd .. && make dev
\`\`\`

**Port 3000 already in use:**
\`\`\`bash
# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 pnpm dev
\`\`\`

**Dependencies installation fails:**
\`\`\`bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
\`\`\`

**Environment variables not loaded:**
\`\`\`bash
# Make sure .env.local exists
ls -la .env.local

# Restart the dev server
pnpm dev
\`\`\`

## Project Structure

\`\`\`
/app
  /(public)              # Public pages (landing, login, register)
  /dashboard             # Student dashboard
  /courses               # Course browsing and learning
  /exercises             # Exercise practice
  /progress              # Progress tracking
  /admin                 # Admin dashboard (role-protected)
  /instructor            # Instructor dashboard (role-protected)
/components
  /ui                    # Shadcn UI components
  /layout                # Layout components (navbar, sidebar, footer)
  /admin                 # Admin-specific components
  /instructor            # Instructor-specific components
  /courses               # Course-related components
  /exercises             # Exercise-related components
  /dashboard             # Dashboard components
  /notifications         # Notification components
  /auth                  # Authentication components
/lib
  /api                   # API client and services
    - apiClient.ts       # Axios instance with interceptors
    - auth.ts            # Authentication API
    - courses.ts         # Courses API
    - exercises.ts       # Exercises API
    - progress.ts        # Progress tracking API
    - notifications.ts   # Notifications API
    - admin.ts           # Admin API
    - instructor.ts      # Instructor API
  /contexts              # React contexts
    - auth-context.tsx   # Authentication context
  /hooks                 # Custom React hooks
  /utils                 # Utility functions
  /constants             # Constants and configuration
/types
  - index.ts             # Core type definitions
  - admin.ts             # Admin-specific types
\`\`\`

## Architecture

IELTSGo follows a **Layered Architecture** pattern:

1. **Presentation Layer** - React components and UI
2. **Business Logic Layer** - Contexts, hooks, and validation
3. **Service Layer** - API services and HTTP client
4. **Data Layer** - TypeScript types and interfaces

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.

## Key Features Implementation

### Authentication & Authorization
- JWT-based authentication with token refresh
- Role-based access control (Student, Instructor, Admin)
- Protected routes with `ProtectedRoute` and `RoleProtectedRoute` components

### Course Learning System
- Course browsing with filters and search
- Video lesson player with progress tracking
- Note-taking and bookmarking
- Curriculum with modules and lessons

### Exercise System
- Multiple question types (multiple choice, fill-in-blank, essay)
- Timer and progress tracking
- Instant feedback and detailed results
- Score calculation and analytics

### Progress Tracking
- Real-time progress updates
- Skill-based analytics (Listening, Reading, Writing, Speaking)
- Study time tracking
- Activity timeline

### Admin Dashboard
- User management with CRUD operations
- Content moderation queue
- System analytics and reports
- Notification center with bulk send
- System health monitoring

### Instructor Dashboard
- Course creation and management
- Exercise builder with question bank
- Student progress tracking
- Messaging and announcements

## Development Status

### ✅ Completed Layers

#### Student Features
- [x] Layer 1: Foundation & Setup
- [x] Layer 2: Authentication & User Management
- [x] Layer 3: Course Learning System
- [x] Layer 4: Exercise & Practice System
- [x] Layer 5: Progress Tracking & Dashboard
- [x] Layer 6: Notifications & Social Features

#### Admin Features
- [x] Layer 1: Admin Layout & Navigation
- [x] Layer 2: Dashboard Overview
- [x] Layer 3: User Management
- [x] Layer 4: Content Management
- [x] Layer 5: Analytics & Reports
- [x] Layer 6: Notification Center
- [x] Layer 7: System Settings & Monitoring

#### Instructor Features
- [x] Layer 1: Instructor Layout & Navigation
- [x] Layer 2: Dashboard Overview
- [x] Layer 3: Course Management
- [x] Layer 4: Exercise Management
- [x] Layer 5: Student Management
- [x] Layer 6: Communication & Feedback

## API Integration

The application expects a REST API with the following endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token

### Courses
- `GET /courses` - List courses with filters
- `GET /courses/:id` - Get course details
- `POST /courses/:id/enroll` - Enroll in course
- `GET /courses/:id/lessons` - Get course lessons

### Exercises
- `GET /exercises` - List exercises with filters
- `GET /exercises/:id` - Get exercise details
- `POST /exercises/:id/submit` - Submit exercise answers
- `GET /exercises/:exerciseId/results/:resultId` - Get exercise results

### Progress
- `GET /progress/overview` - Get user progress overview
- `GET /progress/analytics` - Get detailed analytics
- `GET /progress/activities` - Get activity history

See API documentation for complete endpoint list.

## Contributing

This is a private project. Contact the development team for contribution guidelines.

## License

Private - All rights reserved

## Support

For issues or questions, please contact the development team.
