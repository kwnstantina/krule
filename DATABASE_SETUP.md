# PostgreSQL Database Setup

## Quick Start with Docker

### Option 1: Using Docker Compose (Recommended)

```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f postgres

# Stop containers
docker-compose down

# Stop and remove all data
docker-compose down -v
```

**Access:**
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050`
  - Email: `admin@krule.local`
  - Password: `admin`

### Option 2: Using Docker Run

```bash
# Start PostgreSQL only
docker run --name krule-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=krule \
  -p 5432:5432 \
  -v krule_postgres_data:/var/lib/postgresql/data \
  -d postgres:16-alpine

# Check status
docker ps | grep krule-postgres

# View logs
docker logs -f krule-postgres

# Stop container
docker stop krule-postgres

# Start again
docker start krule-postgres

# Remove container
docker rm krule-postgres
```

### Option 3: Build Custom Dockerfile

```bash
# Build image
docker build -f Dockerfile.postgres -t krule-postgres:latest .

# Run container
docker run --name krule-postgres \
  -p 5432:5432 \
  -v krule_postgres_data:/var/lib/postgresql/data \
  -d krule-postgres:latest
```

---

## Initialize Database Schema

After starting PostgreSQL:

```bash
# 1. Generate Prisma Client
cd packages/database
pnpm db:generate

# 2. Push schema to database
pnpm db:push

# 3. (Optional) Create migration
pnpm db:migrate

# 4. (Optional) Open Prisma Studio
pnpm db:studio
```

---

## Connection Strings

### Local Development
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/krule
```

### Docker Compose
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/krule
```

### Docker Network (from another container)
```
DATABASE_URL=postgresql://postgres:password@postgres:5432/krule
```

---

## Useful Commands

### Connect to Database

```bash
# Using psql
docker exec -it krule-postgres psql -U postgres -d krule

# Using pgAdmin
# Open http://localhost:5050 in browser
```

### Backup Database

```bash
# Backup
docker exec -t krule-postgres pg_dump -U postgres krule > backup.sql

# Restore
docker exec -i krule-postgres psql -U postgres krule < backup.sql
```

### View Tables

```bash
docker exec -it krule-postgres psql -U postgres -d krule -c "\dt"
```

### Check Database Size

```bash
docker exec -it krule-postgres psql -U postgres -d krule -c "SELECT pg_size_pretty(pg_database_size('krule'));"
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 5432
lsof -i :5432

# Kill process (if needed)
kill -9 <PID>

# Or use different port
docker run -p 5433:5432 ...
# Then update DATABASE_URL to use port 5433
```

### Connection Refused

```bash
# Check if container is running
docker ps -a | grep postgres

# Check logs for errors
docker logs krule-postgres

# Restart container
docker restart krule-postgres
```

### Permission Denied

```bash
# Remove old volume and start fresh
docker-compose down -v
docker-compose up -d
```

---

## Production Considerations

### Use Managed Database Services

**Recommended providers:**
- **Supabase** - Free tier, PostgreSQL-based
- **Neon** - Serverless PostgreSQL
- **Railway** - Easy deployment
- **AWS RDS** - Enterprise-grade
- **Google Cloud SQL** - Managed PostgreSQL

### Security

```bash
# Use strong passwords
POSTGRES_PASSWORD=$(openssl rand -base64 32)

# Restrict network access
# Only allow connections from application

# Enable SSL
# Configure in postgresql.conf
```

### Performance

```bash
# Increase connection pool
# In Prisma schema:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")

  # Connection pooling
  connection_limit = 10
}
```

---

## Environment-Specific Setup

### Development

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/krule
```

### Staging

```bash
DATABASE_URL=postgresql://user:pass@staging-host:5432/krule_staging
```

### Production

```bash
DATABASE_URL=postgresql://user:pass@prod-host:5432/krule_production?sslmode=require
```

---

## Maintenance

### Vacuum Database

```bash
docker exec -it krule-postgres psql -U postgres -d krule -c "VACUUM ANALYZE;"
```

### Check Connection Count

```bash
docker exec -it krule-postgres psql -U postgres -d krule -c "SELECT count(*) FROM pg_stat_activity;"
```

### Monitor Performance

```bash
# Enable pg_stat_statements
docker exec -it krule-postgres psql -U postgres -d krule -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"

# View slow queries
docker exec -it krule-postgres psql -U postgres -d krule -c "SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```
