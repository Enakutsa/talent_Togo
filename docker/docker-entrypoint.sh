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

# ✅ CAUSE PROBABLE DES 502 SUR /admin : sans ça, Filament sert son CSS/JS
# dynamiquement via PHP à CHAQUE requête (vu dans le Network tab :
# /css/filament/filament/app.css passe par index.php, pas par un vrai
# fichier statique). Ça ajoute une charge PHP-FPM invisible à chaque
# navigation dans l'admin, en plus de la page elle-même -> sature vite
# les 4 processus dispo sous seulement 0.15 CPU (plan gratuit Render).
# Cette commande copie ces assets en vrais fichiers dans public/, que
# Nginx sert alors directement (regex .css/.js de nginx.conf), sans
# jamais solliciter PHP pour eux.
php artisan filament:assets || true

exec "$@"