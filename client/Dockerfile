FROM node:18.19-alpine AS build
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Skip canvas installation in CI environments
ENV SKIP_CANVAS=1
ENV NODE_ENV=development

# Install dependencies including devDependencies required for build
RUN npm install --no-optional --legacy-peer-deps

# Copy application code
COPY . .

# Build the app using local Angular CLI
RUN npm run build -- --configuration=production

# Setup NGINX
FROM nginx:alpine
COPY --from=build /app/dist/client/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Set API URL environment variable
ENV API_URL="http://backend:8080/api/"

# Template the nginx config and start nginx
CMD ["/bin/sh", "-c", "envsubst '$$API_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
EXPOSE 80 