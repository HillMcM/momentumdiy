# Client Portal Backend API

A comprehensive Node.js/Express backend API for the Client Portal application, built with TypeScript and integrated with Supabase.

## Features

- **Task Management**: Full CRUD operations for tasks with status tracking
- **Project Management**: Project creation, updates, and timeline management
- **Marketing Goals**: Marketing campaign management with modules and tasks
- **Calendar Events**: Event scheduling and management
- **RESTful API**: Clean, consistent API design
- **TypeScript**: Full type safety and better development experience
- **Supabase Integration**: PostgreSQL database with real-time capabilities
- **Security**: Rate limiting, CORS, and input validation
- **Error Handling**: Comprehensive error handling and logging

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (ready for implementation)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan
- **Compression**: Compression middleware

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase CLI (for local development)
- Docker (for local Supabase)

## Installation

1. **Clone the repository and navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   SUPABASE_URL=http://127.0.0.1:54321
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start Supabase (if not already running)**
   ```bash
   cd ../
   supabase start
   ```

## Development

### Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:3001`

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

## API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update task status
- `PATCH /api/tasks/:id/time-spent` - Update time spent
- `GET /api/tasks/project/:projectId` - Get tasks by project

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/timeline` - Get project timeline
- `POST /api/projects/:id/timeline` - Create timeline phase
- `PATCH /api/projects/:id/progress` - Update project progress

### Marketing
- `GET /api/marketing/goals` - Get all marketing goals
- `GET /api/marketing/goals/active` - Get active marketing goal
- `GET /api/marketing/goals/:id` - Get goal by ID
- `POST /api/marketing/goals` - Create new goal
- `PUT /api/marketing/goals/:id` - Update goal
- `PATCH /api/marketing/goals/:id/activate` - Activate goal
- `GET /api/marketing/goals/:id/modules` - Get goal modules
- `POST /api/marketing/goals/:id/modules` - Create module
- `GET /api/marketing/modules/:id/tasks` - Get module tasks
- `POST /api/marketing/modules/:id/tasks` - Create task
- `PATCH /api/marketing/tasks/:id/completion` - Update task completion

### Calendar
- `GET /api/calendar/events` - Get all events
- `GET /api/calendar/events/:id` - Get event by ID
- `POST /api/calendar/events` - Create new event
- `PUT /api/calendar/events/:id` - Update event
- `DELETE /api/calendar/events/:id` - Delete event
- `GET /api/calendar/events/date-range` - Get events by date range
- `GET /api/calendar/events/type/:type` - Get events by type
- `GET /api/calendar/events/category/:category` - Get events by category
- `GET /api/calendar/events/reference/:refId` - Get events by reference

### Health Check
- `GET /health` - Server health status
- `GET /` - API documentation

## Data Models

### Task
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  responsible: string;
  deadline: Date | null;
  project: string;
  timeSpent: string;
  notifications: boolean;
  status: 'todo' | 'in-progress' | 'completed';
  projectId?: string;
  marketingTrack?: {
    goalId: string;
    moduleId: string;
    marketingTaskId: string;
  };
}
```

### Project
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  deadline: Date | null;
  tasks: string[];
  progress: number;
  status: 'active' | 'completed';
  timeline: TimelinePhase[];
}
```

### Marketing Goal
```typescript
interface MarketingGoal {
  id: string;
  title: string;
  description: string;
  industry: string;
  duration: number;
  modules: MarketingModule[];
  isActive: boolean;
  startDate?: Date;
  currentWeek: number;
  progress: number;
  weekStartDates?: Date[];
  lastWeekAdvancement?: Date;
}
```

### Calendar Event
```typescript
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end?: string;
  type: 'task' | 'project' | 'custom';
  refId?: string;
  category?: EventCategory;
}
```

## Error Handling

All API responses follow a consistent format:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `SUPABASE_URL` | Supabase URL | `http://127.0.0.1:54321` |
| `SUPABASE_ANON_KEY` | Supabase anon key | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | - |
| `CORS_ORIGIN` | CORS origin | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit max requests | `100` |

## Development Workflow

1. **Start Supabase**: `supabase start`
2. **Start Backend**: `npm run dev`
3. **Start Frontend**: `cd ../Frontend && npm run dev`
4. **Test API**: Use the health check endpoint or API documentation

## Testing

```bash
npm test
```

## Linting

```bash
npm run lint
npm run lint:fix
```

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```env
   NODE_ENV=production
   SUPABASE_URL=your_production_supabase_url
   SUPABASE_ANON_KEY=your_production_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
   ```

3. **Start the server**
   ```bash
   npm start
   ```

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write comprehensive tests
5. Update documentation

## License

MIT 