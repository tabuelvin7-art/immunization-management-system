# Backend Vercel Deployment Guide

## 🚀 Deploy Backend to Vercel

Your backend is an Express.js API that needs to be deployed **separately** from the frontend.

### Step 1: Create New Vercel Project

1. Go to https://vercel.com/new
2. Import the **same GitHub repository**: `tabuelvin7-art/immunization-management-system`
3. **Important**: Configure the Root Directory

### Step 2: Configure Root Directory

In Vercel project settings:
- **Root Directory**: `backend`
- **Framework Preset**: Other
- **Build Command**: (leave empty or use default)
- **Output Directory**: (leave empty)
- **Install Command**: `npm install`

### Step 3: Add Environment Variables

Go to Settings → Environment Variables and add:

```
MONGODB_URI=mongodb+srv://immunization_db:f5so0dSqDYO2LuHx@cluster0.ey4gxo1.mongodb.net/immunization_db?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=bc13826dde0e31b9770c8716fb2a993a10c3a3ec728284a525a69ee7c59a66ec
JWT_EXPIRE=7d
NODE_ENV=production
```

⚠️ **IMPORTANT**: Never commit these values to Git! They should only be in Vercel dashboard.

### Step 4: Deploy

Click "Deploy" - Vercel will:
1. Navigate to `backend/` directory
2. Run `npm install`
3. Deploy `server.js` as a serverless function
4. Give you a URL like: `https://your-backend.vercel.app`

### Step 5: Update Frontend

After backend is deployed, update the frontend's environment variable:

1. Go to your **frontend Vercel project**
2. Settings → Environment Variables
3. Update `REACT_APP_API_URL` to your new backend URL:
   ```
   REACT_APP_API_URL=https://your-backend.vercel.app/api
   ```
4. Redeploy frontend

## 📁 Project Structure

```
backend/
├── server.js              # Main entry point
├── vercel.json           # Vercel configuration
├── .vercelignore         # Files to exclude
├── package.json
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
└── utils/
```

## 🔧 How It Works

Vercel converts your Express app into **serverless functions**:
- Each API request triggers a function
- Functions auto-scale based on traffic
- No server to manage
- Cold starts may occur (first request after idle period)

## ⚠️ Important Notes

### CORS Configuration
Make sure your backend CORS allows your frontend domain:

```javascript
// In server.js
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend.vercel.app'
  ]
}));
```

### MongoDB Connection
- Vercel functions are stateless
- Each request may create a new DB connection
- Use connection pooling (Mongoose handles this)
- MongoDB Atlas is recommended (already configured)

### Scheduled Tasks
⚠️ **Cron jobs won't work on Vercel's free tier**

Your `notificationScheduler.js` uses `node-cron` which requires a continuously running server. On Vercel:
- Functions only run when triggered by HTTP requests
- For scheduled tasks, use:
  - **Vercel Cron** (Pro plan)
  - **External service** (GitHub Actions, Render Cron, etc.)
  - **Trigger endpoint** manually or via external scheduler

### File System
- Vercel functions have read-only file system
- Don't write files to disk
- Use database or external storage for persistence

## 🐛 Troubleshooting

### Issue: "Cannot find module"
**Solution**: Ensure all dependencies are in `package.json`, not just devDependencies

### Issue: Database connection timeout
**Solution**: 
- Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
- Verify MONGODB_URI is correct in Vercel env vars

### Issue: CORS errors
**Solution**: Update CORS configuration to include your frontend domain

### Issue: 500 errors
**Solution**: Check Vercel function logs in dashboard

## 📊 Vercel Dashboard Settings

**Project Name**: immunization-backend (or your choice)
**Root Directory**: `backend`
**Framework**: Other
**Node.js Version**: 18.x (default)

## 🎯 Deployment Checklist

- [ ] Backend vercel.json created
- [ ] Environment variables added to Vercel
- [ ] Backend deployed successfully
- [ ] Backend URL obtained
- [ ] Frontend REACT_APP_API_URL updated
- [ ] Frontend redeployed
- [ ] Test API endpoints work
- [ ] CORS configured correctly

## 🔗 Two Separate Vercel Projects

You'll have:
1. **Frontend Project**: Serves React app
   - URL: `https://immunization-frontend.vercel.app`
   - Root: `./` (uses root vercel.json)

2. **Backend Project**: Serves API
   - URL: `https://immunization-backend.vercel.app`
   - Root: `backend/` (uses backend/vercel.json)

Both projects point to the same GitHub repo but deploy different parts!
