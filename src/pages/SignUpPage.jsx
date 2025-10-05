import { NavLink } from "react-router";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useEffect } from "react";
import API from "../global/API";
import "../App.css";
import gign1Img from "../assets/gign1.jpeg";

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
        <div className="flex flex-col flex-1 gap-4 items-center justify-center">
            <div className="flex gap-8 bg-base-200 p-6 rounded-3xl shadow-lg max-w-3xl">
                <div className="flex flex-col gap-4 justify-between md:w-2/3">
                    <h1 className="text-4xl font-bold text-center text-neutral">
                        NEOGEND
                    </h1>
                    <p className="text-center bg-base-300 p-4 rounded-xl">
                        Bienvenue sur notre intranet dédiée à la Gendarmerie et à la
                        Police !<br />
                        <br />
                        Pour finaliser votre inscription, contactez simplement un
                        administrateur sur l’un de nos serveurs Discord.
                        <br />
                        <br />
                        Il validera votre accès et pourra répondre à toutes vos questions.
                    </p>
                    <NavLink
                        to="/login"
                        className="btn btn-info w-fit text-center mx-auto"
                    >
                        👮‍♂️ Déjà un compte ?
                    </NavLink>
                    <div className="flex flex-col md:flex-row gap-2 mt-4 items-center justify-center ">
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
                </div>
                <img
                    src={gign1Img}
                    alt="GIGN"
                    className="w-auto max-h-[420px] h-auto rounded-3xl hidden md:block"
                />
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
