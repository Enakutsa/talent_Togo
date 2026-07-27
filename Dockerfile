FROM php:8.2-cli
RUN apt-get update && apt-get install -y \
    git curl libpq-dev libzip-dev zip unzip nodejs npm libicu-dev
RUN docker-php-ext-install pdo pdo_pgsql zip intl

# ✅ Augmente les limites PHP pour permettre l'upload de fichiers plus lourds
# (portfolio jusqu'à 20 Mo, documents justificatifs, photos de profil)
RUN { \
    echo 'upload_max_filesize = 25M'; \
    echo 'post_max_size = 30M'; \
    echo 'memory_limit = 256M'; \
    echo 'max_execution_time = 120'; \
} > /usr/local/etc/php/conf.d/uploads.ini

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY . .
RUN composer install --no-dev --optimize-autoloader
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm install && npm run build
EXPOSE 8000
CMD php artisan migrate --force && \
    php artisan db:seed --class=CategorieSeeder --force && \
    php artisan db:seed --class=AdminSeeder --force && \
    php artisan storage:link && \
    (php artisan queue:work --tries=1 -v &) && \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8000}