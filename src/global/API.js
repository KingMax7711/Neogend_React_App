// URL de base de l'API configurable via variable d'environnement Vite
const envUrl =
    import.meta?.env?.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim();

// Fallback: même origine via le reverse proxy (/api)
const API = envUrl || "/api";

export default API;
