# AI Rule Generator Setup Guide

This guide will help you set up the AI Rule Generator feature for KRule.

## Prerequisites

1. **Node.js** >= 18.x
2. **pnpm** 9.0.0+
3. **PostgreSQL** 14+ (or Docker)
4. **Groq API Key** (free - get from [console.groq.com](https://console.groq.com))

---

## Quick Start

### 1. Install Dependencies

```bash
# From project root
pnpm install
```

### 2. Set Up PostgreSQL Database

**Option A: Using Docker** (Recommended)

```bash
# Create and start PostgreSQL container
docker run --name krule-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=krule \
  -p 5432:5432 \
  -d postgres:16

# Verify it's running
docker ps | grep krule-postgres
```

**Option B: Local PostgreSQL**

```bash
# Create database
createdb krule

# Or using psql
psql -U postgres -c "CREATE DATABASE krule;"
```

### 3. Configure Environment Variables

```bash
# Copy example environment file
cp apps/web/.env.local.example apps/web/.env.local

# Edit the file and add your keys:
nano apps/web/.env.local
```

**Required values in `.env.local`:**

```bash
# Get your free API key from https://console.groq.com/keys
GROQ_API_KEY=gsk_...

# Your PostgreSQL connection string
DATABASE_URL=postgresql://postgres:password@localhost:5432/krule
```

### 4. Initialize Database

```bash
# Generate Prisma client
cd packages/database
pnpm db:generate

# Push schema to database
pnpm db:push

# (Optional) Open Prisma Studio to view data
pnpm db:studio
```

### 5. Build Packages

```bash
# From project root
pnpm run build
```

### 6. Start Development Server

```bash
# From project root
pnpm dev

# Or from apps/web
cd apps/web
pnpm dev
```

The app will be available at http://localhost:3000

---

## API Endpoints

Once running, these endpoints will be available:

### Rule Generation
```bash
POST http://localhost:3000/api/ai/generate
Content-Type: application/json

{
  "prompt": "Give VIP users 20% off when cart is over $100",
  "userId": "optional-user-id"
}
```

### Conversational Chat
```bash
POST http://localhost:3000/api/ai/chat
Content-Type: application/json

{
  "message": "Create a content moderation rule",
  "conversationId": "optional-conv-id",
  "userId": "optional-user-id"
}
```

### Rule Explanation
```bash
POST http://localhost:3000/api/ai/explain
Content-Type: application/json

{
  "rule": { ...rule object... },
  "type": "full" // or "conditions", "actions", "useCases"
}
```

### Rule Validation
```bash
POST http://localhost:3000/api/ai/validate
Content-Type: application/json

{
  "rule": { ...rule object... },
  "userId": "optional-user-id"
}
```

### Test Scenario Generation
```bash
POST http://localhost:3000/api/ai/test-scenarios
Content-Type: application/json

{
  "rule": { ...rule object... },
  "type": "all", // or "positive", "negative", "edge", "suite"
  "count": 3
}
```

---

## Groq API Configuration

### Getting Your API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up for free account
3. Navigate to "API Keys"
4. Create new API key
5. Copy and paste into `.env.local`

### Free Tier Limits

- **14,400 requests/day** (10 requests/min)
- **Speed:** 500+ tokens/second
- **Models:** Llama 3.1/3.3 70B

### Models Available

Default model: `llama-3.3-70b-versatile`

Other options:
- `llama-3.1-70b-versatile` - Slightly older, very capable
- `mixtral-8x7b-32768` - Fast, large context window
- `gemma2-9b-it` - Lightweight, faster responses

To change model, update in `packages/ai-service/src/groq-client.ts`:
```typescript
private defaultModel: string = "your-preferred-model";
```

---

## Database Schema

The setup creates these tables:

### User
- Stores user information
- Links to conversations and rules

### Conversation
- Tracks chat sessions
- Contains multiple messages

### Message
- Individual chat messages
- Stores rule snapshots

### GeneratedRule
- Stores all AI-generated rules
- Tracks validation status

### ValidationAttempt
- Analytics for validation errors
- Helps improve prompts

### ApiUsage
- Tracks API calls
- Rate limiting and analytics

View schema: `packages/database/prisma/schema.prisma`

---

## Troubleshooting

### Database Connection Failed

**Error:** `Can't reach database server`

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps  # if using Docker
# or
pg_isready  # if using local PostgreSQL

# Restart if needed
docker restart krule-postgres
```

### Prisma Client Not Found

**Error:** `@prisma/client did not initialize yet`

**Solution:**
```bash
cd packages/database
pnpm db:generate
cd ../..
pnpm run build
```

### Groq API Rate Limit

**Error:** `Rate limit exceeded`

**Solution:**
- Free tier: 10 requests/min
- Wait 1 minute between requests
- Consider upgrading for higher limits
- Implement client-side request queuing

### CORS Errors

**Error:** `CORS policy blocked`

**Solution:**
Add your origin to allowed list in API routes or update `ALLOWED_ORIGINS` in `.env.local`

---

## Development Tips

### Viewing Database

```bash
cd packages/database
pnpm db:studio
```

Opens Prisma Studio at http://localhost:5555

### Resetting Database

```bash
cd packages/database

# Drop all tables and recreate
pnpm db:push --force-reset

# Or manually in psql
psql -U postgres -d krule -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
pnpm db:push
```

### Testing API Endpoints

Use the included VSCode REST Client file:

```http
### Generate Rule
POST http://localhost:3000/api/ai/generate
Content-Type: application/json

{
  "prompt": "Block users with more than 5 failed login attempts"
}
```

### Monitoring Logs

```bash
# Watch API logs
tail -f apps/web/.next/trace

# Database query logs (if enabled)
# Set in packages/database/src/index.ts
```

---

## Next Steps

1. ✅ Complete frontend UI components
2. ✅ Add authentication for multi-user support
3. ✅ Implement rate limiting middleware
4. ✅ Create developer SDK package
5. ✅ Add comprehensive error handling
6. ✅ Deploy to production

---

## Production Deployment

### Environment Variables

Set these in your hosting platform:

```bash
GROQ_API_KEY=your_production_key
DATABASE_URL=your_production_db_url
NODE_ENV=production
API_SECRET_KEY=strong_random_secret
```

### Database Migration

```bash
# Generate migration files
cd packages/database
pnpm db:migrate

# In production, run migrations
pnpm prisma migrate deploy
```

### Recommended Hosting

- **Frontend:** Vercel, Netlify
- **Database:** Supabase, Neon, Railway
- **Full Stack:** Railway, Render, Fly.io

---

## Support

- **Issues:** [GitHub Issues](https://github.com/your-repo/krule/issues)
- **Groq Docs:** [docs.groq.com](https://docs.groq.com)
- **Prisma Docs:** [prisma.io/docs](https://www.prisma.io/docs)

---

## License

See LICENSE file for details.
