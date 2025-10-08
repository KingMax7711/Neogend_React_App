import { useEffect, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import LoadingComponent from "./LoadingComponent";

// Guard admin: même logique qu'AuthCheck mais ajoute contrôle privilèges
// Redirections:
//  - forced-logout / unauthenticated -> /login
//  - authenticated sans privilège admin/owner -> /home

function AdminAuthCheck({ children }) {
    const navigate = useNavigate();
    const { status, user, ensureSession } = useAuthStore();
    const triedRef = useRef(false);
    const allowed = ["admin", "owner"]; // privileges autorisés

    useEffect(() => {
        if (status === "forced-logout" || status === "unauthenticated") {
            navigate("/login", { replace: true });
            return;
        }
        if ((status === "initializing" || status === "recovering") && !triedRef.current) {
            triedRef.current = true;
            ensureSession().catch(() => {});
        }
    }, [status, ensureSession, navigate]);

    if (status === "authenticated" && user) {
        if (!allowed.includes(user.privileges)) {
            return <Navigate to="/home" replace />;
        }
        return <>{children}</>;
    }

    if (status === "initializing")
        return <LoadingComponent message="Chargement de la session..." />;
    if (status === "recovering")
        return <LoadingComponent message="Reconnexion en cours..." />;

    return <LoadingComponent message="Redirection..." />;
}

export default AdminAuthCheck;
