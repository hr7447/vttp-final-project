# Railway Deployment Fix Guide

## Problem Analysis

The current deployment is showing 404 errors when attempting to register a user or access API endpoints. We can see these issues:

1. 404 errors when trying to access `/api/auth/register`
2. Issues loading Bootstrap icons (404 for bootstrap-icons.woff2)
3. Possible issues with the NGINX configuration for proxying API requests

## Fix Steps

### 1. Update the Environment Variables

First, let's ensure the correct environment variables are set in Railway:

1. Go to your Railway project dashboard
2. Navigate to your frontend service
3. Click on "Variables"
4. Make sure `BACKEND_URL` is set correctly:
   ```
   BACKEND_URL=http://vttp-final-project.railway.internal:8080
   ```
   (Use the exact internal service name shown in Railway)

### 2. Redeploy the Frontend Service

The changes to NGINX configuration and Dockerfile will help fix the issues:

1. Commit and push the changes to your Git repository
2. Railway will automatically build and deploy the updated version
3. If not using automatic deployments, trigger a manual redeploy

### 3. Check Debug Pages

After redeployment, visit these debug pages to diagnose any remaining issues:

1. `/railway-debug.html` - Shows environment variables and API connectivity
2. `/env-info.html` - Shows API URL configuration
3. `/status.html` - Tests API connectivity
4. `/debug` - Shows NGINX environment variables
5. `/api-debug` - Tests API health endpoint

### 4. Verify Backend Service

1. Ensure your backend service is running correctly
2. Check the backend logs for any errors
3. Try accessing the API health endpoint directly: 
   ```
   https://<your-backend-service-url>/api/public/health
   ```

### 5. Test Registration

After making these changes:

1. Visit your application URL
2. Try to register a user
3. Check the browser console for any errors

## If Problems Persist

If you continue to encounter 404 errors:

1. Check the frontend service logs in Railway dashboard
2. Look for NGINX errors in the logs
3. Verify that the backend URL is correct in the logs (check X-Debug-Backend-URL header)
4. Ensure both services are in the same Railway project and private network

## Final Verification

Once fixed, you should be able to:

1. Register a new user
2. Log in with the registered credentials
3. Access all features of the application

The updated NGINX configuration and Dockerfile should resolve the issues with API proxying and Bootstrap icons. 