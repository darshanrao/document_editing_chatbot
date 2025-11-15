# Deployment Guide - LegalDoc Filler Frontend

This guide will help you deploy the LegalDoc Filler frontend to Vercel.

## Prerequisites

- GitHub account
- Vercel account (free tier works fine)
- Git installed locally

## Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
```bash
git init
git add .
git commit -m "Initial commit: LegalDoc Filler frontend"
```

2. **Create GitHub Repository**:
   - Go to GitHub and create a new repository
   - Don't initialize with README (we already have one)

3. **Push to GitHub**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Vercel CLI (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
# From the project root
vercel

# Or from the frontend directory
cd frontend
vercel
```

4. **Follow the prompts**:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? `legaldoc-filler`
   - In which directory is your code located? `./` (or `frontend` if from root)
   - Want to modify settings? **N**

5. **Deploy to Production**:
```bash
vercel --prod
```

### Option B: Vercel Dashboard (Alternative)

1. **Go to [vercel.com](https://vercel.com)**

2. **Click "Add New Project"**

3. **Import Your GitHub Repository**

4. **Configure Project**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. **Environment Variables** (Optional for future backend):
   ```
   NEXT_PUBLIC_API_BASE_URL=/api
   NEXT_PUBLIC_ENABLE_EMAIL=true
   NEXT_PUBLIC_ENABLE_DOWNLOAD=true
   NEXT_PUBLIC_MAX_FILE_SIZE_MB=10
   NEXT_PUBLIC_ALLOWED_FILE_TYPES=.docx
   ```

6. **Click "Deploy"**

## Step 3: Verify Deployment

After deployment completes, Vercel will provide you with:
- **Production URL**: `https://your-project.vercel.app`
- **Deployment Status**: Check in Vercel dashboard

Test your deployment:
1. Visit the production URL
2. Try uploading a file
3. Test the conversational flow
4. Verify all pages work correctly

## Environment Variables Configuration

### Current (Mock Backend)
The app currently works with mock data and doesn't require any environment variables.

### Future (Real Backend)

When you have a FastAPI backend deployed, set these in Vercel:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-api.com/api/v1
NEXT_PUBLIC_ENABLE_EMAIL=true
NEXT_PUBLIC_ENABLE_DOWNLOAD=true
```

To add environment variables in Vercel:
1. Go to your project dashboard
2. Click on "Settings"
3. Navigate to "Environment Variables"
4. Add each variable for Production/Preview/Development as needed
5. Redeploy for changes to take effect

## Continuous Deployment

Vercel automatically sets up continuous deployment:

- **Push to `main` branch** → Deploys to production
- **Push to other branches** → Creates preview deployments
- **Pull Requests** → Generates preview URLs

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS

## Monitoring and Analytics

Vercel provides:
- **Analytics**: View pageviews and user metrics
- **Logs**: Check deployment and runtime logs
- **Speed Insights**: Monitor page performance

Access these from your project dashboard.

## Troubleshooting

### Build Fails

**Check build logs** in Vercel dashboard:
- Look for TypeScript errors
- Verify all dependencies are in `package.json`
- Ensure `next build` works locally

### Environment Variables Not Working

- Make sure they start with `NEXT_PUBLIC_`
- Redeploy after adding new variables
- Check variables are set for correct environment (Production/Preview/Development)

### 404 on Deployment

- Verify `Root Directory` is set to `frontend`
- Check `vercel.json` configuration
- Ensure all API routes are in `src/app/api/`

## Rolling Back

If a deployment has issues:

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback
```

Or use the Vercel dashboard:
1. Go to "Deployments"
2. Find a working deployment
3. Click "..." menu
4. Select "Promote to Production"

## Production Checklist

Before deploying to production:

- [ ] Test build locally (`npm run build`)
- [ ] Verify all environment variables
- [ ] Test all user flows
- [ ] Check mobile responsiveness
- [ ] Review error handling
- [ ] Test with different file types
- [ ] Verify loading states
- [ ] Check accessibility
- [ ] Test on different browsers
- [ ] Review security (no exposed secrets)

## Local Production Build

Test production build before deploying:

```bash
cd frontend

# Build
npm run build

# Start production server
npm start

# Test at http://localhost:3000
```

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **GitHub Issues**: Report issues in your repository

## Next Steps

After frontend deployment:
1. Deploy FastAPI backend
2. Update `NEXT_PUBLIC_API_BASE_URL` in Vercel
3. Configure CORS on backend for your Vercel domain
4. Test full integration
5. Set up monitoring and error tracking (e.g., Sentry)
