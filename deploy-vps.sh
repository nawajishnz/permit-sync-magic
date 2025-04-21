#!/bin/bash

# Simple deployment script for VPS
echo "===== Starting Permitsy VPS Deployment ====="

# Stop any running node process
echo "Stopping any running node processes..."
pkill -f node || true

# Install dependencies
echo "Installing dependencies..."
npm install

# Ensure .env file exists with Supabase credentials
if [ ! -f .env ]; then
  echo "Creating .env file with Supabase credentials..."
  cat > .env << EOL
VITE_SUPABASE_URL=https://zewkainvgxtlmtuzgvjg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpld2thaW52Z3h0bG10dXpndmpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNzY4MDMsImV4cCI6MjA1ODc1MjgwM30.j0-qB84p-aYyXDdGX0ycfqL9hIGnOwizDvNpfZOkHQ4
NODE_ENV=production
EOL
fi

# Build the application
echo "Building the application..."
npm run build

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
  echo "Installing PM2..."
  npm install -g pm2
fi

# Start the application with PM2
echo "Starting the application with PM2..."
pm2 delete permitsy 2>/dev/null || true
pm2 start server.js --name permitsy

# Save PM2 process list
pm2 save

echo ""
echo "===== Deployment complete! ====="
echo "Your application should now be running at http://YOUR_SERVER_IP:3000"
echo ""
echo "To check the application logs, run: pm2 logs permitsy"
echo "To restart the application, run: pm2 restart permitsy"
echo "To stop the application, run: pm2 stop permitsy" 