# FireEntity Movie Nights

A Next.js application for organizing movie nights with voting and scheduling features.

## Features

- **User Authentication**: Sign in with Slack
- **Movie Suggestions**: Users can suggest movies for movie nights
- **Voting System**: Vote for your favorite suggested movies
- **Admin Panel**: Approve movie suggestions and schedule movies
- **Calendar View**: See what movies are scheduled for which dates
- **Responsive Design**: Works on desktop and mobile

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Slack app for authentication

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fireentity-movienights
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Copy `.env.example` to `.env.local` and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

4. **Database Setup**
   ```bash
   # Run migrations
   npx prisma migrate dev
   
   # Generate Prisma client
   npx prisma generate
   ```

5. **Slack App Configuration**
   - Go to https://api.slack.com/apps
   - Create a new app for your workspace
   - Add OAuth redirect URL: `http://localhost:3000/api/auth/callback/slack`
   - Copy Client ID and Secret to your `.env.local`

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Visit the application**
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Access

To make a user an admin:
1. Sign in with the user account
2. Manually update the database to set `isAdmin = true` for that user
3. Or use Prisma Studio: `npx prisma studio`

## Project Structure

```
src/
├── app/
│   ├── admin/           # Admin dashboard
│   ├── api/            # API routes
│   ├── suggest/        # Movie suggestion page
│   └── page.tsx        # Home page with calendar and voting
├── components/
│   ├── ui/             # Reusable UI components
│   └── MovieCalendar.tsx
├── lib/
│   ├── auth.ts         # Authentication configuration
│   └── utils.ts
└── prisma/
    └── schema.prisma   # Database schema
```

## API Endpoints

- `GET /api/movies` - Get approved movies
- `POST /api/movies` - Suggest a new movie
- `POST /api/movies/[id]/vote` - Vote for a movie
- `GET /api/admin/movies` - Get unapproved movies (admin only)
- `POST /api/admin/movies/[id]/approve` - Approve a movie (admin only)
- `GET /api/admin/schedule` - Get movie schedule
- `POST /api/admin/schedule` - Schedule a movie (admin only)
- `DELETE /api/admin/schedule` - Remove scheduled movie (admin only)

## Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: Better Auth with Slack OAuth
- **UI Components**: Custom components with Tailwind
- **Calendar**: React Calendar

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
