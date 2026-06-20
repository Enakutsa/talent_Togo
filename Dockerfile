FROM php:8.2-cli

# Dépendances système
RUN apt-get update && apt-get install -y \
    git curl libpq-dev libzip-dev zip unzip nodejs npm

# Extensions PHP nécessaires à Laravel + PostgreSQL
RUN docker-php-ext-install pdo pdo_pgsql zip

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

# Installation des dépendances
RUN composer install --no-dev --optimize-autoloader
RUN npm install && npm run build

# Nettoyage config
RUN php artisan config:clear

# Exposition du port dynamique
EXPOSE $PORT

# Commande de démarrage
CMD php artisan migrate --force && php artisan storage:link && php artisan serve --host 0.0.0.0 --port $PORT
