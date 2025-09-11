import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        host: true, // ou '0.0.0.0' pour exposer sur ton réseau local
        https: {
            key: "../certs/dev-key.pem",
            cert: "../certs/dev-cert.pem",
        },
        port: 5173, // optionnel, fixe le port
    },
});
