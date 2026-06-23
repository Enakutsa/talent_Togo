FROM php:8.2-cli

# Dépendances système
RUN apt-get update && apt-get install -y \
    git curl libpq-dev libzip-dev zip unzip nodejs npm libicu-dev

# Extensions PHP nécessaires
RUN docker-php-ext-install pdo pdo_pgsql zip intl

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Dossier de travail
WORKDIR /app
COPY . .

# Installation PHP
RUN composer install --no-dev --optimize-autoloader

# Build frontend
RUN npm install && npm run build

# Nettoyage cache Laravel
RUN php artisan config:clear
RUN php artisan cache:clear
RUN php artisan route:clear

# Exposition du port
EXPOSE 8000

# ✅ COMMANDE FINALE CORRIGÉE
CMD php artisan migrate --force && \
    php artisan storage:link && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan serve --host 0.0.0.0 --port ${PORT:-8000}