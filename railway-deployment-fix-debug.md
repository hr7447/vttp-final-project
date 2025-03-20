# Railway Deployment Troubleshooting Guide

## Current Issues

Based on the debug screenshots and logs, we've identified these specific issues:

1. **Backend API Authentication Issue**: The backend API endpoint `/api/public/health` is returning a 401 Unauthorized error.

2. **Frontend-Backend Connection**: The frontend is unable to connect properly to the backend service.

3. **NGINX Configuration Problems**: Debug endpoints not showing proper environment variables.

## Step 1: Fix Backend Security Configuration

We've updated the `WebSecurityConfig.java` file to ensure public endpoints are properly accessible:

1. Added explicit permission for `/api/public/health`
2. Updated CORS configuration to allow HTTP requests during testing
3. Added a `/railway-check` endpoint to the PublicController with detailed system information

## Step 2: Fix Frontend Configuration

We've updated the frontend with improved debugging tools:

1. Created a comprehensive `/connection-test.html` page that tests:
   - Static file loading
   - API connectivity
   - Registration endpoint

2. Enhanced debug information through:
   - `/env-info.html` with clearer display of environment variables
   - `/railway-debug.html` with detailed backend connection tests

3. Added proper Bootstrap icon handling to fix the 404 errors

## Step 3: Check Environment Variables

The most critical step is ensuring proper environment variables:

1. In Railway dashboard, go to your frontend service
2. Click on "Variables"
3. Verify `BACKEND_URL` is set correctly:
   ```
   BACKEND_URL=http://vttp-final-project.railway.internal:8080
   ```
   (Use your exact service name as shown in Railway)

## Step 4: Test Connection Using New Debug Tools

After redeploying, visit these new debug pages:

1. `/connection-test.html` - Comprehensive test of API connections
2. `/railway-debug.html` - Click "Test Backend URLs" to try multiple connection options
3. `/debug` - View raw NGINX environment variables

## Step 5: Common Issues and Solutions

### Backend URL Issues

If your debug pages show the backend URL as incorrect:

1. **Wrong Service Name**: Make sure the service name in `BACKEND_URL` matches exactly what's shown in Railway
2. **Protocol Issues**: Make sure to include `http://` in the URL
3. **Port Issues**: Include the correct port (usually 8080 for Spring Boot)

Example correct URL format:
```
http://vttp-final-project.railway.internal:8080
```

### Security Issues

If you still get 401 errors:

1. Verify the updates to WebSecurityConfig.java were deployed
2. Try accessing `/api/public/railway-check` directly to test less common endpoints
3. Check backend logs for authentication errors

### Network Issues

If you see connection timeouts or network errors:

1. Ensure both services are in the same Railway project
2. Verify private networking is enabled in Railway project settings
3. Try setting `BACKEND_URL` to the public URL temporarily for testing

## Step 6: Complete Redeploy (If Needed)

If problems persist after the above steps, consider a clean redeploy:

1. Delete both services in Railway
2. Create a new project with both services
3. Deploy the backend first
4. Once backend is running, deploy the frontend
5. Set the correct environment variables
6. Test with the new debug tools

## Verifying Fix

After implementing these changes, you should see:

1. `/connection-test.html` showing green checkmarks for all tests
2. Registration and login working properly
3. No more 401 errors when accessing public API endpoints

If you continue to face issues, check the Railway logs for both services and use the debug tools to identify the specific problem. 