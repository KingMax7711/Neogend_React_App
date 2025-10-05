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
import { dbDateToFront } from "../tools/dateTranslate";
import clsx from "clsx";
import "../App.css";

function ProfilePage() {
    const { user, token, endSession } = useAuthStore();
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
                await endSession(); // nettoie token + user
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
                <div className="">
                    <DefaultHeader />
                    <Renamer pageTitle={"Profil - Neogend"} />
                    <div className="max-w-screen-xl mx-auto p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                            {/* Colonne ADMIN: En-tête + détails */}
                            <div className="flex flex-col gap-4 h-full">
                                {/* En-tête admin */}
                                <div className="bg-base-200 p-5 rounded-3xl shadow-lg flex items-center gap-4">
                                    <div className="avatar placeholder">
                                        <div className="bg-neutral text-neutral-content rounded-full w-14">
                                            <span className="text-xl">
                                                {`${user?.last_name?.[0] || "?"}${
                                                    user?.first_name?.[0] || "?"
                                                }`.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-lg font-bold truncate">
                                            <span className="uppercase">
                                                {(user?.last_name || "—").toUpperCase()}
                                            </span>{" "}
                                            <span className="opacity-90">
                                                {formatName(user?.first_name || "—")}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span
                                                className={clsx("badge", {
                                                    "badge-primary":
                                                        user.privileges === "admin",
                                                    "badge-info":
                                                        user.privileges === "mod",
                                                    "badge-warning":
                                                        user.privileges === "owner",
                                                    "badge-success":
                                                        user.privileges === "player",
                                                })}
                                            >
                                                {privilegesToFront(user.privileges)}
                                            </span>
                                            <span className="badge badge-ghost">
                                                Inscrit le{" "}
                                                {dbDateToFront(user?.inscription_date)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* Détails admin regroupés */}
                                <div className="bg-base-200 p-5 rounded-3xl shadow-lg flex-1 flex flex-col">
                                    <h3 className="text-sm uppercase opacity-60 mb-3">
                                        Administratif
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-[8rem,1fr] items-center">
                                            <div className="text-xs opacity-60">Mail</div>
                                            <div className="text-sm font-semibold break-all">
                                                {user?.email || "—"}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[8rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Discord
                                            </div>
                                            <div className="text-sm font-semibold">
                                                {user?.discord_id || "—"}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[8rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Inscription
                                            </div>
                                            <div className="text-sm font-semibold">
                                                {dbDateToFront(user?.inscription_date)}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[8rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Statut
                                            </div>
                                            <div>
                                                <span
                                                    className={clsx("badge", {
                                                        "badge-success":
                                                            user.inscription_status ===
                                                            "valid",
                                                        "badge-warning":
                                                            user.inscription_status ===
                                                            "pending",
                                                        "badge-error":
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
                                        <div className="grid grid-cols-[8rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Privilèges
                                            </div>
                                            <div>
                                                <span
                                                    className={clsx("badge", {
                                                        "badge-primary":
                                                            user.privileges === "admin",
                                                        "badge-info":
                                                            user.privileges === "mod",
                                                        "badge-warning":
                                                            user.privileges === "owner",
                                                        "badge-success":
                                                            user.privileges === "player",
                                                    })}
                                                >
                                                    {privilegesToFront(user.privileges)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="divider my-4"></div>
                                    <div>
                                        <div className="text-xs uppercase opacity-60 mb-2">
                                            Actions
                                        </div>
                                        <div className="flex flex-wrap gap-3">
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
                                                        ?.showModal()
                                                }
                                            >
                                                Changement de mot de passe
                                            </button>
                                            {user.temp_password && (
                                                <span className="badge badge-error badge-outline">
                                                    Mot de passe temporaire, à changer
                                                </span>
                                            )}
                                        </div>
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
                                                            onClick={() =>
                                                                document
                                                                    .getElementById(
                                                                        "change_password_modal",
                                                                    )
                                                                    ?.close()
                                                            }
                                                        >
                                                            Fermer
                                                        </button>
                                                    </div>
                                                    <p className="text-xs italic text-center mt-2">
                                                        Mot de passe oublié ? Contacter un
                                                        administrateur.
                                                    </p>
                                                </form>
                                                <form
                                                    method="dialog"
                                                    className="modal-backdrop"
                                                >
                                                    <button
                                                        className="hidden"
                                                        aria-hidden="true"
                                                    />
                                                </form>
                                            </div>
                                        </dialog>
                                    </div>
                                </div>
                            </div>

                            {/* Colonne RP: En-tête + détails */}
                            <div className="flex flex-col gap-4 h-full">
                                {/* En-tête RP */}
                                <div className="bg-base-200 p-5 rounded-3xl shadow-lg flex items-center gap-4">
                                    <div className="avatar placeholder">
                                        <div className="bg-neutral text-neutral-content rounded-full w-14">
                                            <span className="text-xl">
                                                {`${user?.rp_last_name?.[0] || "?"}${
                                                    user?.rp_first_name?.[0] || "?"
                                                }`.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-lg font-bold truncate">
                                            <span className="uppercase">
                                                {(
                                                    user?.rp_last_name || "—"
                                                ).toUpperCase()}
                                            </span>{" "}
                                            <span className="opacity-90">
                                                {formatName(user?.rp_first_name || "—")}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span className="badge badge-outline">
                                                {gradesToFront(user?.rp_grade)}
                                            </span>
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
                                    </div>
                                </div>
                                {/* Détails RP regroupés */}
                                <div className="bg-base-200 p-5 rounded-3xl shadow-lg flex-1 flex flex-col">
                                    <h3 className="text-sm uppercase opacity-60 mb-3">
                                        Rôle-play
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-[8rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Naissance
                                            </div>
                                            <div className="text-sm font-semibold">
                                                {dbDateToFront(user?.rp_birthdate)}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[8rem,1fr] items-center">
                                            <div className="text-xs opacity-60">Sexe</div>
                                            <div className="text-sm font-semibold">
                                                {user?.rp_gender === "male"
                                                    ? "Homme"
                                                    : "Femme"}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[8rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Grade
                                            </div>
                                            <div>
                                                <span className="badge badge-outline">
                                                    {gradesToFront(user?.rp_grade)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[8rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Service
                                            </div>
                                            <div>
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
                                        </div>
                                        <div className="grid grid-cols-[8rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                {user.rp_service === "gn"
                                                    ? "NIGEND"
                                                    : "NIPOL"}
                                            </div>
                                            <div className="text-sm font-semibold">
                                                {user.rp_nipol || "—"}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[8rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Qualification
                                            </div>
                                            <div className="text-sm font-semibold">
                                                {qualificationToFront(user.rp_qualif)}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[8rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Affectation
                                            </div>
                                            <div className="text-sm font-semibold">
                                                {affectationToFront(user.rp_affectation)}
                                                {user.rp_affectation
                                                    ? ` (${user.rp_affectation})`
                                                    : ""}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[8rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Serveur
                                            </div>
                                            <div>
                                                <span className="badge badge-info">
                                                    {serverToFront(user.rp_server)}
                                                </span>
                                            </div>
                                        </div>
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
