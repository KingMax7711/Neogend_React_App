import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Remonte la page tout en haut à chaque changement de route.
// Inclut un raf + timeout pour contrer certains comportements mobiles (restauration de scroll).
export default function ScrollToTop({ behavior = "auto" }) {
    const { pathname, search } = useLocation();

    useEffect(() => {
        // Scroll immédiat
        try {
            window.scrollTo({ top: 0, left: 0, behavior });
        } catch {
            window.scrollTo(0, 0);
        }

        // Après le paint
        const rafId = requestAnimationFrame(() => {
            try {
                window.scrollTo({ top: 0, left: 0, behavior: "auto" });
            } catch {
                window.scrollTo(0, 0);
            }
        });

        // Et un léger délai (certains navigateurs mobiles restaurent le scroll tardivement)
        const tId = setTimeout(() => {
            try {
                window.scrollTo({ top: 0, left: 0, behavior: "auto" });
            } catch {
                window.scrollTo(0, 0);
            }
        }, 120);

        return () => {
            cancelAnimationFrame(rafId);
            clearTimeout(tId);
        };
    }, [pathname, search, behavior]);

    return null;
}
