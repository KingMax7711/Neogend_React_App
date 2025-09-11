import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import LoadingComponent from "./LoadingComponent";

function ModAuthCheck({ children }) {
    const navigate = useNavigate();
    const { token, user, refreshAccess, fetchMe, clearAuth } = useAuthStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const accesGranted = ["mod", "admin", "owner"];

        const init = async () => {
            try {
                // 1) S’assurer d’avoir un access token (via refresh cookie si besoin)
                if (!token) {
                    await refreshAccess(); // peut throw si pas de refresh cookie
                }

                // 2) S’assurer d’avoir l’utilisateur hydraté
                let u = user;
                if (!u) {
                    u = await fetchMe(); // peut throw si token invalide
                }

                // 3) Vérifier le rôle staff
                if (u && !accesGranted.includes(u.privileges)) {
                    navigate("/home", { replace: true });
                    return;
                }

                if (!cancelled) setLoading(false);
            } catch {
                // Pas connecté ou token invalide -> login
                clearAuth();
                navigate("/login", { replace: true });
            }
        };

        init();
        return () => {
            cancelled = true;
        };
    }, [token, user, refreshAccess, fetchMe, clearAuth, navigate]);

    if (loading) return <LoadingComponent />; // rien ne s’affiche tant que non validé
    return <>{children}</>;
}

export default ModAuthCheck;
