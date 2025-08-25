# FormPilot SaaS - Form Builder & Workspace Management

A powerful SaaS platform for building forms and managing workspaces with automated workflows.

## 🚀 Features

- **Workspace Management**: Create and manage multiple workspaces
- **Form Builder**: Drag-and-drop form builder with advanced components
- **Real-time Analytics**: Track form submissions and performance
- **Team Collaboration**: Invite team members to collaborate on workspaces
- **Automated Workflows**: Set up triggers and actions for form submissions
- **Multi-tenant Architecture**: Secure, isolated environments for each user
- 🔐 Complete authentication system (Email/Password + Google OAuth)
- 🎨 Beautiful UI components with shadcn/ui
- 🚀 Built with Next.js 15.4.6 and React 19
- 💎 Modern design with Tailwind CSS v4
- 📱 Fully responsive design

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm
- An Appwrite account (free at [appwrite.io](https://appwrite.io))
- Google Cloud Console account (for Google OAuth)

### 1. Installation

```bash
git clone <your-repo>
cd formpilot-saas
npm install
```

### 2. Appwrite Setup

1. **Create Appwrite Project:**

   - Go to [Appwrite Console](https://cloud.appwrite.io)
   - Create a new project
   - Copy your project ID and endpoint

2. **Get API Key:**

   - Go to your project's API Keys section
   - Create a new API key with full access
   - Copy the API key (needed for database setup)

3. **Configure Authentication:**
   - Go to Auth > Settings in your Appwrite console
   - Add `http://localhost:3000` and your production domain to allowed domains
   - Enable Email/Password authentication

### 3. Google OAuth Setup

1. **Google Cloud Console:**

   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `http://localhost:3000/dashboard`
     - `https://your-domain.com/dashboard`

2. **Configure in Appwrite:**
   - Go to Auth > Settings > Google
   - Enable Google OAuth provider
   - Add your Google Client ID and Client Secret
   - Set redirect URL as provided by Appwrite

### 4. Environment Configuration

Update `.env.local` with your actual values:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_PROJECT_ID = "your-actual-project-id"
NEXT_PUBLIC_APPWRITE_PROJECT_NAME = "FormPilot"
NEXT_PUBLIC_APPWRITE_ENDPOINT = "https://fra.cloud.appwrite.io/v1"

# Database Configuration
NEXT_PUBLIC_APPWRITE_DATABASE_ID = "formpilot-database"

# Collection IDs
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID = "users"
NEXT_PUBLIC_APPWRITE_FORMS_COLLECTION_ID = "forms"
NEXT_PUBLIC_APPWRITE_SUBMISSIONS_COLLECTION_ID = "submissions"
NEXT_PUBLIC_APPWRITE_TEMPLATES_COLLECTION_ID = "templates"

# Server-side API Key for database setup (DO NOT EXPOSE IN FRONTEND)
APPWRITE_API_KEY = "your-actual-api-key"

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID = "your-google-client-id"
```

### 5. Database Setup

Run the automated database setup script:

```bash
npm run setup-db
```

This script will:

- Create the database
- Create all necessary collections (Users, Forms, Submissions, Templates)
- Set up attributes and indexes
- Configure proper permissions

### 6. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── auth/               # Authentication pages
│   ├── dashboard/          # Dashboard pages
│   ├── layout.tsx          # Root layout with AuthProvider
│   └── page.tsx            # Landing page
├── components/
│   ├── auth/               # Authentication components
│   │   ├── AuthPage.tsx    # Combined login/register page
│   │   ├── LoginForm.tsx   # Login form with Google OAuth
│   │   ├── RegisterForm.tsx # Registration form with Google OAuth
│   │   └── UserProfile.tsx # User profile display
│   └── ui/                 # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx     # Authentication context with Google OAuth
├── lib/
│   ├── appwrite.ts         # Appwrite configuration
│   ├── database.ts         # Database utilities
│   └── utils.ts            # Utility functions
├── hooks/
│   ├── use-forms.ts        # Form management hooks
│   └── use-mobile.ts       # Mobile detection hook
└── scripts/
    └── setup-database.js   # Automated database setup
```

## 🔐 Authentication Flow

The application includes a complete authentication system:

1. **Email/Password Registration & Login**
2. **Google OAuth Integration**
3. **Protected Routes** - Automatic redirect for unauthenticated users
4. **User Dashboard** - Personal workspace for authenticated users
5. **Landing Page** - Public marketing page for visitors

## 🗄️ Database Schema

The application uses the following collections:

### Users Collection

- `name` (string, required)
- `email` (email, required, unique)
- `avatar` (string, optional)
- `subscription` (enum: free/pro/enterprise, default: free)
- `credits` (integer, default: 10)
- `createdAt` (datetime)
- `updatedAt` (datetime)

### Forms Collection

- `title` (string, required)
- `description` (string, optional)
- `fields` (JSON string, required)
- `userId` (string, required)
- `isPublic` (boolean, default: false)
- `isActive` (boolean, default: true)
- `submissionCount` (integer, default: 0)
- `slug` (string, optional, unique)
- `createdAt` (datetime)
- `updatedAt` (datetime)

### Submissions Collection

- `formId` (string, required)
- `responses` (JSON string, required)
- `submitterEmail` (email, optional)
- `submitterName` (string, optional)
- `submitterIp` (IP, optional)
- `userAgent` (string, optional)
- `submittedAt` (datetime)

### Templates Collection

- `name` (string, required)
- `description` (string, optional)
- `category` (string, required)
- `fields` (JSON string, required)
- `previewImage` (string, optional)
- `tags` (string, optional)
- `difficulty` (enum: beginner/intermediate/advanced)
- `usageCount` (integer, default: 0)
- `createdAt` (datetime)
- `updatedAt` (datetime)

## 🎯 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run setup-db` - Set up Appwrite database and collections

## 🔧 Technology Stack

- **Frontend:** Next.js 15.4.6, React 19, TypeScript
- **Styling:** Tailwind CSS v4, shadcn/ui components
- **Backend:** Appwrite (Authentication, Database, Storage)
- **Authentication:** Email/Password + Google OAuth
- **State Management:** React Context API
- **Forms:** React Hook Form with Zod validation
- **Icons:** Lucide React
- **Database:** Appwrite Database with automated setup

## 📋 Next Steps

1. ✅ Complete authentication setup
2. ✅ Database schema implementation
3. 🔄 Form builder interface
4. 🔄 Form submission handling
5. 🔄 Analytics dashboard
6. 🔄 Payment integration (Stripe)
7. 🔄 Email notifications
8. 🔄 Template marketplace
9. 🔄 API endpoints
10. 🔄 Deployment configuration

## 🐛 Troubleshooting

### Database Setup Issues

- Ensure your `APPWRITE_API_KEY` has full permissions
- Check that your project ID and endpoint are correct
- Verify your Appwrite account has sufficient quotas

### Google OAuth Issues

- Verify redirect URIs in Google Cloud Console
- Check that Google OAuth is enabled in Appwrite console
- Ensure client ID matches between Google and Appwrite

### Development Issues

- Clear browser cache and cookies
- Restart the development server
- Check environment variables are loaded correctly

## 📄 License

MIT License - feel free to use this for your projects!
