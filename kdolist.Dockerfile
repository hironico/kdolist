# Use an official Node.js runtime as a parent image
FROM node:22.22.1-trixie-slim
 
# Set the working directory in the container for server
WORKDIR /app/server
 
# Copy package.json and package - lock.json to the working directory
COPY ./server/package*.json ./
 
# Install application dependencies for server
RUN npm install
 
# Copy the rest of the application server code
COPY ./server/src/ /app/server/src/
COPY ./server/*.sh /app/server/

# Copy the client code

WORKDIR /app/client

COPY ./client/dist/. /app/client/dist/
 
# Expose the port the app runs on
EXPOSE 3000
 
WORKDIR /app/server

# Define the command to run your app
CMD ["node", "./src/index.js"]

# MULTI ARCHITECTURE build with the following commands: 
# First, initialise the manifest
# podman manifest create docker.io/hironico/kdolist:1.5.2

# Build the image attaching them to the manifest
# podman build --platform linux/amd64,linux/arm64 --manifest docker.io/hironico/kdolist:1.5.2 -f kdolist.Dockerfile .

# Finally publish the manifest
# podman manifest push docker.io/hironico/kdolist:1.5.2