#!/bin/bash

# Deployment script for Permitsy application

echo "===== Starting Permitsy Deployment ====="

# Navigate to project directory
cd /path/to/www.permitsy.com  # Change this to your project path

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Using Express server
if [ "$1" == "express" ]; then
    echo "Setting up Express server..."
    
    # Install Express server dependencies if not already installed
    npm install express compression
    
    # Start the server using PM2 for process management
    if command -v pm2 &> /dev/null; then
        echo "Starting server with PM2..."
        pm2 stop permitsy 2>/dev/null || true
        pm2 delete permitsy 2>/dev/null || true
        pm2 start server.js --name permitsy
        pm2 save
    else
        echo "PM2 not found. Installing PM2..."
        npm install -g pm2
        pm2 start server.js --name permitsy
        pm2 save
        
        # Set up PM2 to start on system boot
        pm2 startup
    fi
    
    echo "Express server is running!"
    echo "Your application should be accessible at http://your-server-ip:3000"

# Using Nginx
elif [ "$1" == "nginx" ]; then
    echo "Setting up Nginx server..."
    
    # Check if Nginx is installed
    if ! command -v nginx &> /dev/null; then
        echo "Nginx not found. Installing Nginx..."
        sudo apt update
        sudo apt install -y nginx
    fi
    
    # Create directory for the application
    sudo mkdir -p /var/www/permitsy/dist
    
    # Copy build files
    echo "Copying build files to Nginx directory..."
    sudo cp -r dist/* /var/www/permitsy/dist/
    
    # Set proper permissions
    sudo chown -R www-data:www-data /var/www/permitsy
    
    # Copy Nginx configuration
    sudo cp permitsy-nginx.conf /etc/nginx/sites-available/permitsy
    
    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/permitsy /etc/nginx/sites-enabled/
    
    # Test Nginx configuration
    echo "Testing Nginx configuration..."
    sudo nginx -t
    
    # Restart Nginx
    echo "Restarting Nginx..."
    sudo systemctl restart nginx
    
    echo "Nginx setup complete!"
    echo "Your application should be accessible at http://your-domain.com"
    echo "Make sure to set up your domain to point to your server IP"

else
    echo "Please specify deployment method: express or nginx"
    echo "Usage: ./deploy.sh express|nginx"
    exit 1
fi

echo "===== Deployment Complete =====" 