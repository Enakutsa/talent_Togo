#!/bin/sh
set -e

# ✅ Injecte le port réel (fourni par Render au runtime, ou 8000 en local)
# dans la conf Nginx, qui utilise un placeholder __PORT__ statique.
PORT="${PORT:-8000}"
sed -i "s/__PORT__/${PORT}/g" /etc/nginx/sites-available/default

# ⚠️ Comme dans le Dockerfile précédent : ces commandes sont exécutées
# au runtime (pas au build) car les variables d'environnement de la
# base de données ne sont connues qu'au démarrage du conteneur.
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
php artisan db:seed --class=CategorieSeeder --force
php artisan db:seed --class=AdminSeeder --force
php artisan storage:link || true

exec "$@"