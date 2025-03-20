# Railway Deployment Guide

This guide will help you deploy the Task Manager application on Railway.

## Prerequisites

1. A Railway account
2. Git
3. Railway CLI (optional but recommended)

## Step 1: Set Up Railway

1. Log in to your Railway account
2. Create a new project
3. Choose "Deploy from GitHub repo"
4. Connect your GitHub account and select your repository

## Step 2: Add MySQL and Redis Services

1. In your Railway project, click "New Service" → "Database" → "MySQL"
2. Wait for the MySQL instance to be provisioned
3. Click "New Service" → "Database" → "Redis"
4. Wait for the Redis instance to be provisioned

## Step 3: Deploy the Backend Service

1. In your Railway project, click "New Service" → "GitHub Repo"
2. Select your repository
3. Under settings, set the root directory to `/server`
4. Add the following environment variables:
   - `MYSQL_URL`: ${MYSQL_URL} (Railway will set this automatically)
   - `MYSQLUSER`: ${MYSQLUSER} (Railway will set this automatically)
   - `MYSQLPASSWORD`: ${MYSQLPASSWORD} (Railway will set this automatically)
   - `REDISHOST`: ${REDISHOST} (Railway will set this automatically)
   - `REDISPORT`: ${REDISPORT} (Railway will set this automatically)
   - `REDISPASSWORD`: ${REDISPASSWORD} (Railway will set this automatically)
   - `JWT_SECRET`: (generate a secure random string)
   - `QUOTE_API_KEY`: (optional, your API Ninjas API key)

5. Deploy the service

## Step 4: Deploy the Frontend Service

1. In your Railway project, click "New Service" → "GitHub Repo"
2. Select your repository
3. Under settings, set the root directory to `/client`
4. Add the following environment variable:
   - `API_URL`: http://{backend-service-name}.railway.internal:8080/api/

5. Deploy the service

## Step 5: Enable Private Networking

1. In your Railway project settings, ensure that "Private Networking" is enabled

## Step 6: Set Up a Domain (Optional)

1. In your Railway project, go to the frontend service
2. Click "Settings" → "Domains"
3. Click "Generate Domain" or "Custom Domain"

## Troubleshooting

### Common Issues:

1. **Backend not accessible from frontend**
   - Check that private networking is enabled
   - Verify that the `API_URL` environment variable is correct
   - The backend service URL should be in the format `http://{service-name}.railway.internal:8080/api/`

2. **Database connection issues**
   - Verify that the MySQL environment variables are correctly set
   - Check the logs for SQL connection errors

3. **Authentication issues**
   - Ensure that the `JWT_SECRET` is set properly
   - Check CORS configuration if requests are being blocked

### Debugging:

If you encounter issues, check the logs for both frontend and backend services in the Railway dashboard.

## Verifying Deployment

1. Access your application through the domain provided by Railway
2. Register a new user to test the backend connectivity
3. Test all main features

## Notes on Railway Environment

- Railway automatically injects database credentials as environment variables
- Private networking allows internal communication between services
- Each service gets its own URL and can also be given a custom domain 