# Deployment Guide for Vercel

This guide will help you deploy the AI Story Creator application to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A Vercel Postgres database
3. OpenAI API key

## Step 1: Create Vercel Project and Set up Postgres

1. Go to your Vercel dashboard (https://vercel.com/dashboard)
2. Create a new project (or use an existing one) for your AI Story Creator app
3. In your project, go to the **"Storage"** tab
4. Click **"Create Database"** and select **"Postgres"**
5. Once created, Vercel will automatically:
   - Add the `POSTGRES_URL` environment variable to your project
   - You can see it in **Settings → Environment Variables**

**Note:** The database is a service attached to your main Vercel project, not a separate project.

## Step 2: Run Database Migration

1. In your Vercel project, go to the **"Storage"** tab
2. Click on your Postgres database
3. Go to the **"Data"** or **"SQL Editor"** tab
4. Run the SQL migration script from `server/migrations/001_initial_schema.sql`
   - Copy and paste the SQL content into the editor
   - Execute it to create the `stories` and `rate_limits` tables

Alternatively, you can use a PostgreSQL client (pgAdmin, DBeaver, or `psql`) with the connection string from your Vercel project.

## Step 3: Migrate Existing Stories (Optional)

If you have existing stories in the JSON file, run the migration script locally:

```bash
# Make sure your local .env file has POSTGRES_URL set
node server/scripts/migrate-stories.js
```

**Note:** This connects to your Vercel Postgres database using the connection string from your local `.env` file.

## Step 4: Configure Environment Variables in Vercel Project

In your **main Vercel project** (not the database), go to **Settings → Environment Variables** and add:

- `POSTGRES_URL` - ✅ **Already set automatically** when you created the Postgres database
- `OPENAI_API_KEY` - Your OpenAI API key (add this manually)
- `NODE_ENV` - Set to `production` (optional, Vercel sets this automatically in production)

**Important:** These environment variables are set in your **main app project settings**, not in the database settings.

## Step 5: Deploy to Vercel

**Important:** You only need **ONE Vercel project** for both client and server. The `vercel.json` configuration handles:
- **Frontend (client)**: Deployed as a static site from `client/build`
- **Backend (server)**: Deployed as serverless functions in the `/api` folder

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. From the **root directory** of your project, deploy:
   ```bash
   vercel
   ```

3. Follow the prompts to:
   - Link to an existing Vercel project, or
   - Create a new project

4. For production deployment:
   ```bash
   vercel --prod
   ```

**How it works:**
- Vercel builds the React app from `client/` and serves it as static files
- API routes in `api/` are automatically deployed as serverless functions
- All requests to `/api/*` are routed to the serverless functions
- All other requests serve the React app

## Step 6: Configure Frontend API URL

Update the `API_URL` in your frontend code to point to your Vercel deployment:

- For development: `http://localhost:5000/api`
- For production: `https://your-app.vercel.app/api`

You can use environment variables in your React app:
- Create a `.env` file in the `client` directory
- Add: `REACT_APP_API_URL=https://your-app.vercel.app/api`
- Update `client/src/components/GenerateSection.js` and other components to use `process.env.REACT_APP_API_URL`

## Architecture Notes

**Single Vercel Project Structure:**
- **Frontend (client/)**: Built and deployed as a static site from `client/build`
- **Backend (api/)**: Deployed as Vercel Serverless Functions
  - `/api/stories/*` → `api/stories/index.js`
  - `/api/translate/*` → `api/translate/index.js`
  - `/api/health` → `api/health.js`
- **Database**: Vercel Postgres (serverless PostgreSQL) - attached to the same project
- **Rate Limiting**: IP-based, 3 stories per day per IP address
- **Stories**: Private by default (filtered by IP address)

**All in one project!** No need for separate client/server projects.

## Troubleshooting

### Database Connection Issues
- Verify `POSTGRES_URL` is set in Vercel environment variables
- Check that the database schema has been created
- Ensure the database is in the same region as your deployment

### Rate Limiting Not Working
- Check that the `rate_limits` table exists in the database
- Verify IP address extraction is working (check server logs)
- Ensure the rate limit middleware is applied to the `/search` endpoint

### CORS Errors
- Update CORS configuration in `server/src/index.js` to include your Vercel domain
- Check that `FRONTEND_URL` environment variable is set correctly

## Local Development

For local development with Postgres:

1. Set up a local Postgres database or use Vercel Postgres connection string
2. Create `.env` file in the `server` directory:
   ```
   POSTGRES_URL=your_postgres_connection_string
   OPENAI_API_KEY=your_openai_key
   PORT=5000
   NODE_ENV=development
   ```
3. Run the migration script to create tables
4. Start the server: `npm run dev` (in server directory)
5. Start the client: `npm start` (in client directory)

