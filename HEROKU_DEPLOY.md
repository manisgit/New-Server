# Heroku Deployment Guide

This guide walks you through deploying your Service Management Application to Heroku from GitHub.

## Prerequisites

1. **Heroku Account**: Sign up at [heroku.com](https://heroku.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Heroku CLI** (optional): For advanced management

## Quick Deploy from GitHub

### Method 1: Heroku Dashboard (Recommended)

1. **Log into Heroku Dashboard**
   - Go to [dashboard.heroku.com](https://dashboard.heroku.com)
   - Click "Create new app"

2. **App Configuration**
   - App name: `your-service-management-app` (must be unique)
   - Region: Choose your preferred region
   - Click "Create app"

3. **Connect to GitHub**
   - Go to "Deploy" tab
   - Select "GitHub" as deployment method
   - Connect your GitHub account if not already connected
   - Search for your repository name
   - Click "Connect"

4. **Add PostgreSQL Database**
   - Go to "Resources" tab
   - In "Add-ons" search box, type "postgres"
   - Select "Heroku Postgres" 
   - Choose "Mini ($5/month)" or "Essential-0 (Free)" plan
   - Click "Submit Order Form"

5. **Configure Environment Variables**
   - Go to "Settings" tab
   - Click "Reveal Config Vars"
   - Add these variables:
     ```
     NODE_ENV = production
     ```
   - The DATABASE_URL is automatically set by Heroku Postgres

6. **Deploy**
   - Go back to "Deploy" tab
   - Scroll to "Manual deploy" section
   - Select "main" branch
   - Click "Deploy Branch"

### Method 2: Heroku CLI

```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create your-service-management-app

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production

# Connect to GitHub and deploy
git push heroku main

# Run database migrations
heroku run npm run db:push
```

## Post-Deployment Setup

1. **Initialize Database**
   - After successful deployment, go to "More" menu → "Run console"
   - Run: `npm run db:push`
   - This creates the database tables

2. **View Application**
   - Click "Open app" button in Heroku dashboard
   - Your app will be available at: `https://your-app-name.herokuapp.com`

## Automatic Deployments

1. In Heroku Dashboard → Deploy tab
2. Enable "Automatic deploys" from main branch
3. Optionally enable "Wait for CI to pass"
4. Now every push to main branch auto-deploys

## Environment Variables

Your app needs these config vars (automatically handled):

```
DATABASE_URL    (set by Heroku Postgres)
NODE_ENV        (set to 'production')
PORT            (set by Heroku automatically)
```

## Heroku Specific Files Created

- **Procfile**: Tells Heroku how to start your app
- **app.json**: App configuration and add-ons
- Your existing package.json works perfectly with Heroku

## Troubleshooting

### Common Issues:

1. **Build Failures**
   ```bash
   # Check build logs in Heroku dashboard
   heroku logs --tail --app your-app-name
   ```

2. **Database Connection Issues**
   - Verify PostgreSQL add-on is installed
   - Check DATABASE_URL config var exists
   - Run database migrations: `heroku run npm run db:push`

3. **Port Issues**
   - App automatically uses Heroku's PORT environment variable
   - No configuration needed

### Useful Heroku Commands

```bash
# View logs
heroku logs --tail

# Run database migrations
heroku run npm run db:push

# Open app in browser
heroku open

# Access database console
heroku pg:psql

# View config variables
heroku config
```

## Cost Estimation

- **Mini Dyno**: $7/month
- **Heroku Postgres Mini**: $5/month
- **Total**: ~$12/month

## Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS as instructed
4. SSL certificates are automatic

## Monitoring

- View app metrics in Heroku Dashboard
- Set up log drains for advanced monitoring
- Use Heroku's built-in monitoring tools

Your Service Management Application will be live at: `https://your-app-name.herokuapp.com`

## Next Steps After Deployment

1. Test all features (services, inventory, analytics)
2. Add some sample data
3. Monitor performance and logs
4. Set up regular database backups