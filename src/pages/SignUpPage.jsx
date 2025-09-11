import { NavLink } from "react-router";
import { useNavigate } from "react-router-dom";
import { Mail, KeyRound, CircleUserRound } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useEffect } from "react";
import API from "../global/API";
import "../App.css";
import gign1Img from "../assets/gign1.jpeg";

let didCheckCookie = false; // garde module (persiste entre montages StrictMode)

function SignUpPage() {
    const navigate = useNavigate();
    const { refreshAccess } = useAuthStore();

    useEffect(() => {
        document.title = "Inscription - Neogend";
    }, []);

    useEffect(() => {
        if (didCheckCookie) return;
        didCheckCookie = true;

        const checkCookie = async () => {
            try {
                const isValid = await refreshAccess();
                if (isValid) {
                    console.log("Old Session Found, Redirecting to Home");
                    navigate("/home");
                }
            } catch (error) {
                console.warn("Error checking cookie:", error);
            }
        };
        checkCookie();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // pas de deps pour éviter les relances

    return (
        <div className="flex flex-col gap-4 min-h-screen w-screen items-center justify-center bg-base-300">
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
        </div>
    );
}

export default SignUpPage;
