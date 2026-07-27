import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/src/index.jsx'],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js/src',
        },
    },
    build: {
        rollupOptions: {
            output: {
                // ── Sans ça, Rollup extrait automatiquement chaque
                // dépendance partagée entre plusieurs pages "lazy" (ex:
                // les icônes lucide-react) dans son propre petit fichier
                // séparé -> des dizaines de mini-requêtes HTTP au lieu
                // d'un chargement groupé. On force ici tout le code venant
                // de node_modules à rester dans UN SEUL fichier "vendor",
                // chargé une fois et mis en cache par le navigateur.
                // Les pages elles-mêmes restent bien splittées séparément
                // (le lazy loading par route continue de fonctionner).
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                },
            },
        },
    },
});