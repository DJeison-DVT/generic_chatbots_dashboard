FROM node:20.14.0 AS build
WORKDIR /app

ARG VITE_REACT_APP_API_URL
ARG VITE_REACT_APP_TOKEN_NAME
ARG VITE_REACT_APP_BUCKET_URL

ENV VITE_REACT_APP_API_URL=$VITE_REACT_APP_API_URL
ENV VITE_REACT_APP_TOKEN_NAME=$VITE_REACT_APP_TOKEN_NAME
ENV VITE_REACT_APP_BUCKET_URL=$VITE_REACT_APP_BUCKET_URL

# Install dependencies including tzdata
RUN apt-get update && apt-get install -y \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# Set the timezone environment variable
ENV TZ=America/Mexico_City
RUN ln -fs /usr/share/zoneinfo/$TZ /etc/localtime && dpkg-reconfigure --frontend noninteractive tzdata


COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build


# Stage 2: Serve the app with nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf


# Copy built files from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html
COPY ./docker/docker-entrypoint.sh /docker-entrypoint.sh
# Make the entrypoint script executable
RUN chmod +x /docker-entrypoint.sh

# Expose port 80 for Nginx
EXPOSE 80

# Set the entrypoint to the environment injection script
ENTRYPOINT ["/docker-entrypoint.sh"]