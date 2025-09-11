import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

// LOCAL
import { useAuthStore } from "../stores/authStore";
import axios from "axios";
import API from "../global/API";
import Renamer from "../components/Renamer";
import AuthCheck from "../components/AuthCheck";
import DefaultHeader from "../components/Header";
import LoadingComponent from "../components/LoadingComponent";
import formatName from "../tools/formatName";
import { privilegesToFront } from "../tools/privilegesTranslate";
import { gradesToFront } from "../tools/gradesTranslate";
import { qualificationToFront } from "../tools/qualificationTranslate";
import { affectationToFront } from "../tools/affectationTranslate";
import { serverToFront } from "../tools/serverTranslate";
import { serviceToFront } from "../tools/serviceTranslate";
import clsx from "clsx";
import "../App.css";

function ProfilePage() {
    const { user, token, clearAuth } = useAuthStore();
    const navigate = useNavigate();

    // Formulaire changement de mot de passe
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm();
    const newPassword = watch("new_password");
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdError, setPwdError] = useState("");
    const [pwdSuccess, setPwdSuccess] = useState("");
    const [showPwd, setShowPwd] = useState(false);

    const onSubmitPassword = async (data) => {
        if (!token) {
            setPwdError("Non authentifié");
            return;
        }
        setPwdError("");
        setPwdSuccess("");
        setPwdLoading(true);
        const oldPwd = (data.old_password || "").trim();
        const newPwd = (data.new_password || "").trim();
        if (oldPwd === newPwd) {
            setPwdLoading(false);
            setPwdError("Nouveau mot de passe identique");
            return;
        }
        try {
            await axios.post(
                `${API}/connected/user/password_change/`,
                { old_password: oldPwd, new_password: newPwd },
                { headers: { Authorization: `Bearer ${token}` } },
            );
            console.log("Ancien mot de passe : ", oldPwd);
            console.log("Nouveau mot de passe : ", newPwd);
            setPwdSuccess("Mot de passe mis à jour. Reconnexion...");
            reset();
            setTimeout(async () => {
                await clearAuth(); // nettoie token + user
                navigate("/login");
            }, 1500);
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 400 || e?.response?.status === 401) {
                setPwdError(e.response.data?.detail || "Ancien mot de passe incorrect");
            } else {
                setPwdError("Erreur serveur");
            }
        } finally {
            setPwdLoading(false);
        }
    };

    return (
        <AuthCheck>
            {!user ? (
                <LoadingComponent />
            ) : (
                <div className="min-h-screen bg-base-300">
                    <DefaultHeader />
                    <Renamer pageTitle={"Profil - Neogend"} />
                    <div className="flex box-border flex-col items-top justify-center md:flex-row gap-4">
                        <div className="bg-base-200 p-6 rounded-3xl shadow-lg m-6 flex flex-col gap-4 h-fit">
                            <h2 className="text-xl font-bold text-center text-neutral">
                                ADMINISTRATIF
                            </h2>
                            <div className="flex flex-col items-center mx-5 gap-5">
                                <div className="flex flex-col bg-base-300 p-4 rounded-xl w-full gap-5 shadow-lg items-center">
                                    <h3 className="font-bold underline text-lg">
                                        Vos informations :
                                    </h3>
                                    <div className="flex justify-between w-full flex-col md:flex-row gap-5">
                                        <div className="w-fit">
                                            <span className="font-bold">Nom: </span>
                                            <span>{formatName(user.last_name)}</span>
                                        </div>
                                        <div className="w-fit">
                                            <span className="font-bold">Prénom: </span>
                                            <span>{formatName(user.first_name)}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center items-left w-full gap-5">
                                        <div className="w-fit">
                                            <span className="font-bold">Mail: </span>
                                            <span>{user.email}</span>
                                        </div>
                                        <div className="w-fit">
                                            <span className="font-bold">
                                                Identifiant Discord:{" "}
                                            </span>
                                            <span>{user.discord_id}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col bg-base-300 p-4 rounded-xl w-full gap-5 shadow-lg justify-center items-center">
                                    <h3 className="font-bold underline text-lg">
                                        Inscription :
                                    </h3>
                                    <div className="flex flex-col justify-center items-left w-full gap-5">
                                        <div className="w-fit">
                                            <span className="font-bold">Date: </span>
                                            <span>{user.inscription_date}</span>
                                        </div>
                                        <div className="w-fit">
                                            <span className="font-bold">Statut: </span>
                                            <span
                                                className={clsx({
                                                    "badge-success badge":
                                                        user.inscription_status ===
                                                        "valid",
                                                    "badge-warning badge":
                                                        user.inscription_status ===
                                                        "pending",
                                                    "badge-error badge":
                                                        user.inscription_status ===
                                                        "denied",
                                                })}
                                            >
                                                {user.inscription_status === "valid"
                                                    ? "Validé"
                                                    : user.inscription_status ===
                                                      "pending"
                                                    ? "En attente"
                                                    : "Refusé"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col bg-base-300 p-4 rounded-xl w-full gap-5 shadow-lg justify-center items-center">
                                    <h3 className="font-bold text-lg underline">
                                        Vous êtes actuellement :
                                    </h3>
                                    <span
                                        className={clsx("badge badge-lg", {
                                            "badge-primary": user.privileges === "admin",
                                            "badge-info": user.privileges === "mod",
                                            "badge-warning": user.privileges === "owner",
                                            "badge-success": user.privileges === "player",
                                        })}
                                    >
                                        {privilegesToFront(user.privileges)}
                                    </span>
                                </div>
                                <div className="flex flex-col bg-base-300 p-4 rounded-xl w-full gap-5 shadow-lg justify-center items-center">
                                    <h3 className="font-bold text-lg underline">
                                        Centre d'Aide :
                                    </h3>
                                    <div className="flex gap-3 flex-col md:flex-row">
                                        <a
                                            className="btn btn-primary"
                                            href="https://discord.com/channels/541620491161436160/1012092654433095741"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Contacter un administrateur
                                        </a>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() =>
                                                document
                                                    .getElementById(
                                                        "change_password_modal",
                                                    )
                                                    .showModal()
                                            }
                                        >
                                            Changement de mot de passe
                                        </button>
                                        <dialog
                                            id="change_password_modal"
                                            className="modal"
                                        >
                                            <div className="modal-box">
                                                <h3 className="font-bold text-lg text-center">
                                                    Changement de Mot de Passe
                                                </h3>
                                                <form
                                                    onSubmit={handleSubmit(
                                                        onSubmitPassword,
                                                    )}
                                                    className="flex flex-col gap-4 mt-4"
                                                >
                                                    <div className="form-control">
                                                        <label className="label text-sm font-semibold">
                                                            Ancien mot de passe
                                                        </label>
                                                        <input
                                                            type={
                                                                showPwd
                                                                    ? "text"
                                                                    : "password"
                                                            }
                                                            className={`input input-bordered w-full ${
                                                                errors.old_password
                                                                    ? "input-error"
                                                                    : ""
                                                            }`}
                                                            {...register("old_password", {
                                                                required: "Requis",
                                                            })}
                                                            autoComplete="current-password"
                                                        />
                                                        {errors.old_password && (
                                                            <span className="text-error text-xs mt-1">
                                                                {
                                                                    errors.old_password
                                                                        .message
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="form-control">
                                                        <label className="label text-sm font-semibold">
                                                            Nouveau mot de passe
                                                        </label>
                                                        <input
                                                            type={
                                                                showPwd
                                                                    ? "text"
                                                                    : "password"
                                                            }
                                                            className={`input input-bordered w-full ${
                                                                errors.new_password
                                                                    ? "input-error"
                                                                    : ""
                                                            }`}
                                                            {...register("new_password", {
                                                                required: "Requis",
                                                                minLength: {
                                                                    value: 4,
                                                                    message:
                                                                        "4 caractères min.",
                                                                },
                                                            })}
                                                            autoComplete="new-password"
                                                        />
                                                        {errors.new_password && (
                                                            <span className="text-error text-xs mt-1">
                                                                {
                                                                    errors.new_password
                                                                        .message
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="form-control">
                                                        <label className="label text-sm font-semibold">
                                                            Confirmer le mot de passe
                                                        </label>
                                                        <input
                                                            type={
                                                                showPwd
                                                                    ? "text"
                                                                    : "password"
                                                            }
                                                            className={`input input-bordered w-full ${
                                                                errors.confirm_password
                                                                    ? "input-error"
                                                                    : ""
                                                            }`}
                                                            {...register(
                                                                "confirm_password",
                                                                {
                                                                    required: "Requis",
                                                                    validate: (v) =>
                                                                        v ===
                                                                            newPassword ||
                                                                        "Ne correspond pas",
                                                                },
                                                            )}
                                                            autoComplete="new-password"
                                                        />
                                                        {errors.confirm_password && (
                                                            <span className="text-error text-xs mt-1">
                                                                {
                                                                    errors
                                                                        .confirm_password
                                                                        .message
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            id="showPwd"
                                                            type="checkbox"
                                                            className="toggle toggle-sm"
                                                            onChange={(e) =>
                                                                setShowPwd(
                                                                    e.target.checked,
                                                                )
                                                            }
                                                        />
                                                        <label
                                                            htmlFor="showPwd"
                                                            className="text-xs"
                                                        >
                                                            Afficher
                                                        </label>
                                                    </div>
                                                    {pwdError && (
                                                        <div className="badge badge-error">
                                                            {pwdError}
                                                        </div>
                                                    )}
                                                    {pwdSuccess && (
                                                        <div className="badge badge-success">
                                                            {pwdSuccess}
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2 mt-2">
                                                        <button
                                                            type="submit"
                                                            className={`btn btn-primary flex-1 ${
                                                                pwdLoading
                                                                    ? "btn-disabled"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {pwdLoading ? (
                                                                <span className="loading loading-dots" />
                                                            ) : (
                                                                "Mettre à jour"
                                                            )}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline"
                                                            onClick={() => {
                                                                const dlg =
                                                                    document.getElementById(
                                                                        "change_password_modal",
                                                                    );
                                                                if (dlg && dlg.close)
                                                                    dlg.close();
                                                            }}
                                                        >
                                                            Fermer
                                                        </button>
                                                    </div>
                                                    <p className="text-xs italic text-center mt-2">
                                                        Mot de passe oublié ? Contacter un
                                                        administrateur.
                                                    </p>
                                                </form>
                                            </div>
                                        </dialog>
                                        <div
                                            className="modal-backdrop"
                                            onClick={() => {
                                                const dlg = document.getElementById(
                                                    "change_password_modal",
                                                );
                                                if (dlg && dlg.close) dlg.close();
                                            }}
                                        >
                                            <button
                                                className="hidden"
                                                aria-hidden="true"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-base-200 p-6 rounded-3xl shadow-lg m-6 flex flex-col gap-4 h-fit">
                            <h2 className="text-xl font-bold text-center text-neutral">
                                RÔLE-PLAY
                            </h2>
                            <div className="flex flex-col items-center mx-5 gap-5">
                                <div className="flex flex-col bg-base-300 p-4 rounded-xl w-full gap-5 shadow-lg items-center">
                                    <h3 className="font-bold underline text-lg">
                                        Vos informations :
                                    </h3>
                                    <div className="flex justify-between w-full flex-col md:flex-row gap-5">
                                        <div className="w-fit">
                                            <span className="font-bold">Nom: </span>
                                            <span>{formatName(user.rp_last_name)}</span>
                                        </div>
                                        <div className="w-fit">
                                            <span className="font-bold">Prénom: </span>
                                            <span>{formatName(user.rp_first_name)}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center items-left w-full gap-5">
                                        <div className="w-fit">
                                            <span className="font-bold">
                                                Date de naissance:{" "}
                                            </span>
                                            <span>{user.rp_birthdate}</span>
                                        </div>
                                        <div className="w-fit">
                                            <span className="font-bold">Sexe: </span>
                                            <span>
                                                {user.rp_gender == "male"
                                                    ? "Homme"
                                                    : "Femme"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col bg-base-300 p-4 rounded-xl w-full gap-5 shadow-lg justify-center items-center">
                                    <h3 className="font-bold text-lg underline">
                                        Profil professionnel :
                                    </h3>
                                    <div className="flex flex-col justify-center items-left w-full gap-5">
                                        <div className="w-fit">
                                            <span className="font-bold">Grade: </span>
                                            <span>{gradesToFront(user.rp_grade)}</span>
                                        </div>
                                        <div className="w-fit">
                                            <span className="font-bold">Service: </span>
                                            <span
                                                className={clsx("badge", {
                                                    "badge-primary":
                                                        user.rp_service === "gn",
                                                    "badge-info":
                                                        user.rp_service === "pn" ||
                                                        user.rp_service === "pm",
                                                })}
                                            >
                                                {serviceToFront(user.rp_service)}
                                            </span>
                                        </div>
                                        <div className="w-fit">
                                            <span className="font-bold">
                                                {user.rp_service === "gn"
                                                    ? "NIGEND : "
                                                    : "NIPOL : "}
                                            </span>
                                            <span>{user.rp_nipol}</span>
                                        </div>
                                        <div className="w-fit">
                                            <span className="font-bold">
                                                Qualification:{" "}
                                            </span>
                                            <span>
                                                {qualificationToFront(user.rp_qualif)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col bg-base-300 p-4 rounded-xl w-full gap-5 shadow-lg justify-center items-center">
                                    <h3 className="font-bold text-lg underline">
                                        Affectation :
                                    </h3>
                                    <div className="flex gap-3 flex-col md:flex-row">
                                        <span>
                                            <span className="font-bold">
                                                {user.rp_affectation}
                                                {" : "}
                                            </span>
                                            <span>
                                                {affectationToFront(user.rp_affectation)}
                                            </span>
                                            <span className="badge badge-info badge-sm ml-2">
                                                {serverToFront(user.rp_server)}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthCheck>
    );
}

export default ProfilePage;
