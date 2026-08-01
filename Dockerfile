FROM node:20-slim AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build


FROM php:8.2-fpm

# --- Dépendances système + Nginx + Supervisor ---
# ⚠️ Pas de nodejs/npm ici : sur Debian, le paquet npm tire ~600
# sous-dépendances et rend le build interminable. Node est utilisé
# uniquement dans le stage "frontend-build" ci-dessus (image officielle
# node:20-slim, propre et rapide), puis on ne récupère que le résultat
# compilé (public/build) dans cette image finale.
RUN apt-get update && apt-get install -y \
    git curl libpq-dev libzip-dev zip unzip libicu-dev \
    nginx supervisor \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo pdo_pgsql zip intl opcache

# ✅ Limites PHP pour l'upload (portfolio, photos, documents)
# ✅ expose_php = Off : masque la version PHP exacte dans les headers
# HTTP (x-powered-by), pour ne pas donner d'indice facile à un
# attaquant sur les failles connues d'une version précise.
RUN { \
    echo 'upload_max_filesize = 25M'; \
    echo 'post_max_size = 30M'; \
    echo 'memory_limit = 256M'; \
    echo 'max_execution_time = 120'; \
    echo 'expose_php = Off'; \
} > /usr/local/etc/php/conf.d/uploads.ini

# ✅ OPcache : évite de recompiler tout Laravel à chaque requête
RUN { \
    echo 'opcache.enable=1'; \
    echo 'opcache.enable_cli=0'; \
    echo 'opcache.memory_consumption=128'; \
    echo 'opcache.interned_strings_buffer=16'; \
    echo 'opcache.max_accelerated_files=20000'; \
    echo 'opcache.validate_timestamps=0'; \
} > /usr/local/etc/php/conf.d/opcache.ini

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /app
COPY . .
RUN composer install --no-dev --optimize-autoloader

# ✅ Récupère uniquement les assets déjà compilés (JS/CSS finaux),
# pas besoin de Node ni du code source frontend dans cette image.
COPY --from=frontend-build /app/public/build ./public/build

# --- Permissions Laravel (storage + cache doivent être writable par www-data) ---
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

# --- Config Nginx, Supervisor, PHP-FPM ---
COPY docker/nginx.conf /etc/nginx/sites-available/default
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]