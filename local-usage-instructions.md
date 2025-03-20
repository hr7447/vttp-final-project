# Local Development Instructions

## Prerequisites

- Docker and Docker Compose installed on your machine
- Git to clone the repository

## Running the Application Locally

1. Clone the repository:
   ```
   git clone <your-repository-url>
   cd finalproject
   ```

2. Start all services using Docker Compose:
   ```
   docker-compose up -d
   ```

   This will start:
   - MySQL database
   - Redis cache
   - MailHog for email testing
   - Backend Spring Boot service
   - Frontend Angular service

3. Wait for all services to start up (typically 1-2 minutes)

4. Access the application:
   - Frontend UI: http://localhost
   - Backend API: http://localhost:8080/api
   - API Health Check: http://localhost:8080/api/public/health
   - Email Testing UI: http://localhost:8025

## Testing Features

### 1. Leaflet Maps

The task map feature is available at http://localhost/map. This shows a map with:
- Randomly generated locations for your tasks
- Clickable markers with task details in popups
- Zoom controls to navigate the map

### 2. Email Testing

All emails sent by the application are captured by MailHog. You can view these at http://localhost:8025.

The application sends emails for:
- Welcome emails when users register
- Task sharing notifications
- Task reminders

To test email functionality:
1. Register a new user
2. Create tasks
3. Share tasks with other users
4. Check the MailHog interface (http://localhost:8025) to see the captured emails

## Common Issues and Fixes

### 1. Quote API Not Working

If you see a static quote that doesn't change:

- Verify the QUOTE_API_KEY in docker-compose.yml is correct
- Check backend logs for any API connection errors:
  ```
  docker logs server
  ```
- The application will fall back to a default quote if the API connection fails

### 2. Modern Styling Issues

If the styling looks incorrect:

- Make sure your browser can access the CDN URLs for Bootstrap:
  - https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css
  - https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css

- Some style elements might not load properly in private browsing mode or with certain content blockers
- We've added fallback styles to handle most basic styling issues

### 3. Map Not Loading

If the Leaflet map doesn't display properly:

- Check if your browser can access the Leaflet CDN:
  - https://unpkg.com/leaflet@1.9.4/dist/leaflet.js
  - https://unpkg.com/leaflet@1.9.4/dist/leaflet.css

- Try accessing the maps page directly: http://localhost/map
- Check browser console for any JavaScript errors

### 4. Email Not Working

If email features are not working:

- MailHog provides a test SMTP server that captures all outgoing emails
- Verify MailHog is running: `docker ps | grep mailhog`
- Access the MailHog web interface at http://localhost:8025
- Check backend logs for any mail-related errors: `docker logs server`

### 5. Database Connection Issues

If you encounter database errors:

- Check if MySQL is running:
  ```
  docker ps | grep mysql
  ```
- Verify the database connection settings in docker-compose.yml
- Reset the database container if needed:
  ```
  docker-compose stop mysql
  docker-compose rm -f mysql
  docker-compose up -d mysql
  ```

## Stopping the Application

To stop all services:
```
docker-compose down
```

To completely reset (including database data):
```
docker-compose down -v
``` 