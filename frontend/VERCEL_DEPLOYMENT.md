# Vercel Deployment Guide

## Project Structure
This is a monorepo containing:
- **Frontend**: React app in `/frontend` directory
- **Backend**: Express API in `/backend` directory

## Deployment Setup

### Frontend Deployment (Current Repository)

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`

2. **Environment Variables**
   Add these in Vercel Dashboard → Settings → Environment Variables:
   ```
   REACT_APP_API_URL=https://immunization-backend.vercel.app/api
   ESLINT_NO_DEV_ERRORS=true
   ```

3. **Build Settings** (Auto-configured via vercel.json)
   - Build Command: `cd frontend && npm install && npm run vercel-build`
   - Output Directory: `frontend/build`
   - Install Command: `cd frontend && npm install`

### Backend Deployment (Separate)

The backend should be deployed separately:

1. **Option A: Deploy backend to Vercel separately**
   - Create a new Vercel project for the backend
   - Point it to the same repo but configure root directory as `backend`
   - Add environment variables (MongoDB connection, JWT secret, etc.)

2. **Option B: Deploy backend elsewhere**
   - Deploy to Railway, Render, or Heroku
   - Update `REACT_APP_API_URL` in frontend environment variables

## Local Development

### Frontend
```bash
cd frontend
npm install
npm start
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Troubleshooting

### Build fails with "Could not find index.html"
- Ensure `vercel.json` is in the root directory
- Verify `frontend/public/index.html` exists
- Check that build command runs from frontend directory

### API calls fail
- Verify `REACT_APP_API_URL` environment variable is set correctly
- Ensure backend is deployed and accessible
- Check CORS settings in backend

### Deployment succeeds but shows blank page
- Check browser console for errors
- Verify all environment variables are set in Vercel
- Ensure build completed successfully in Vercel logs

## Quick Deploy Commands

```bash
# Commit changes
git add .
git commit -m "Configure Vercel deployment"
git push origin master

# Vercel will automatically deploy on push
```

## Manual Vercel CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```
