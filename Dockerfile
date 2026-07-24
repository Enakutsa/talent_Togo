FROM php:8.2-cli
RUN apt-get update && apt-get install -y \
    git curl libpq-dev libzip-dev zip unzip nodejs npm libicu-dev
RUN docker-php-ext-install pdo pdo_pgsql zip intl
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY . .
RUN composer install --no-dev --optimize-autoloader
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm install && npm run build
EXPOSE 8000
# ✅ FORCE RESET DB (IMPORTANT)
CMD php artisan migrate:fresh --force && \
    php artisan db:seed --class=CategorieSeeder --force && \
    php artisan db:seed --class=AdminSeeder --force && \
    php artisan storage:link && \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8000}