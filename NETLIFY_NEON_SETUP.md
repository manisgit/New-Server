# Netlify + Neon Database Setup Guide

Complete guide to deploy your Service Management Application on Netlify with Neon PostgreSQL database.

## Prerequisites

1. **GitHub Account** with your code repository
2. **Netlify Account** at [netlify.com](https://netlify.com)
3. **Neon Account** at [neon.tech](https://neon.tech)

## Step 1: Setup Neon Database

### Create Neon Database:

1. **Sign up at Neon.tech**
   - Go to [console.neon.tech](https://console.neon.tech)
   - Create a new account or sign in

2. **Create New Project**
   - Click "Create Project"
   - Name: `service-management-db`
   - Region: Choose closest to your users
   - PostgreSQL version: Latest (default)

3. **Get Connection String**
   - In project dashboard, go to "Connection Details"
   - Copy the connection string that looks like:
     ```
     postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```

4. **Configure Database**
   - Keep the connection string for Netlify setup
   - Note: Neon provides a generous free tier

## Step 2: Deploy to Netlify

### Connect Repository:

1. **Login to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Connect with your GitHub account

2. **Import Project**
   - Click "New site from Git"
   - Choose "GitHub"
   - Select your repository
   - Branch: `main` (or your default branch)

### Configure Build Settings:

3. **Build Configuration**
   - Build command: `npm install && npm run build:client`
   - Publish directory: `dist/public`
   - Functions directory: `netlify/functions`

4. **Environment Variables**
   - Go to Site settings → Environment variables
   - Add these variables:
     ```
     DATABASE_URL = your_neon_connection_string_from_step_1
     NODE_ENV = production
     ```

### Deploy:

5. **First Deployment**
   - Click "Deploy site"
   - Wait for build to complete (3-5 minutes)
   - Note your site URL: `https://your-site-name.netlify.app`

## Step 3: Initialize Database Schema

### Push Database Schema:

1. **Local Setup** (one-time):
   ```bash
   # Clone your repo locally
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO
   
   # Install dependencies
   npm install
   
   # Set up environment
   echo "DATABASE_URL=your_neon_connection_string" > .env
   
   # Push database schema to Neon
   npm run db:push
   ```

2. **Verify Schema**:
   - Go to Neon dashboard → SQL Editor
   - Run: `SELECT * FROM services LIMIT 1;`
   - Should see empty table with proper columns

## Step 4: Test Your Application

### Verify Features:

1. **Visit Your Site**: `https://your-site-name.netlify.app`
2. **Test Service Management**:
   - Create a new service entry
   - Check if auto-generated serial number appears
   - Mark service as completed/returned
3. **Test Inventory Management**:
   - Add inventory items
   - Adjust quantities with +/- buttons
   - Use filters and search
4. **Test Analytics**:
   - View daily sales in history tab
   - Check calculations are correct

## Files Created for Netlify Compatibility

### Serverless Functions:
- `netlify/functions/services.ts` - Handles all service API calls
- `netlify/functions/inventory.ts` - Handles all inventory API calls

### Configuration:
- `netlify.toml` - Build settings and redirects
- `scripts/build-client.js` - Client-only build script

### Database Integration:
- Uses `@neondatabase/serverless` for edge-compatible connections
- WebSocket configuration for Neon compatibility
- Proper error handling for serverless environment

## Cost Breakdown

### Neon Database:
- **Free Tier**: 0.5 GB storage, 1 project
- **Pro Plan**: $19/month for production use

### Netlify Hosting:
- **Free Tier**: 100 GB bandwidth, 300 build minutes
- **Pro Plan**: $19/month for more resources

**Total for Free Tier**: $0/month (perfect for development/testing)
**Total for Production**: ~$38/month

## Auto-Deployment Setup

### Continuous Deployment:

1. **Enable Auto-Deploy**:
   - Netlify dashboard → Site settings → Build & deploy
   - Enable "Auto publishing"
   - Deploy hook: `main` branch

2. **Build Hooks** (optional):
   - Create build hook for manual triggers
   - Use for rebuilding without code changes

### Branch Deploys:

3. **Preview Deploys**:
   - All pull requests auto-deploy to preview URLs
   - Test features before merging to main
   - Deploy previews include database access

## Environment-Specific Configuration

### Development:
```bash
DATABASE_URL=your_neon_connection_string
NODE_ENV=development
```

### Production (Netlify):
```
DATABASE_URL=your_neon_connection_string
NODE_ENV=production
```

## Troubleshooting

### Common Issues:

1. **Build Fails - "vite not found"**:
   - Verify `netlify.toml` has correct build command
   - Check `package.json` has all dependencies

2. **Database Connection Error**:
   - Verify DATABASE_URL is correct
   - Check Neon project is active (not suspended)
   - Ensure connection string includes `?sslmode=require`

3. **Functions Not Working**:
   - Check function logs in Netlify dashboard
   - Verify redirects in `netlify.toml`
   - Ensure functions directory is correct

4. **CORS Errors**:
   - Functions include proper CORS headers
   - Frontend should work without additional CORS setup

### Debugging Tools:

- **Netlify Function Logs**: Real-time debugging
- **Neon Monitoring**: Query performance and errors
- **Browser DevTools**: Network tab for API calls

## Performance Optimization

### For Production:

1. **Database Indexing**:
   ```sql
   CREATE INDEX idx_services_status ON services(status);
   CREATE INDEX idx_services_date ON services(service_date);
   ```

2. **Netlify Edge Functions** (advanced):
   - Move to edge functions for lower latency
   - Cache frequently accessed data

3. **Database Connection Pooling**:
   - Neon handles this automatically
   - No additional configuration needed

Your Service Management Application is now production-ready on Netlify with Neon database!