# GitHub Deployment Guide

This guide walks you through deploying your Service Management Application to GitHub and various hosting platforms.

## Quick GitHub Setup

### 1. Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and create a new repository
2. Name it something like `service-management-app`
3. Set it to Public or Private as desired
4. Don't initialize with README (we already have one)

### 2. Push Your Code

```bash
git init
git add .
git commit -m "Initial commit: Service Management Application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. Connect your GitHub repository to [Vercel](https://vercel.com)
2. Add environment variables in Vercel dashboard:
   ```
   DATABASE_URL=your_postgresql_connection_string
   ```
3. Deploy automatically on every push to main branch

### Option 2: Railway

1. Connect your GitHub repository to [Railway](https://railway.app)
2. Add a PostgreSQL database service
3. Set environment variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   ```
4. Deploy automatically

### Option 3: Render

1. Connect your GitHub repository to [Render](https://render.com)
2. Create a PostgreSQL database
3. Create a web service with:
   - Build Command: `npm run build`
   - Start Command: `npm start`
4. Add environment variables

### Option 4: Heroku

1. Install Heroku CLI
2. Create new app: `heroku create your-app-name`
3. Add PostgreSQL: `heroku addons:create heroku-postgresql:mini`
4. Deploy: `git push heroku main`

## Environment Variables

For any deployment platform, you'll need these environment variables:

```env
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

## Post-Deployment Setup

After deployment:

1. Run database migrations:
   ```bash
   npm run db:push
   ```

2. Test your application endpoints:
   - `/api/services` - Service management
   - `/api/inventory` - Inventory management

## Custom Domain (Optional)

Most platforms allow custom domains:
- Add your domain in the platform's dashboard
- Update DNS records as instructed
- SSL certificates are usually provided automatically

## Monitoring and Maintenance

- Monitor application logs through your hosting platform
- Set up uptime monitoring (like UptimeRobot)
- Regularly backup your database
- Keep dependencies updated with `npm audit`

## Troubleshooting

### Common Issues:

1. **Database Connection Errors**
   - Verify DATABASE_URL is correct
   - Check database is running and accessible

2. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are listed in package.json

3. **Port Issues**
   - Application automatically uses PORT environment variable
   - Default fallback is port 5000

### Support

If you encounter issues:
1. Check platform-specific documentation
2. Review application logs
3. Verify environment variables are set correctly