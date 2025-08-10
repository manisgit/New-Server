# Build Error Fixes

## Netlify Build Error: "vite: not found"

### Problem
The build command fails because `vite` is not available during the build process.

### Solution
Updated `netlify.toml` with proper dependency installation:

```toml
[build]
  publish = "dist/public"
  command = "npm install && npm run build"

[build.environment]
  NODE_ENV = "production"
  NPM_FLAGS = "--production=false"
```

### Alternative Solutions

1. **Use npm ci instead of npm install:**
   ```toml
   command = "npm ci && npm run build"
   ```

2. **Install devDependencies explicitly:**
   ```toml
   command = "npm install --include=dev && npm run build"
   ```

3. **Use yarn if preferred:**
   ```toml
   command = "yarn install && yarn build"
   ```

## Frontend Error: "filter is not a function"

### Problem
API calls return error objects instead of arrays, causing `.filter()` to fail.

### Solution
Added proper error handling and array validation:

```typescript
queryFn: () => fetch("/api/services?status=in_progress").then(res => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}).then(data => Array.isArray(data) ? data : []),
```

## Database Connection Issues

### Problem
Database endpoint might be disabled or connection string incorrect.

### Solutions

1. **Check environment variables:**
   - Verify `DATABASE_URL` is set correctly
   - Ensure database is enabled in hosting platform

2. **Database platform specific:**

   **Neon:**
   - Go to Neon dashboard
   - Enable the endpoint if disabled
   - Get fresh connection string

   **Vercel Postgres:**
   - Check Vercel dashboard → Storage
   - Verify database is active

   **Railway:**
   - Database auto-configured
   - Check Variables tab for DATABASE_URL

3. **Local development:**
   ```bash
   # Check if database is accessible
   psql $DATABASE_URL -c "SELECT 1"
   
   # Push schema if needed
   npm run db:push
   ```

## Build Configuration for Different Platforms

### Vercel
- `vercel.json` already configured
- Auto-detects framework
- No additional setup needed

### Netlify
- Updated `netlify.toml` with proper build command
- Handles both frontend and serverless functions

### Railway
- Uses `package.json` scripts directly
- No additional configuration needed

### Heroku
- Uses `Procfile` for process definition
- `app.json` for add-on configuration

## Environment Variables Required

For all platforms:
```
DATABASE_URL=postgresql://...
NODE_ENV=production
```

Platform-specific variables are auto-configured.

## Testing the Build Locally

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test the build
npm start

# Check if files are generated
ls -la dist/
```

The `dist/public` folder should contain the frontend files, and `dist/index.js` should be the server bundle.