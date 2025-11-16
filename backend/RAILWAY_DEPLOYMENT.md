# Railway Deployment Guide

This guide will help you deploy the LegalDoc Filler backend to Railway.

## Prerequisites

- GitHub account with your repository pushed
- Railway account (sign up at https://railway.app)
- Supabase project set up (database + storage)
- Google Gemini API key

## Step 1: Prepare Your Code

Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "Add Railway deployment files"
git push origin main
```

## Step 2: Create Railway Project

1. Go to https://railway.app and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Select your repository
5. Railway will auto-detect Python and FastAPI

## Step 3: Configure Root Directory

If deploying from a monorepo:
1. Go to your service settings
2. Set **Root Directory** to: `backend`
3. This tells Railway where your Python code is

## Step 4: Set Environment Variables

In Railway dashboard → Your Service → **Variables** tab, add:

### Required Variables:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
```

### Optional Variables:

```bash
DEBUG=False
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=.docx
```

**Note:**
- `PORT` is automatically set by Railway - don't override it
- Use your Supabase **Service Role Key** (not the anon key) for `SUPABASE_KEY`
- Add multiple origins in `ALLOWED_ORIGINS` separated by commas

## Step 5: Verify Build Settings

Railway should auto-detect:
- **Builder**: NIXPACKS
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

If not, you can manually set:
- Build Command: `cd backend && pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## Step 6: Deploy

1. Railway will automatically deploy when you push to GitHub
2. Check the **Deployments** tab to see build logs
3. Wait for deployment to complete (usually 2-5 minutes)

## Step 7: Get Your Deployment URL

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"** to get a public URL
3. Your API will be available at: `https://your-app.up.railway.app`

## Step 8: Test Your Deployment

```bash
# Health check
curl https://your-app.up.railway.app/health

# Root endpoint
curl https://your-app.up.railway.app/
```

## Step 9: Update Frontend

Update your frontend's API base URL:

**In `frontend/src/lib/config.ts`:**
```typescript
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://your-app.up.railway.app/api',
  },
  // ...
}
```

**In Vercel (or your frontend host), set:**
```
NEXT_PUBLIC_API_BASE_URL=https://your-app.up.railway.app/api
```

## Troubleshooting

### Build Fails

- Check build logs in Railway dashboard
- Verify `requirements.txt` is correct
- Ensure Python version is compatible (3.9+)

### App Crashes on Start

- Check application logs in Railway
- Verify all environment variables are set
- Test database connection

### Database Connection Issues

- Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Check Supabase project is active
- Ensure database tables are created (run `database_init.sql`)

### CORS Errors

- Verify `ALLOWED_ORIGINS` includes your frontend URL
- Check frontend is calling correct API URL
- Ensure no trailing slashes in URLs

### Storage Issues

- Verify Supabase Storage buckets exist:
  - `original-documents`
  - `completed-documents`
- Check storage policies allow uploads/downloads
- Verify service role key has storage permissions

## Monitoring

- **Logs**: View real-time logs in Railway dashboard
- **Metrics**: Check CPU/Memory usage in Metrics tab
- **Health**: Use `/health` endpoint for health checks

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SUPABASE_URL` | Yes | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Yes | Supabase service role key | `eyJhbGci...` |
| `GEMINI_API_KEY` | Yes | Google Gemini API key | `AIzaSy...` |
| `ALLOWED_ORIGINS` | Yes | Comma-separated frontend URLs | `https://app.vercel.app` |
| `DEBUG` | No | Debug mode (default: False) | `False` |
| `MAX_FILE_SIZE_MB` | No | Max upload size (default: 10) | `10` |
| `PORT` | Auto | Railway sets this automatically | `8000` |

## Cost

Railway offers:
- **Free tier**: $5/month credit (usually enough for development)
- **Hobby plan**: $5/month + usage
- Pay-as-you-go pricing

Monitor your usage in the Railway dashboard.

## Next Steps

1. Set up custom domain (optional)
2. Enable auto-scaling if needed
3. Set up monitoring/alerts
4. Configure backup strategies for database

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check logs in Railway dashboard for debugging

