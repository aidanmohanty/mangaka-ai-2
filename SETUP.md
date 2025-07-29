# 🚀 Mangaka AI Setup Guide

## Environment Variables Setup

### 1. Local Development
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your actual values:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a secure random string
   - Other settings as needed

### 2. Production (Vercel)
Set environment variables in Vercel dashboard:
- Go to your project settings
- Navigate to "Environment Variables"
- Add each variable from `.env.example`

### 3. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create free account and cluster
3. Create database user
4. Whitelist your IP (or use 0.0.0.0/0 for development)
5. Get connection string from "Connect" button
6. Replace `<password>` with your database user password
7. Replace `<dbname>` with `mangaka-ai`

### 4. JWT Secret Generation
Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🔒 Security Notes
- Never commit `.env` files to Git
- Use different secrets for development and production
- Regularly rotate your JWT secrets
- Use MongoDB Atlas network restrictions in production