import { Children, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import LoadingComponent from "./LoadingComponent";

function AuthCheck({ children }) {
    const navigate = useNavigate();
    const { token, refreshAccess, clearAuth } = useAuthStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            if (!token) {
                try {
                    await refreshAccess(); // récupère un nouveau token
                    // eslint-disable-next-line no-unused-vars
                } catch (err) {
                    clearAuth();
                    navigate("/login");
                }
            }
            setLoading(false);
        };

        init();
    }, [token, navigate, refreshAccess, clearAuth]);

    if (loading) return <LoadingComponent />;
    return <>{children}</>; // invisible, il ne sert qu’à gérer l’auth
}

export default AuthCheck;
