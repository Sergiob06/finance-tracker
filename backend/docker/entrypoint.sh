#!/bin/sh
set -e

cd /var/www/html

if [ ! -f vendor/autoload.php ]; then
  echo "Installing Composer dependencies..."
  composer install --no-interaction --prefer-dist
fi

if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
fi

if ! grep -q "^APP_KEY=base64" .env; then
  echo "Generating application key..."
  php artisan key:generate --force --no-interaction
fi

echo "Waiting for the database..."
until php artisan migrate --force; do
  sleep 2
done

# Seed only on a fresh database, so restarting the stack never duplicates
# (or wipes) demo data. Use "docker compose down -v" to reset and reseed.
USER_COUNT=$(php artisan tinker --execute='echo \App\Models\User::count();' 2>/dev/null | tail -1)
if [ "$USER_COUNT" = "0" ]; then
  echo "Seeding demo data..."
  php artisan db:seed --force
fi

php artisan storage:link 2>/dev/null || true

exec php artisan serve --host=0.0.0.0 --port=8000
