import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, NavLink } from "react-router-dom";

// LOCAL
import { useAuthStore } from "../../stores/authStore";
import axios from "axios";
import API from "../../global/API";
import Renamer from "../../components/Renamer";
import AuthCheck from "../../components/AuthCheck";
import DefaultHeader from "../../components/Header";
import LoadingComponent from "../../components/LoadingComponent";
import formatName from "../../tools/formatName";
import RHFDateText from "../../components/RHFDateText.jsx";
import { privilegesToFront } from "../../tools/privilegesTranslate";
import { gradesToFront } from "../../tools/gradesTranslate";
import { qualificationToFront } from "../../tools/qualificationTranslate";
import { affectationToFront } from "../../tools/affectationTranslate";
import { serverToFront } from "../../tools/serverTranslate";
import { serviceToFront } from "../../tools/serviceTranslate";
import { dbDateToFront } from "../../tools/dateTranslate";
import clsx from "clsx";

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

    // Formulaire de complétion d'inscription
    const {
        register: registerComplete,
        handleSubmit: handleCompleteSubmit,
        control: controlComplete,
        formState: { errors: errorsComplete, isSubmitting: isSubmittingComplete },
    } = useForm({
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            rp_birthdate: "",
            rp_gender: "",
            accepted_cgu: false,
            accepted_privacy: false,
        },
    });
    const [completeError, setCompleteError] = useState("");
    const [completeSuccess, setCompleteSuccess] = useState("");
    const [completeLocked, setCompleteLocked] = useState(false);

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

    const onSubmitComplete = async (data) => {
        if (!token) {
            setCompleteError("Non authentifié");
            return;
        }
        setCompleteError("");
        setCompleteSuccess("");
        try {
            const payload = {
                first_name: (data.first_name || "").trim().toLowerCase(),
                last_name: (data.last_name || "").trim().toLowerCase(),
                email: (data.email || "").trim().toLowerCase(),
                rp_birthdate: data.rp_birthdate,
                rp_gender: data.rp_gender,
                accepted_cgu: !!data.accepted_cgu,
                accepted_privacy: !!data.accepted_privacy,
            };
            await axios.post(`${API}/connected/user/inscription_complete/`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCompleteSuccess("Inscription complétée. En attente de validation.");
            setCompleteLocked(true);
            // Optionnel: fermer automatiquement après un court délai
            await useAuthStore.getState().ensureSession();
            setTimeout(() => {
                document.getElementById("complete_inscription_modal")?.close();
            }, 1000);
        } catch (e) {
            console.error(e);
            const msg = e?.response?.data?.detail || "Erreur lors de l'envoi";
            setCompleteError(msg);
        }
    };

    const handleForceLogout = async () => {
        await axios.post(
            `${API}/connected/user/discard_all_sessions/`,
            {},
            { headers: { Authorization: `Bearer ${token}` } },
        );
        navigate("/login");
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
                                        <div className="grid grid-cols-2 gap-4">
                                            {user.inscription_status == "pending" &&
                                                user.first_name == "inconnu" &&
                                                !completeLocked && (
                                                    <button
                                                        className="btn btn-success col-span-2"
                                                        onClick={() =>
                                                            document
                                                                .getElementById(
                                                                    "complete_inscription_modal",
                                                                )
                                                                ?.showModal()
                                                        }
                                                    >
                                                        Compléter mon inscription
                                                    </button>
                                                )}
                                            {user.inscription_status == "pending" &&
                                                user.first_name != "inconnu" && (
                                                    <span className="col-span-2 w-full bg-success/10 border border-success/40 rounded-xl p-3 font-semibold text-sm text-center">
                                                        Votre inscription est en cours de
                                                        traitement
                                                    </span>
                                                )}
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
                                            <button
                                                className="btn btn-warning col-span-2"
                                                onClick={() =>
                                                    document
                                                        .getElementById(
                                                            "force_logout_modal",
                                                        )
                                                        ?.showModal()
                                                }
                                            >
                                                Forcer la déconnexion de tous les
                                                appareils
                                            </button>
                                            {user.temp_password && (
                                                <span className="p-3 rounded-xl bg-error/10 border border-error/40 col-span-2 font-semibold text-sm text-center">
                                                    Mot de passe temporaire, à changer !
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
                                        <dialog id="force_logout_modal" className="modal">
                                            <form method="dialog" className="modal-box">
                                                <h2 className="font-bold text-lg">
                                                    Forcer la déconnexion
                                                </h2>
                                                <p>
                                                    Êtes-vous sûr de vouloir forcer la
                                                    déconnexion de tous les appareils ?
                                                    <br />
                                                    <span className="italic text-sm">
                                                        Vous serez également déconnecté de
                                                        cet appareil.
                                                    </span>
                                                </p>
                                                <div className="modal-action justify-between">
                                                    <button
                                                        className="btn btn-warning"
                                                        onClick={handleForceLogout}
                                                    >
                                                        Confirmer
                                                    </button>
                                                    <button
                                                        className="btn"
                                                        onClick={() =>
                                                            document
                                                                .getElementById(
                                                                    "force_logout_modal",
                                                                )
                                                                ?.close()
                                                        }
                                                    >
                                                        Annuler
                                                    </button>
                                                </div>
                                            </form>
                                        </dialog>
                                        <dialog
                                            id="complete_inscription_modal"
                                            className="modal"
                                        >
                                            <div className="modal-box max-w-xl">
                                                <h3 className="font-bold text-lg text-center">
                                                    Compléter mon inscription
                                                </h3>
                                                <p className="text-center italic mb-3">
                                                    Renseignez vos informations et
                                                    acceptez les conditions pour finaliser
                                                    votre inscription.
                                                </p>

                                                {completeError && (
                                                    <div className="alert alert-error mb-3">
                                                        <span>{completeError}</span>
                                                    </div>
                                                )}
                                                {completeSuccess && (
                                                    <div className="alert alert-success mb-3">
                                                        <span>{completeSuccess}</span>
                                                    </div>
                                                )}
                                                <h3 className="font-bold">
                                                    Informations Réelles
                                                </h3>
                                                <p className="text-sm italic pb-2.5">
                                                    Entrez vos informations réelles telles
                                                    que sur vos documents officiels.
                                                </p>
                                                <form
                                                    onSubmit={handleCompleteSubmit(
                                                        onSubmitComplete,
                                                    )}
                                                    className="flex flex-col gap-3"
                                                >
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Prénom"
                                                            className={clsx(
                                                                "input input-bordered w-1/2",
                                                                {
                                                                    "input-error":
                                                                        errorsComplete.first_name,
                                                                },
                                                            )}
                                                            {...registerComplete(
                                                                "first_name",
                                                                { required: true },
                                                            )}
                                                            disabled={completeLocked}
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Nom"
                                                            className={clsx(
                                                                "input input-bordered w-1/2",
                                                                {
                                                                    "input-error":
                                                                        errorsComplete.last_name,
                                                                },
                                                            )}
                                                            {...registerComplete(
                                                                "last_name",
                                                                { required: true },
                                                            )}
                                                            disabled={completeLocked}
                                                        />
                                                    </div>
                                                    <input
                                                        type="email"
                                                        placeholder="Email"
                                                        className={clsx(
                                                            "input input-bordered w-full",
                                                            {
                                                                "input-error":
                                                                    errorsComplete.email,
                                                            },
                                                        )}
                                                        {...registerComplete("email", {
                                                            required: true,
                                                            pattern:
                                                                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                        })}
                                                        disabled={completeLocked}
                                                    />
                                                    <span className="divider-neutral divider"></span>
                                                    <div className="pb-2.5">
                                                        <h3 className="font-bold">
                                                            Informations RP
                                                        </h3>
                                                        <p className="text-sm italic">
                                                            Entrez les informations de
                                                            votre personnage.
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <div className="w-1/2">
                                                            <RHFDateText
                                                                control={controlComplete}
                                                                name="rp_birthdate"
                                                                placeholder="Naissance (JJ/MM/AAAA)"
                                                                className="input input-bordered w-full"
                                                                rules={{ required: true }}
                                                                disabled={completeLocked}
                                                            />
                                                        </div>
                                                        <select
                                                            className={clsx(
                                                                "select select-bordered w-1/2",
                                                                {
                                                                    "select-error":
                                                                        errorsComplete.rp_gender,
                                                                },
                                                            )}
                                                            {...registerComplete(
                                                                "rp_gender",
                                                                { required: true },
                                                            )}
                                                            disabled={completeLocked}
                                                        >
                                                            <option value="">Sexe</option>
                                                            <option value="male">
                                                                Homme
                                                            </option>
                                                            <option value="female">
                                                                Femme
                                                            </option>
                                                        </select>
                                                    </div>
                                                    <span className="divider-neutral divider"></span>
                                                    <div className="pb-2.5">
                                                        <h3 className="font-bold">
                                                            Informations Légales
                                                        </h3>
                                                        <p className="text-sm italic">
                                                            Ces informations sont
                                                            nécessaires pour votre
                                                            inscription au sein de la
                                                            communauté.
                                                        </p>
                                                    </div>
                                                    <label className="label cursor-pointer gap-2">
                                                        <input
                                                            type="checkbox"
                                                            className={clsx("checkbox", {
                                                                "checkbox-error":
                                                                    errorsComplete.accepted_cgu,
                                                            })}
                                                            {...registerComplete(
                                                                "accepted_cgu",
                                                                { required: true },
                                                            )}
                                                            disabled={completeLocked}
                                                        />
                                                        <span className="label-text text-sm">
                                                            J'accepte les{" "}
                                                            <NavLink
                                                                to="/conditions"
                                                                className="link"
                                                            >
                                                                Conditions Générales
                                                                d'Utilisation
                                                            </NavLink>
                                                        </span>
                                                    </label>
                                                    <label className="label cursor-pointer gap-2">
                                                        <input
                                                            type="checkbox"
                                                            className={clsx("checkbox", {
                                                                "checkbox-error":
                                                                    errorsComplete.accepted_privacy,
                                                            })}
                                                            {...registerComplete(
                                                                "accepted_privacy",
                                                                { required: true },
                                                            )}
                                                            disabled={completeLocked}
                                                        />
                                                        <span className="label-text text-sm">
                                                            J'accepte la{" "}
                                                            <NavLink
                                                                to="/conditions"
                                                                className="link"
                                                            >
                                                                Politique de
                                                                Confidentialité
                                                            </NavLink>
                                                        </span>
                                                    </label>
                                                    <span className="text-xs italic text-center">
                                                        Attention, vérifier la véracité
                                                        des informations fournies. <br />
                                                        Celle-ci ne pouront être modifiées
                                                        sans l'intervention d'un
                                                        administrateur.
                                                    </span>

                                                    <div className="modal-action justify-between mt-2">
                                                        <button
                                                            type="submit"
                                                            className={clsx(
                                                                "btn btn-primary",
                                                                {
                                                                    "btn-disabled":
                                                                        isSubmittingComplete ||
                                                                        completeLocked,
                                                                },
                                                            )}
                                                        >
                                                            {isSubmittingComplete ? (
                                                                <>
                                                                    <span className="loading loading-dots mr-2" />
                                                                    Envoi…
                                                                </>
                                                            ) : (
                                                                "Envoyer"
                                                            )}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn"
                                                            onClick={() =>
                                                                document
                                                                    .getElementById(
                                                                        "complete_inscription_modal",
                                                                    )
                                                                    ?.close()
                                                            }
                                                        >
                                                            Fermer
                                                        </button>
                                                    </div>
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
