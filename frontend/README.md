# 🚀 SocialPilot — Frontend Architecture & Developer Manual

A state-of-the-art social media scheduling, campaign management, and cross-channel analytics web application built with **Next.js 16 (App Router)**, **Turbopack**, and **Tailwind CSS 4**.

---

## 📑 Table of Contents
1. [Core Features & Modules](#-core-features--modules)
2. [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
3. [Component Architecture & UX Resilience](#-component-architecture--ux-resilience)
4. [Tech Stack & Dependencies](#-tech-stack--dependencies)
5. [Getting Started (Development)](#-getting-started-development)
6. [Production Build & Docker Deployment](#-production-build--docker-deployment)
7. [Live Demonstration Walkthrough Script](#-live-demonstration-walkthrough-script)

---

## 🎯 Core Features & Modules

### 1. ✍️ Multi-Channel Post Composer (`/posts/create`)
- **Live Social Previews**: Real-time simulated feed rendering across X (Twitter), Instagram, LinkedIn, and Facebook.
- **Dynamic Character Limit Enforcement**: Per-platform limit validation badges.
- **Media Upload Simulator**: Image and video attachment previews with remove triggers.
- **Schedule Time Picker**: Prevents scheduling in past timestamps; supports daily/weekly/monthly recurrence.
- **1-Click Hashtags**: Quick-inject tags for instant reach optimization.

### 2. 📅 Editorial Calendar (`/calendar`)
- **Dual View Engine**: Switch seamlessly between **Month Grid (42 cells)** and **Week Schedule**.
- **Platform Color-Coded Indicators**: Visual badges distinguishing Twitter, Instagram, LinkedIn, Facebook, and YouTube slots.
- **Day Inspector Panel**: Interactive side sheet detailing scheduled timestamps, status badges, and 1-click scheduling.

### 3. 📋 Publishing Queue & Pipeline (`/queue`)
- **Status Filtering**: Real-time filtering by `All`, `Scheduled`, `Published`, `Failed`, and `Cancelled`.
- **Failure Recovery**: 1-click retry trigger for failed network broadcasts.
- **Cancellation Safety**: In-place double confirmation modal before cancelling scheduled slots.

### 4. 🚀 Marketing Campaigns Hub (`/campaigns` & `/campaigns/:id`)
- **Strategy & Budget Tracking**: Budget limits, target audience tagging, and timeline progress bars.
- **Linked Post Coordination**: Assign and track scheduled posts attached to specific marketing initiatives.

### 5. 📊 Analytics & Reporting Intelligence (`/analytics` & `/reports`)
- **Interactive SVG Metric Charts**: Toggle impressions, reach, likes, comments, and clicks.
- **Audience Segmentation**: Create and manage demographic groups by interests and geo-locations.
- **Report Exports**: Download formatted CSV files or JSON performance summaries with progress feedback.

### 6. 🔗 Social Media Accounts & OAuth (`/social-accounts`)
- **Interactive Authorization**: Connect brand handles with explicit OAuth permission scope explanations.
- **Live Sync Health**: Real-time connection indicators.

---

## 👥 Role-Based Access Control (RBAC)

The application supports **4 official user roles** during signup & workspace initialization:

| Role | Badge | Permissions & Workspace Scope |
| :--- | :--- | :--- |
| **Content Creator** | ✏️ `Creator` | Create posts, save drafts, manage personal queue & calendar slots |
| **Marketing Team** | 📊 `Marketing` | Create cross-channel campaigns, oversee team schedule & analytics |
| **Business User** | 💼 `Business` | Manage social account connections, team seats, and subscription billing |
| **Administrator** | 🛡️ `Admin` | Full administrative governance over all users, content moderation, and settings |

---

## 💎 Component Architecture & UX Resilience

- **Universal Skeleton Loaders (`components/skeletons/`)**:
  - `<SkeletonCard>`: Pulsing placeholders for dashboard metrics and KPI stats.
  - `<SkeletonTable>`: Tabular skeleton for admin user and content management lists.
  - `<SkeletonChart>`: Chart placeholders for analytics and timeline performance.
  - `<SkeletonPost>`: Feed card loaders for queue and drafts.
- **Global Error Boundaries (`app/error.jsx`)**: Graceful React crash recovery with "Try Again" and dashboard redirect buttons.
- **Themed 404 Page (`app/not-found.jsx`)**: Modern missing URL fallback.
- **Interactive Empty States (`components/EmptyState.jsx`)**: Vector iconography and actionable CTAs when data lists are empty.
- **Resilient API Client (`lib/api.js`)**: Auto-redirect on 401 token expiration, network timeout safeguards, and clean human-readable error messages.

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: Next.js 16.2+ (App Router, Turbopack)
- **Styling**: Tailwind CSS 4, CSS Variables, Fluid Glassmorphism
- **HTTP Client**: Axios with unified request/response interceptors
- **Icons**: Custom SVG vector system & Lucide-style iconography
- **Theming**: System Light, Dark, Peach, and Cream palettes

---

## 🚀 Getting Started (Development)

1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Production Build & Docker Deployment

1. **Local Production Build**:
   ```bash
   npm run build
   npm start
   ```

2. **Docker Containerization**:
   ```bash
   docker build -t socialpilot-frontend .
   docker run -p 3000:3000 socialpilot-frontend
   ```

---

## 🎬 Live Demonstration Walkthrough Script

When demonstrating the platform to evaluators or stakeholders, follow this narrative:

1. **Sign Up / Login**: Register as **Content Creator** or **Administrator** to showcase dynamic navigation.
2. **Dashboard Overview**: Point out live KPI cards, quick actions, and recent activity.
3. **Multi-Channel Post Creation**: Type a post with hashtags, observe character counters, switch preview tabs across Twitter/Instagram/LinkedIn, and schedule for a future date.
4. **Calendar Planning**: Navigate to `/calendar`, toggle between Month and Week views, and inspect the scheduled post in the Day Inspector.
5. **Publishing Queue**: View the post in `/queue`, demonstrate status filter tabs, and show the empty state handling.
6. **Campaigns & Analytics**: View `/campaigns`, demonstrate audience segmentation and SVG line chart metric switching in `/analytics`, and trigger a quick CSV report download in `/reports`.
7. **Responsive Demo**: Shrink the viewport to mobile width (`<640px`) to highlight the horizontal navigation strip and responsive card conversions.
