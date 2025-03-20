# Use Node.js LTS
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install only production dependencies to make build faster
RUN npm install --only=prod
RUN npm install @angular/cli@19.1.7 @angular-devkit/build-angular@19.1.7

# Copy source code
COPY . .

# Build the Angular app for production
RUN npx ng build

# Use Nginx for serving the built app
FROM nginx:alpine

# Copy the built app from the build stage
COPY --from=build /app/dist/client/browser /usr/share/nginx/html

# Copy NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Environment variable for API URL (will be replaced at runtime)
ENV API_URL="http://backend:8080/api/"

# Use envsubst to replace environment variables in nginx config
CMD ["/bin/sh", "-c", "envsubst '$$API_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

# Expose port 80
EXPOSE 80 