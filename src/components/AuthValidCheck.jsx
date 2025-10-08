import { useEffect, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import LoadingComponent from "./LoadingComponent";

// Nouveau guard basé sur la state machine du store
// Etats: initializing | recovering | authenticated | unauthenticated | forced-logout
// Comportement:
//  - initializing / recovering : tenter ensureSession puis afficher loading avec message approprié
//  - authenticated : Vérifier si inscription status == 'valid' -> afficher children ou redirect /home
//  - forced-logout / unauthenticated : redirect /login

function AuthValidCheck({ children }) {
    const navigate = useNavigate();
    const { status, user, ensureSession } = useAuthStore();
    const triedRef = useRef(false); // éviter double ensure initial dû à StrictMode

    useEffect(() => {
        // Redirections immédiates si fin de session
        if (status === "forced-logout" || status === "unauthenticated") {
            navigate("/login", { replace: true });
            return;
        }

        // Lancer ensureSession seulement si on est en phase de (re)construction
        if ((status === "initializing" || status === "recovering") && !triedRef.current) {
            triedRef.current = true;
            ensureSession().catch(() => {
                // L'état du store (status/error) pilote l'affichage; on ne gère rien ici
            });
        }
    }, [status, ensureSession, navigate]);

    if (status === "authenticated" && user) {
        if (user?.inscription_status === "valid") {
            return <>{children}</>;
        }
        return <Navigate to="/home" replace />;
    }

    if (status === "initializing")
        return <LoadingComponent message="Chargement de la session..." />;
    if (status === "recovering")
        return <LoadingComponent message="Reconnexion en cours..." />;

    // Par sécurité: autres états -> loading bref avant redirect effect
    return <LoadingComponent message="Redirection..." />;
}

export default AuthValidCheck;
