// URL de base de l'API configurable via variable d'environnement Vite
const envUrl =
    import.meta?.env?.VITE_API_URL && String(import.meta.env.VITE_API_URL).trim();

// Fallback: même hôte que le frontend, port 8000, protocole identique pour éviter le mixed content
const protocol =
    typeof window !== "undefined" && window.location?.protocol === "https:"
        ? "https"
        : "http";
const host =
    typeof window !== "undefined" && window.location?.hostname
        ? window.location.hostname
        : "localhost";
const fallbackUrl = `${protocol}://${host}:8000`;

const API = envUrl || fallbackUrl;

export default API;
