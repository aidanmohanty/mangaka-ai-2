# Database Setup for Mangaka AI

## Quick Setup Options

### Option 1: MongoDB Atlas (Cloud - Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Update `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mangaka-ai
   ```

### Option 2: Local MongoDB Installation

#### Windows:
1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Install and run as Windows Service
3. MongoDB will run on `mongodb://localhost:27017`

#### macOS:
```bash
brew install mongodb-community
brew services start mongodb-community
```

#### Linux:
```bash
sudo apt install mongodb
sudo systemctl start mongodb
```

## Quick Test

After setting up MongoDB, test the connection:

```bash
# Check if server is running
curl http://localhost:5000/api/health

# Should return:
# {"status":"healthy","database":"connected","timestamp":"..."}
```

## Troubleshooting

If you get database connection errors:
1. Make sure MongoDB service is running
2. Check the connection string in `.env`
3. Verify network connectivity
4. Check server logs for detailed error messages

## Alternative: Use Cloud Database (Easiest)

Instead of local installation, use MongoDB Atlas:
- Free tier available (512MB storage)
- No local setup required
- Reliable and fast
- Good for development and production