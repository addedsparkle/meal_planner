# Meal Planner - Architecture Documentation

## Overview

This document describes the architecture, technology choices, and design decisions for the Meal Planner application, optimized for deployment on Raspberry Pi.

---

## Design Constraints

The architecture was designed with the following constraints:

1. **Raspberry Pi Deployment** - Must run efficiently on limited resources (1-2GB RAM)
2. **Native System Service** - Deployed as systemd service, not containerized
3. **Modern API Framework** - Auto-generated OpenAPI documentation
4. **No Authentication** - Private network deployment only
5. **Extensible Schema** - Easy to add features without major refactoring
6. **Simple CSV Import** - Bootstrap initial recipe database from file

---

## Technology Stack

### Backend

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Runtime | Node.js 20+ | Lightweight, shared language with frontend, excellent Pi performance |
| Framework | Fastify | 2-3x faster than Express, built-in OpenAPI support, low memory footprint |
| Database | SQLite | Single-file database, no separate service, perfect for Pi deployment |
| ORM | Drizzle ORM | Lightweight, excellent TypeScript support, flexible migrations |
| Validation | Zod | Type-safe validation, integrates with Fastify schemas |
| API Docs | @fastify/swagger | Auto-generates OpenAPI 3.0 from route schemas |
| CSV Parsing | csv-parse | Mature, streaming parser for large files |

### Frontend

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | React 19 | Modern, familiar, excellent ecosystem |
| Build Tool | Vite + SWC | Fast builds, HMR, optimized for production |
| Language | TypeScript | Type safety end-to-end |
| Styling | Tailwind CSS | Utility-first, small bundle, no runtime |
| State Management | TanStack Query | Best-in-class server state management |
| Routing | TanStack Router | Type-safe routing with code splitting |
| Forms | react-hook-form + Zod | Performant forms with schema validation |
| HTTP Client | fetch API | Native, no extra dependencies |
| Date Handling | date-fns | Lightweight, tree-shakeable |
| Icons | lucide-react | Modern icon set, tree-shakeable |

### Deployment

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Process Manager | systemd | Native Linux service management |
| Web Server | Nginx | Serves static files, reverse proxy for API |
| Build | Multi-stage NPM workspaces | Monorepo with shared tooling |
| Distribution | Shell scripts + tarball | Simple installation without Docker overhead |

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Raspberry Pi                        │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │              Nginx (Port 80)                   │ │
│  │  - Serves frontend static files                │ │
│  │  - Reverse proxies /api to backend             │ │
│  └────────┬────────────────────────┬───────────────┘ │
│           │                        │                  │
│  ┌────────▼─────────┐   ┌──────────▼──────────────┐ │
│  │  Frontend        │   │  Backend API            │ │
│  │  (Static Files)  │   │  (Node.js/Fastify)      │ │
│  │                  │   │  Port: 3000             │ │
│  │  - React SPA     │   │  - REST API             │ │
│  │  - Tailwind CSS  │   │  - OpenAPI docs at /docs│ │
│  └──────────────────┘   └──────────┬──────────────┘ │
│                                    │                  │
│                         ┌──────────▼──────────────┐  │
│                         │  SQLite Database        │  │
│                         │  /opt/meal-planner/data │  │
│                         │  meal_planner.db        │  │
│                         └─────────────────────────┘  │
│                                                      │
│  Managed by systemd:                                │
│  - meal-planner-api.service                         │
│  - Auto-restart on failure                          │
│  - Logs to journald                                 │
└─────────────────────────────────────────────────────┘
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│   recipes   │
│─────────────│
│ id (PK)     │
│ name        │
│ description │
│ servings    │
│ prep_time   │
│ cook_time   │
│ instructions│
│ metadata    │ (JSONB for extensibility)
│ created_at  │
│ updated_at  │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────────┐
│ recipe_ingredients  │
│─────────────────────│
│ id (PK)             │
│ recipe_id (FK)      │───┐
│ ingredient_id (FK)  │   │
│ quantity            │   │
│ notes               │   │
└──────┬──────────────┘   │
       │                  │
       │ N:1              │ N:1
       │                  │
┌──────▼──────┐    ┌──────▼─────────┐
│ ingredients │    │  meal_plans    │
│─────────────│    │────────────────│
│ id (PK)     │    │ id (PK)        │
│ name        │    │ name           │
│ category    │    │ start_date     │
│ created_at  │    │ end_date       │
└─────────────┘    │ created_at     │
                   └──────┬─────────┘
                          │
                          │ 1:N
                          │
                  ┌───────▼──────────┐
                  │ meal_plan_days   │
                  │──────────────────│
                  │ id (PK)          │
                  │ meal_plan_id(FK) │
                  │ day_date         │
                  │ recipe_id (FK)   │
                  │ meal_type        │
                  └──────────────────┘
```

### Key Design Decisions

1. **Normalized Ingredients** - Separate `ingredients` table prevents duplication and enables future features (categorization, search, nutrition lookup)

2. **Flexible Quantities** - Stored as text (`"2 cups"`, `"500g"`) for flexibility. Can be structured later if needed.

3. **JSONB Metadata** - Escape hatch for ad-hoc data without schema changes (tags, source URLs, photos, etc.)

4. **Many-to-Many with Junction** - `recipe_ingredients` allows same ingredient in multiple recipes with different quantities

5. **Meal Plan Flexibility** - `meal_type` field allows future expansion to breakfast/lunch/dinner

---

## API Design

### REST Endpoints

All endpoints follow RESTful conventions:

```
/api/recipes
  GET    /          List all (with optional filters)
  POST   /          Create new
  GET    /:id       Get single with ingredients
  PUT    /:id       Update
  DELETE /:id       Delete
  POST   /import    CSV bulk import

/api/ingredients
  GET    /          List all
  POST   /          Create
  PUT    /:id       Update
  DELETE /:id       Delete (only if unused)

/api/meal-plans
  GET    /          List all
  POST   /          Create
  GET    /:id       Get with days and recipes
  PUT    /:id       Update
  DELETE /:id       Delete
  POST   /generate  Auto-generate from recipes

/api/shopping-list
  GET    /          Generate from meal plan(s)
                    Query param: ?mealPlanId=1,2,3
```

### Response Format

All responses follow consistent structure:

```typescript
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [...]
  }
}
```

### OpenAPI Documentation

- Auto-generated from Zod schemas
- Available at `/docs` (Swagger UI)
- JSON spec at `/docs/json`
- Try-it-out functionality enabled

---

## Frontend Architecture

### State Management Strategy

```
┌─────────────────────────────────────────────────┐
│              Frontend State                     │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │   Server State (TanStack Query)           │ │
│  │   - Recipes                               │ │
│  │   - Meal Plans                            │ │
│  │   - Ingredients                           │ │
│  │   - Shopping Lists                        │ │
│  │   - Auto caching & invalidation           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │   UI State (useState/useReducer)          │ │
│  │   - Modal open/closed                     │ │
│  │   - Form state                            │ │
│  │   - Filters & search                      │ │
│  │   - Temporary selections                  │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  No global state library needed               │
└─────────────────────────────────────────────────┘
```

### Component Structure

```
/components
  /ui            Base components (Button, Input, Modal)
  /recipes       Recipe-specific components
  /meal-plans    Meal plan components
  /shopping      Shopping list components

/hooks           Custom hooks wrapping TanStack Query
/lib             Utilities (API client, types)
/pages           Page components (one per route)
```

### Data Flow

```
User Action
    │
    ▼
Component Event Handler
    │
    ▼
TanStack Query Mutation
    │
    ▼
API Call (fetch)
    │
    ▼
Backend API
    │
    ▼
Database Update
    │
    ▼
Response
    │
    ▼
Query Cache Invalidation
    │
    ▼
Auto Re-fetch
    │
    ▼
UI Update
```

---

## Deployment Architecture

### File System Layout

```
/opt/meal-planner/
├── backend/
│   ├── dist/              # Compiled JavaScript
│   ├── node_modules/      # Dependencies
│   └── package.json
├── frontend/              # Built static files
│   ├── index.html
│   ├── assets/
│   └── ...
└── data/
    └── meal_planner.db    # SQLite database

/etc/systemd/system/
└── meal-planner-api.service

/etc/nginx/sites-available/
└── meal-planner

/var/log/
└── (journald logs)
```

### Service Management

**Start/Stop:**
```bash
sudo systemctl start meal-planner-api
sudo systemctl stop meal-planner-api
sudo systemctl restart meal-planner-api
```

**Logs:**
```bash
sudo journalctl -u meal-planner-api -f
```

**Auto-start on boot:**
```bash
sudo systemctl enable meal-planner-api
```

### Update Process

1. Build new version on development machine
2. Package with `npm run package`
3. SCP tarball to Pi
4. Run `sudo ./scripts/update.sh`
5. Service automatically restarts with new code

---

## Security Considerations

### Private Network Only

- **No authentication** - Service accessible to anyone on local network
- **No HTTPS** - Plain HTTP only (assume trusted network)
- **No rate limiting** - Single-user or small household use
- **Input validation** - All inputs validated with Zod schemas
- **SQL injection** - Protected by Drizzle ORM parameterized queries
- **XSS protection** - React auto-escapes by default

### Future Auth Considerations

If deploying outside private network, add:
- Basic auth with bcrypt password hashing
- HTTPS with Let's Encrypt
- Rate limiting with @fastify/rate-limit
- CSRF protection
- Session management

---

## Performance Considerations

### Backend Optimization

- **Connection pooling** - Single SQLite connection (read-write lock handled by SQLite)
- **Query optimization** - Indexes on foreign keys, frequently queried columns
- **Caching** - TanStack Query handles client-side caching
- **Pagination** - Implement for recipe/meal plan lists if data grows large

### Frontend Optimization

- **Code splitting** - Lazy load routes with TanStack Router
- **Bundle size** - Target <500KB gzipped
- **Tree shaking** - Vite automatically removes unused code
- **Asset optimization** - Images optimized, lazy loaded
- **Memoization** - React.memo for expensive components

### Raspberry Pi Specific

- **Memory usage** - Target <150MB for backend process
- **CPU usage** - Keep idle CPU <5%
- **Disk I/O** - SQLite WAL mode for better concurrent access
- **Startup time** - Target <3 seconds for service start

---

## Extensibility Strategy

### Adding New Features

The architecture supports easy extension through:

1. **Database Migrations**
   - Drizzle Kit generates migrations from schema changes
   - Run `npm run migrate` to apply

2. **API Endpoints**
   - Add new route file in `/backend/src/routes/`
   - Register in main server file
   - Schemas automatically generate OpenAPI docs

3. **Frontend Components**
   - Add components in feature-specific directories
   - Create custom hooks for new data
   - TanStack Query handles caching

4. **Metadata Field**
   - Use JSONB `metadata` column for experimental features
   - Migrate to proper columns when stable

### Planned Extensions

**Phase 2:**
- Recipe search and filtering
- Meal plan templates
- Ingredient categories
- Recipe tags (vegetarian, gluten-free, etc.)

**Phase 3:**
- Recipe ratings and favorites
- Nutritional information
- Photo uploads
- Multi-meal support (breakfast/lunch/dinner)
- Weekly plan templates

---

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start both backend and frontend in dev mode
npm run dev

# Backend runs on http://localhost:3000
# Frontend runs on http://localhost:5173
# Vite proxies /api to backend
```

### Building for Production

```bash
# Build both projects
npm run build

# Package for distribution
npm run package

# Creates: meal-planner-<version>.tar.gz
```

### Database Migrations

```bash
# Generate migration from schema changes
npm run generate:migration

# Apply migrations
npm run migrate

# View current schema
npm run db:studio
```

### Testing

```bash
# Run backend tests
npm run test -w backend

# Run frontend tests
npm run test -w frontend
```

---

## Monitoring & Maintenance

### Logs

All logs go to systemd journal:
```bash
# View all logs
sudo journalctl -u meal-planner-api

# Follow logs in real-time
sudo journalctl -u meal-planner-api -f

# View last 100 lines
sudo journalctl -u meal-planner-api -n 100
```

### Database Backups

Manual backup:
```bash
sudo cp /opt/meal-planner/data/meal_planner.db \
       /opt/meal-planner/data/backup-$(date +%Y%m%d).db
```

Automated daily backup (cron):
```bash
# Add to crontab
0 2 * * * cp /opt/meal-planner/data/meal_planner.db \
             /opt/meal-planner/data/backup-$(date +\%Y\%m\%d).db
```

### Disk Space

Monitor SQLite database size:
```bash
du -h /opt/meal-planner/data/meal_planner.db
```

Vacuum database to reclaim space:
```bash
sqlite3 /opt/meal-planner/data/meal_planner.db "VACUUM;"
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check service status
sudo systemctl status meal-planner-api

# View detailed logs
sudo journalctl -u meal-planner-api -n 50

# Common issues:
# - Node.js not found: Check PATH in service file
# - Permission denied: Check file ownership
# - Port in use: Check if another process using port 3000
```

### Database Errors

```bash
# Check database file exists and is readable
ls -lh /opt/meal-planner/data/meal_planner.db

# Check database integrity
sqlite3 /opt/meal-planner/data/meal_planner.db "PRAGMA integrity_check;"

# Restore from backup
sudo cp /opt/meal-planner/data/backup-YYYYMMDD.db \
       /opt/meal-planner/data/meal_planner.db
sudo systemctl restart meal-planner-api
```

### API Not Responding

```bash
# Check if backend is running
sudo systemctl status meal-planner-api

# Check if port is listening
sudo netstat -tlnp | grep 3000

# Test API directly
curl http://localhost:3000/health

# Check nginx proxy
sudo nginx -t
sudo systemctl status nginx
```

---

## Technology Decision Log

### Why Fastify over Express?

- **Performance:** 2-3x faster, important for Pi
- **OpenAPI:** Built-in schema-to-docs generation
- **Modern:** Better TypeScript support
- **Plugins:** Rich ecosystem, well-maintained

### Why SQLite over PostgreSQL?

- **Simplicity:** No separate database service
- **Resources:** Lower memory footprint (~10MB vs ~50MB)
- **Deployment:** Single file, easy backups
- **Performance:** Fast for single-user workloads
- **Constraint:** No need for concurrent write scaling

### Why Drizzle over Prisma?

- **Lightweight:** Smaller bundle, faster startup
- **Control:** More SQL-like, easier to optimize
- **SQLite:** Better SQLite support and performance
- **Migrations:** More flexible migration workflow

### Why TanStack Query over Redux?

- **Purpose-built:** Designed for server state
- **Less boilerplate:** Automatic caching and invalidation
- **Better DX:** Suspense support, devtools, auto-refetch
- **Size:** Smaller than Redux + RTK Query

### Why Native over Docker?

- **Resources:** Save 100-200MB RAM
- **Simplicity:** Fewer layers to debug
- **Performance:** Direct system access
- **Constraint:** Not scaling horizontally on Pi

---

## Conclusion

This architecture provides:

✅ Lightweight deployment suitable for Raspberry Pi
✅ Modern development experience with TypeScript
✅ Auto-generated API documentation
✅ Easy extensibility through migrations
✅ Simple installation and updates
✅ Clean separation of concerns
✅ Type safety end-to-end

The design prioritizes simplicity, performance, and maintainability for a single-user or small household deployment on resource-constrained hardware.
