FROM php:8.2-cli

# Dépendances système
RUN apt-get update && apt-get install -y \
    git curl libpq-dev libzip-dev zip unzip nodejs npm libicu-dev

# Extensions PHP
RUN docker-php-ext-install pdo pdo_pgsql zip intl

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Dossier de travail
WORKDIR /app

# Copier projet
COPY . .

# Installation dépendances PHP
RUN composer install --no-dev --optimize-autoloader

# Build frontend
RUN npm install && npm run build

# ✅ NE PAS METTRE artisan ici ❌
# (ça cassait ton build)

# Port
EXPOSE 8000

# ✅ LANCEMENT PROPRE
CMD php artisan migrate --force && \
    php artisan storage:link && \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
