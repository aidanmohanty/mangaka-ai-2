# 🚀 Vercel Deployment Guide

## Prerequisites
✅ Local authentication working (login/signup)  
✅ MongoDB Atlas connection string  
✅ GitHub repository updated  

## Step 1: Set Environment Variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables** and add:

### Required Variables:
```
MONGODB_URI = mongodb+srv://aidanmohanty:H8FvQuDGEMEqhUMG@mangaka.gzdryyt.mongodb.net/mangaka-ai?retryWrites=true&w=majority&appName=mangaka

JWT_SECRET = mangaka-ai-2024-super-secure-jwt-secret-key-random-chars-xyz789

NODE_ENV = production

PORT = 5000
```

### Optional Variables:
```
CORS_ORIGIN = https://your-app-name.vercel.app
MAX_FILE_SIZE_MB = 10
ALLOWED_FILE_TYPES = image/jpeg,image/png,image/webp
```

## Step 2: Deploy
1. Push latest changes to GitHub (already done ✅)
2. Vercel will auto-deploy from your GitHub repository
3. Check deployment logs for any errors

## Step 3: Test Deployment
1. Visit your Vercel app URL
2. Test user registration
3. Test login functionality
4. Check browser network tab for any API errors

## Troubleshooting

### Common Issues:
- **CORS errors**: Make sure CORS_ORIGIN matches your Vercel URL
- **Database connection**: Verify MONGODB_URI is correct in Vercel
- **JWT errors**: Ensure JWT_SECRET is set in Vercel environment

### Debug Steps:
1. Check Vercel function logs
2. Test API endpoints directly: `https://your-app.vercel.app/api/health`
3. Verify environment variables are set correctly

## 🎉 Success Indicators:
- ✅ Health endpoint returns: `{"status":"healthy","database":"connected"}`
- ✅ Registration creates new users
- ✅ Login returns JWT token and user data
- ✅ Frontend authentication flow works