import { NavLink, useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useEffect } from "react";

import gign1Img from "../../assets/gign1.jpeg";

let didCheckCookie = false; // garde module (persiste entre montages StrictMode)

function SignUpPage() {
    const navigate = useNavigate();
    const { ensureSession, status, user } = useAuthStore();

    useEffect(() => {
        document.title = "Inscription - Neogend";
        if (!didCheckCookie) {
            didCheckCookie = true;
            const tryRecover = async () => {
                if (user && status === "authenticated") {
                    navigate("/home");
                    return;
                }
                try {
                    const me = await ensureSession();
                    if (me) {
                        console.log("[REGISTER] Session existante -> redirection");
                        navigate("/home");
                    }
                } catch {
                    // rester sur inscription
                }
            };
            tryRecover();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // pas de deps pour éviter les relances // pas de deps pour éviter les relances

    return (
        <div className="flex flex-col flex-1 items-center justify-center">
            <div className="bg-base-200 p-6 rounded-3xl shadow-lg w-fit max-w-3xl">
                <div className="flex flex-col">
                    <div className="flex gap-8">
                        <div className="flex flex-col justify-between items-center md:items-start mt-3 mb-3 min-h-[320px] md:min-w-80">
                            <div className="text-left w-full">
                                <h1 className="text-4xl font-bold">Bienvenue,</h1>
                                <h2 className="text-2xl font-bold text-primary">
                                    Inscription
                                </h2>
                            </div>
                            <div className="bg-base-300 p-4 rounded-xl text-sm md:text-base max-w-prose">
                                <p>
                                    Pour créer votre compte, merci de contacter un
                                    administrateur sur l’un de nos serveurs Discord. Votre
                                    accès sera validé manuellement après vérifications.
                                </p>
                                <p className="mt-3 opacity-80">
                                    Cette procédure garantit la sécurité et l’intégrité de
                                    nos services.
                                </p>
                            </div>
                            <div className="flex flex-col md:flex-row gap-2 w-full justify-between">
                                <a
                                    href="https://discord.gg/bvXveeKxaT"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary w-full md:w-56"
                                >
                                    Rejoindre France RolePlay
                                </a>
                                <a
                                    href="https://discord.gg/serveur2"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary w-full md:w-56"
                                >
                                    Rejoindre Breizh RP
                                </a>
                            </div>
                            <NavLink
                                to="/login"
                                className="link italic no-underline hover:underline w-fit"
                            >
                                Déjà un compte ?
                            </NavLink>
                        </div>
                        <img
                            src={gign1Img}
                            alt="GIGN"
                            className="w-auto max-h-[350px] h-auto rounded-3xl hidden md:block"
                        />
                    </div>
                    <NavLink
                        to="/conditions"
                        className="link mt-3 text-center text-sm italic no-underline hover:underline"
                    >
                        Conditions Générales D'utilisation et Politique de Confidentialité
                    </NavLink>
                </div>
            </div>
            <div className="w-full max-w-3xl mx-auto mt-4 px-4">
                <div
                    className="alert alert-warning shadow-md border border-warning"
                    role="alert"
                    aria-live="polite"
                >
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div>
                        <h3 className="font-bold">Avertissement</h3>
                        <div className="text-sm leading-snug">
                            Ce site est un projet communautaire et n'est pas un site
                            officiel. Il n'est en aucun cas affilié à l'État français, ni
                            au Ministère de l'Intérieur ni à toute administration
                            publique.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUpPage;
