#!/bin/bash
set -e

# Copy built application from build directory to volume if volume is empty
if [ ! -d "/var/www/project/vendor" ] && [ -d "/app-build/vendor" ]; then
    echo "Copying built application to shared volume..."
    cp -a /app-build/. /var/www/project/
    chown -R www-data:www-data /var/www/project
fi

# Create Symfony var directories if they don't exist
mkdir -p /var/www/project/var/cache/prod
mkdir -p /var/www/project/var/cache/dev
mkdir -p /var/www/project/var/log

# Set proper permissions for www-data user
chown -R www-data:www-data /var/www/project/var
chmod -R 775 /var/www/project/var

# Start cron in background
service cron start

# Execute the original command (php-fpm)
exec "$@"

