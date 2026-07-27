FROM php:8.2-cli
RUN apt-get update && apt-get install -y \
    git curl libpq-dev libzip-dev zip unzip nodejs npm libicu-dev
RUN docker-php-ext-install pdo pdo_pgsql zip intl opcache

# ✅ Augmente les limites PHP pour permettre l'upload de fichiers plus lourds
# (portfolio jusqu'à 20 Mo, documents justificatifs, photos de profil)
RUN { \
    echo 'upload_max_filesize = 25M'; \
    echo 'post_max_size = 30M'; \
    echo 'memory_limit = 256M'; \
    echo 'max_execution_time = 120'; \
} > /usr/local/etc/php/conf.d/uploads.ini

# ✅ OPcache : sans ça, PHP recompile tout le framework Laravel (+vendor)
# à chaque requête, ce qui est très coûteux sur un CPU partagé/limité
# comme le plan gratuit Render. Avec OPcache, le code compilé reste en
# mémoire entre les requêtes -> gain de performance important.
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
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm install && npm run build
EXPOSE 8000

# ⚠️ config:cache / route:cache / view:cache sont faits ICI (au CMD,
# donc au démarrage du conteneur) et non au moment du build (RUN) :
# les variables d'environnement (DB_HOST, DB_PASSWORD, etc. définies
# sur Render) ne sont disponibles qu'au runtime, pas pendant le build.
# Les mettre en cache trop tôt figerait de mauvaises valeurs.
CMD php artisan config:cache && \
    php artisan route:cache && \
    php artisan view:cache && \
    php artisan migrate --force && \
    php artisan db:seed --class=CategorieSeeder --force && \
    php artisan db:seed --class=AdminSeeder --force && \
    php artisan storage:link && \
    (php artisan queue:work --tries=1 -v &) && \
    php artisan serve --host=0.0.0.0 --port=${PORT:-8000}