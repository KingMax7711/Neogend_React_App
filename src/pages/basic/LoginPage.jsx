import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { IdCardLanyard, KeyRound, AlertTriangle } from "lucide-react";
import axios from "axios";
import clsx from "clsx";
import API from "../../global/API";
import { useAuthStore, initializeSessionFromToken } from "../../stores/authStore";
import acceuil_format2 from "../../assets/acceuil_format2.png";

let didCheckCookie = false; // garde module (persiste entre montages StrictMode)

function LoginPage() {
    const [errorMsg, setErrorMsg] = useState("");
    const [connectionStatus, setConnectionStatus] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { ensureSession, status, user } = useAuthStore();

    useEffect(() => {
        document.title = "Connexion - Neogend";
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
                        console.log("[LOGIN] Session existante -> redirection");
                        navigate("/home");
                    }
                } catch {
                    // pas de session valide: on reste sur la page
                }
            };
            tryRecover();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // pas de deps pour éviter les relances

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        if (loading) return; // Prevent multiple submissions
        setErrorMsg(""); // Reset error message
        const params = new URLSearchParams();
        params.append("username", data.nipol);
        params.append("password", data.password);

        try {
            setLoading(true);
            const response = await axios.post(`${API}/auth/token`, params, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                withCredentials: true, // Important for sending cookies
            });
            const access = response.data.access_token;
            await initializeSessionFromToken(access);
            // Après initialisation, vérifier si authentifié
            if (useAuthStore.getState().status === "authenticated") {
                navigate("/home");
            } else {
                setErrorMsg("Impossible de finaliser la session.");
            }
        } catch (error) {
            console.log(error);
            if (error.response && error.response.status === 401) {
                setErrorMsg(error.response.data.detail); // message de l’API
                setConnectionStatus(false);
            } else if (error.response && error.response.status === 403) {
                setErrorMsg(error.response.data.detail); // message de l’API
            } else {
                setErrorMsg("Une erreur est survenue.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 items-center justify-center">
            <div className="bg-base-200 p-6 rounded-3xl shadow-lg w-fit md:max-w-3xl">
                <div className="flex flex-col">
                    <div className="flex gap-8">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="flex flex-col justify-between items-center mt-3 mb-3 min-h-[320px]"
                        >
                            <div className=" text-left w-full">
                                <h1 className="text-4xl font-bold">Bon retour,</h1>
                                <h2 className="text-2xl font-bold  text-primary">
                                    Se connecter
                                </h2>
                            </div>
                            <div className="flex flex-col gap-4 md:min-w-80">
                                <div
                                    className={clsx("input", {
                                        "input-error": errors.nipol,
                                    })}
                                >
                                    <IdCardLanyard />
                                    <input
                                        type="number"
                                        className=""
                                        placeholder="NIPOL/NIGEND"
                                        {...register("nipol", { required: true })}
                                    />
                                </div>

                                {errors.nipol && (
                                    <div className="badge badge-error">
                                        NIPOL/NIGEND is required
                                    </div>
                                )}
                                <div
                                    className={clsx("input", {
                                        "input-error": errors.password,
                                    })}
                                >
                                    <KeyRound />
                                    <input
                                        type="password"
                                        className=""
                                        placeholder="Password"
                                        {...register("password", { required: true })}
                                    />
                                </div>
                                {errors.password && (
                                    <div className="badge badge-error">
                                        Password is required
                                    </div>
                                )}
                            </div>
                            {errorMsg && (
                                <div className="badge badge-error">{errorMsg}</div>
                            )}
                            <div className="flex flex-col gap-4 w-full items-left">
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        className={clsx("btn btn-primary w-2/3", {
                                            "btn-disabled": loading,
                                        })}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm mr-2" />
                                                Connexion...
                                            </>
                                        ) : (
                                            "Se connecter"
                                        )}
                                    </button>
                                </div>
                                <NavLink
                                    to="/register"
                                    className={clsx("link w-fit", {
                                        "text-accent animate-bounce font-bold":
                                            connectionStatus === false,
                                    })}
                                    style={{
                                        animationDuration: "1.2s",
                                        animationIterationCount: "infinite",
                                    }}
                                >
                                    Pas encore de compte ?
                                </NavLink>
                            </div>
                        </form>
                        <img
                            src={acceuil_format2}
                            alt="Image Acceuil"
                            className="w-auto max-h-[350px] h-auto rounded-3xl hidden md:block"
                        />
                    </div>
                    <NavLink
                        to="/conditions"
                        className="link mt-3 text-center text-sm italic no-underline hover:underline"
                    >
                        Conditions Générales D'utilisation et Politique de Confidentialité
                    </NavLink>
                    <p className="text-sm italic text-base-content/60 text-center mt-4 hidden md:block">
                        Crédit Photo : Gendarmerie Nationale
                    </p>
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

export default LoginPage;
