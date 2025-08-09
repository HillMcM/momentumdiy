# Supabase Backend Setup Guide

This guide will help you set up the Supabase backend for the Client Portal App.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Docker** (for local Supabase development)
3. **Git**

## Installation Steps

### 1. Install Supabase CLI

#### Option A: Using npm (Recommended)
```bash
npm install -g supabase
```

#### Option B: Using Homebrew (macOS)
```bash
brew install supabase/tap/supabase
```

#### Option C: Manual Installation
Download from: https://github.com/supabase/cli/releases

### 2. Start Local Supabase

Navigate to the project root and start Supabase:
```bash
cd /Users/hillmcm/ClientPortalApp
supabase start
```

This will:
- Start a local PostgreSQL database
- Start the Supabase API server
- Start Supabase Studio (web interface)
- Apply the database migrations
- Seed the database with sample data

### 3. Access Supabase Services

After starting Supabase, you'll see output similar to:
```
API URL: http://127.0.0.1:54321
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
Inbucket URL: http://127.0.0.1:54324
JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Verify Setup

1. **Check Supabase Studio**: Open http://127.0.0.1:54323 in your browser
2. **Check Database**: You should see all tables created with sample data
3. **Check API**: The API should be accessible at http://127.0.0.1:54321

## Database Schema

The application uses the following main tables:

### Core Tables
- `profiles` - User profiles (extends Supabase auth)
- `projects` - Project management
- `tasks` - Task tracking
- `timeline_phases` - Project timeline phases

### Marketing Tables
- `marketing_goals` - Marketing campaign goals
- `marketing_modules` - Weekly marketing modules
- `marketing_tasks` - Individual marketing tasks

### Asset Management
- `assets` - File assets
- `asset_categories` - Asset categorization
- `branding_kits` - Branding kit collections
- `branding_kit_assets` - Junction table for kit assets
- `share_links` - Asset sharing links

### Calendar
- `calendar_events` - Calendar events and scheduling

## Frontend Integration

The frontend is already configured to connect to the local Supabase instance:

1. **Supabase Client**: `Frontend/src/lib/supabase.ts`
2. **Database Service**: `Frontend/src/services/database.ts`
3. **Data Context**: `Frontend/src/contexts/DataContext.tsx`

## Development Workflow

### Starting Development
1. Start Supabase: `supabase start`
2. Start Frontend: `cd Frontend && npm run dev`
3. Access app at: http://localhost:5173

### Database Changes
1. Create new migration: `supabase migration new migration_name`
2. Edit the migration file in `supabase/migrations/`
3. Apply migration: `supabase db reset` (or `supabase db push` for production)

### Adding Sample Data
1. Edit `supabase/seed.sql`
2. Reset database: `supabase db reset`

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Stop Supabase
   supabase stop
   
   # Check what's using the ports
   lsof -i :54321
   lsof -i :54322
   lsof -i :54323
   
   # Kill processes if needed
   kill -9 <PID>
   
   # Restart Supabase
   supabase start
   ```

2. **Database Connection Issues**
   ```bash
   # Reset database
   supabase db reset
   
   # Check logs
   supabase logs
   ```

3. **Frontend Can't Connect**
   - Verify Supabase is running: `supabase status`
   - Check the URL in `Frontend/src/lib/supabase.ts`
   - Ensure CORS is properly configured

### Useful Commands

```bash
# Check Supabase status
supabase status

# View logs
supabase logs

# Stop Supabase
supabase stop

# Reset database (applies migrations + seed)
supabase db reset

# Generate types (if using TypeScript)
supabase gen types typescript --local > types.ts

# Access database directly
supabase db reset
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

## Production Deployment

When ready for production:

1. **Create Supabase Project**: https://supabase.com/dashboard
2. **Get Production Credentials**: Project Settings > API
3. **Update Environment Variables**:
   ```env
   VITE_SUPABASE_URL=your_production_url
   VITE_SUPABASE_ANON_KEY=your_production_anon_key
   ```
4. **Deploy Migrations**: `supabase db push`

## Security Features

The database includes:
- **Row Level Security (RLS)** enabled on all tables
- **Authentication policies** for user data protection
- **Input validation** and constraints
- **Automatic timestamp updates** via triggers

## Data Flow

1. **Frontend Components** → **DataContext** → **DatabaseService** → **Supabase**
2. **Real-time updates** via Supabase subscriptions
3. **Optimistic updates** for better UX
4. **Error handling** and loading states

## Next Steps

1. **Authentication**: Implement user signup/login
2. **File Upload**: Configure Supabase Storage for assets
3. **Real-time Features**: Add live updates for collaborative features
4. **Email Integration**: Set up email notifications
5. **Analytics**: Add usage tracking and metrics

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **GitHub Issues**: Report bugs and feature requests 