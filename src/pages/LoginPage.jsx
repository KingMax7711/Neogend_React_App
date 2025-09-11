import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Mail, KeyRound } from "lucide-react";
import axios from "axios";
import clsx from "clsx";
import API from "../global/API";
import { useAuthStore } from "../stores/authStore";
import "../App.css";
import gign1Img from "../assets/gign1.jpeg";

let didCheckCookie = false; // garde module (persiste entre montages StrictMode)

function LoginPage() {
    const [errorMsg, setErrorMsg] = useState("");
    const [connectionStatus, setConnectionStatus] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { refreshAccess, setToken } = useAuthStore();

    useEffect(() => {
        document.title = "Login";
        if (didCheckCookie) return;
        didCheckCookie = true;

        const checkCookie = async () => {
            try {
                const isValid = await refreshAccess();
                console.log("Old Session Found, Redirecting to Home");
                setLoading(isValid);
                if (isValid) navigate("/home");
            } catch (error) {
                console.error("Error checking cookie:", error);
            }
        };
        checkCookie();
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
        params.append("username", data.email);
        params.append("password", data.password);

        try {
            setLoading(true);
            const response = await axios.post(`${API}/auth/token`, params, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                withCredentials: true, // Important for sending cookies
            });
            setToken(response.data.access_token); // Set the token in the store
            navigate("/home"); // Redirect to home page
        } catch (error) {
            console.log(error);
            if (error.response && error.response.status === 401) {
                setErrorMsg(error.response.data.detail); // message de l’API
                setConnectionStatus(false);
            } else {
                setErrorMsg("Une erreur est survenue.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-base-300">
            <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
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
                                className={clsx("input", { "input-error": errors.email })}
                            >
                                <Mail />
                                <input
                                    type="email"
                                    className=""
                                    placeholder="Email"
                                    {...register("email", { required: true })}
                                />
                            </div>

                            {errors.email && (
                                <div className="badge badge-error">Email is required</div>
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
                        {errorMsg && <div className="badge badge-error">{errorMsg}</div>}
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
                                🎉 Pas encore de compte ?
                            </NavLink>
                        </div>
                    </form>
                    <img
                        src={gign1Img}
                        alt="GIGN"
                        className="w-auto max-h-[350px] h-auto rounded-3xl hidden md:block"
                    />
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
