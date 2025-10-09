import React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import RHFDateText from "../../components/RHFDateText.jsx";
import axios from "axios";

// LOCAL
import { useAuthStore } from "../../stores/authStore.js";
import Renamer from "../../components/Renamer.jsx";
import AdminAuthCheck from "../../components/AdminAuthCheck.jsx";
import DefaultHeader from "../../components/Header.jsx";
import LoadingComponent from "../../components/LoadingComponent.jsx";
import formatName from "../../tools/formatName.js";
import { privilegesToFront } from "../../tools/privilegesTranslate.js";
import { frontToGrades, gradesToFront } from "../../tools/gradesTranslate.js";
import { frontToQualification } from "../../tools/qualificationTranslate.js";
import { qualificationToFront } from "../../tools/qualificationTranslate.js";
import {
    affectationToFront,
    frontToAffectation,
} from "../../tools/affectationTranslate.js";
import { frontToServer, serverToFront } from "../../tools/serverTranslate.js";
import { serviceToFront } from "../../tools/serviceTranslate.js";
import { dbDateToFront } from "../../tools/dateTranslate.js";
import { useNavigate } from "react-router-dom";
import API from "../../global/API.js";
import clsx from "clsx";

import { useParams } from "react-router-dom";

function AdminProfilePage() {
    const { id } = useParams();
    const { token, user } = useAuthStore();
    const [checkUser, setCheckUser] = useState(null);
    const [error, setError] = useState(null);
    const [modifications, setModifications] = useState([]); // [{field, value, label}]
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState("");
    const [tempPassword, setTempPassword] = useState("");
    const [forceDisconnect, setForceDisconnect] = useState(false);
    const [actionError, setActionError] = useState("");
    // Permissions (owner-only)
    const [permValue, setPermValue] = useState("");
    const [permSaving, setPermSaving] = useState(false);
    const [permError, setPermError] = useState("");
    const [permSuccess, setPermSuccess] = useState("");
    const navigate = useNavigate();

    const handleResetPassword = async () => {
        if (!id || !token) return;
        setSaveError("");
        setSaveSuccess("");
        setActionError("");
        try {
            const response = await axios.post(`${API}/admin/users/${id}/password`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const temp = response?.data?.temp_password;
            if (temp) {
                setTempPassword(temp);
                setSaveSuccess("Mot de passe temporaire généré.");
                document.getElementById("reset_password_modal")?.showModal();
            } else {
                setActionError("Réponse inattendue du serveur.");
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            setSaveError(
                error?.response?.data?.detail ||
                    "Impossible de réinitialiser le mot de passe.",
            );
        }
    };

    const handleValidateInscription = async () => {
        if (!id || !token) return;
        setSaveError("");
        setSaveSuccess("");
        try {
            const res = await axios.patch(
                `${API}/admin/users_update/${id}`,
                { inscription_status: "valid" },
                { headers: { Authorization: `Bearer ${token}` } },
            );
            setCheckUser((prev) => ({
                ...prev,
                ...(res?.data || { inscription_status: "valid" }),
            }));
            setSaveSuccess("Inscription validée.");
            await axios.post(
                `${API}/notifications/create/`,
                {
                    title: "Inscription validée",
                    message: `Votre inscription a été validée par ${
                        formatName(user?.rp_first_name) +
                        " " +
                        user?.rp_last_name.slice(0, 1).toUpperCase()
                    }. Vous pouvez désormais accéder à l'ensemble des fonctionnalités.`,
                    user_id: checkUser?.id,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            );
        } catch (e) {
            console.error("Validate inscription error", e);
            setSaveError(
                e?.response?.data?.detail ||
                    "Erreur lors de la validation de l'inscription",
            );
        }
    };

    useEffect(() => {
        if (!id || !token) return;
        setError(null);
        // Fetch user data based on the ID from params
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${API}/admin/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCheckUser(response.data);
            } catch (error) {
                console.error("Error fetching user data:", error);
                setError("Impossible de récupérer les données de l'utilisateur.");
            }
        };

        fetchUserData();
    }, [id, token]);

    // Suivi de la valeur de privilège affichée
    useEffect(() => {
        setPermValue(checkUser?.privileges || "");
    }, [checkUser?.privileges]);

    // Listes de grades selon service pour sélection dynamique
    const gradeGendarmerie = [
        "Général des Armées",
        "Général de Corps d'Armée",
        "Général de Division",
        "Général de Brigade",
        "Colonel",
        "Lieutenant-Colonel",
        "Chef D'escadron",
        "Capitaine",
        "Lieutenant",
        "Sous-Lieutenant",
        "Élève-Officier",
        "Major",
        "Adjudant-Chef",
        "Adjudant",
        "Maréchal des Logis-Chef",
        "Gendarme",
        "Gendarme Sous Contrat",
        "Brigadier-Chef",
        "Brigadier",
        "Première Classe",
        "Seconde Classe",
    ];
    const gradePoliceNationale = [
        "Commissaire Divisionnaire",
        "Commissaire",
        "Commandant",
        "Capitaine",
        "Lieutenant",
        "Brigadier-Chef",
        "Brigadier",
        "Gardien de la Paix",
    ];
    const gradePoliceMunicipale = [
        "Commissaire",
        "Commandant",
        "Capitaine",
        "Lieutenant",
        "Brigadier-Chef",
        "Brigadier",
        "Gardien de la Paix",
    ];

    const affectationList = ["COB Pont l'Abbé"];
    const serverList = ["France Rôleplay", "Breizh Rôleplay"];
    const qualificationList = [
        "Officier de Police Judiciaire",
        "Agent de Police Judiciaire",
        "Agent de Police Judiciaire Adjoint",
        "Agent de la Force Publique",
    ];

    const dicPermModify = {
        owner: ["owner", "admin", "mod", "player"],
        admin: ["mod", "player"],
        mod: ["player"],
        player: [],
    };

    const formatDate = (dateStr) => {
        const options = { year: "numeric", month: "2-digit", day: "2-digit" };
        const date = new Date(dateStr);
        return date.toLocaleDateString("fr-FR", options);
    };

    // react-hook-form pour ajout d'une modification à la fois
    const {
        register,
        handleSubmit,
        reset,
        watch,
        control,
        formState: { errors },
    } = useForm({
        defaultValues: { field: "", value: "" },
    });

    const selectedField = watch("field");

    // Configuration des champs (type + options + validation minimale)
    const fieldConfig = {
        first_name: {
            type: "text",
            label: "Prénom",
            normalize: (v) => v.trim().toLowerCase(),
            required: true,
        },
        last_name: {
            type: "text",
            label: "Nom",
            normalize: (v) => v.trim().toLowerCase(),
            required: true,
        },
        email: {
            type: "email",
            label: "Email",
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            normalize: (v) => v.trim().toLowerCase(),
            required: true,
        },
        discord_id: {
            type: "number",
            label: "ID Discord",
            normalize: (v) => v.trim(),
            required: true,
        },
        inscription_date: { type: "date", label: "Date d'inscription", required: true },
        inscription_status: {
            type: "select",
            label: "Statut d'inscription",
            options: [
                { value: "valid", label: "Validé" },
                { value: "pending", label: "En attente" },
                { value: "denied", label: "Refusé" },
            ],
            required: true,
        },
        rp_first_name: {
            type: "text",
            label: "Prénom RP",
            normalize: (v) => v.trim().toLowerCase(),
            required: true,
        },
        rp_last_name: {
            type: "text",
            label: "Nom RP",
            normalize: (v) => v.trim().toLowerCase(),
            required: true,
        },
        rp_birthdate: { type: "date", label: "Naissance RP", required: true },
        rp_gender: {
            type: "select",
            label: "Sexe RP",
            options: [
                { value: "male", label: "Homme" },
                { value: "female", label: "Femme" },
            ],
            required: true,
        },
        rp_grade: {
            type: "grade-select",
            label: "Grade RP",
            required: true,
            toBackend: (v) => v,
        },
        rp_affectation: {
            type: "select",
            label: "Affectation",
            options: affectationList.map((a) => ({
                value: frontToAffectation(a),
                label: a,
            })),
            required: true,
        },
        rp_qualif: {
            type: "select",
            label: "Qualification",
            options: qualificationList.map((q) => ({
                value: frontToQualification(q),
                label: q,
            })),
            required: true,
        },
        rp_nipol: { type: "text", label: "NIGEND / NIPOL", required: true },
        rp_server: {
            type: "select",
            label: "Serveur RP",
            options: serverList.map((s) => ({ value: frontToServer(s), label: s })),
            required: true,
        },
        rp_service: {
            type: "select",
            label: "Service RP",
            options: [
                { value: "gn", label: "Gendarmerie Nationale" },
                { value: "pn", label: "Police Nationale" },
                { value: "pm", label: "Police Municipale" },
            ],
            required: true,
        },
        privileges: {
            type: "select",
            label: "Privilèges",
            options: [
                { value: "player", label: "Utilisateur" },
                { value: "mod", label: "Modérateur" },
                { value: "admin", label: "Administrateur" },
                { value: "owner", label: "Propriétaire" },
            ],
            required: true,
        },
    };

    const onAddModification = (data) => {
        const cfg = fieldConfig[data.field];
        if (!cfg) return;
        let inputValue = data.value;
        if (cfg.normalize) inputValue = cfg.normalize(inputValue);
        console.log(inputValue);

        // Label lisible (toujours côté front) + valeur envoyée côté backend
        let label;
        if (cfg.type === "select") {
            label = cfg.options.find((o) => o.value === inputValue)?.label || inputValue;
        } else if (cfg.type === "grade-select") {
            // inputValue est déjà le code backend (ex: lcl). On reconvertit vers le label lisible.
            label = gradesToFront(inputValue) || inputValue;
        } else if (cfg.type === "date") {
            label = formatDate(inputValue) || inputValue;
        } else {
            label = inputValue;
        }
        const backendValue = cfg.toBackend ? cfg.toBackend(inputValue) : inputValue;

        setModifications((prev) => {
            const existing = prev.filter((m) => m.field !== data.field);
            return [...existing, { field: data.field, value: backendValue, label }];
        });
        reset({ field: "", value: "" });
        setSaveSuccess("");
        setSaveError("");
    };

    const removeModification = (field) => {
        setModifications((prev) => prev.filter((m) => m.field !== field));
    };

    const clearModifications = () => {
        setModifications([]);
        setSaveError("");
        setSaveSuccess("");
    };

    const submitAll = async () => {
        if (!modifications.length) return;
        setSaving(true);
        setSaveError("");
        setSaveSuccess("");
        try {
            // Construction du payload partiel
            const body = modifications.reduce((acc, m) => {
                acc[m.field] = m.value; // envoie valeur brute (backend doit accepter patch partiel)
                return acc;
            }, {});
            // Suppose endpoint PATCH existant /admin/users/{id}
            const res = await axios.patch(`${API}/admin/users_update/${id}`, body, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Met à jour localement pour feedback immédiat
            setCheckUser((prev) => ({ ...prev, ...(res?.data || body) }));
            setSaveSuccess("Modifications enregistrées");
            setModifications([]);
        } catch (e) {
            console.error("Save error", e);
            setSaveError(e?.response?.data?.detail || "Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    };

    const handleForceLogout = async () => {
        setActionError("");
        try {
            await axios.post(`${API}/admin/users/disconnect/${id}`, null, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setForceDisconnect(true);
            document.getElementById("confirm_disconnect_modal")?.close();
        } catch (e) {
            console.error("Disconnect error", e);
            setActionError(
                e?.response?.data?.detail || "Impossible de forcer la déconnexion.",
            );
        }
    };

    const isOwner = user?.privileges === "owner";
    const handleSetPrivileges = async () => {
        if (!id || !token) return;
        setPermError("");
        setPermSuccess("");
        setPermSaving(true);
        try {
            await axios.post(
                `${API}/admin/set_user_privileges/${id}`,
                { privilege: permValue },
                { headers: { Authorization: `Bearer ${token}` } },
            );
            setCheckUser((prev) => ({ ...prev, privileges: permValue }));
            setPermSuccess("Privilèges mis à jour.");
        } catch (e) {
            console.error("Set privileges error", e);
            setPermError(
                e?.response?.data?.detail ||
                    "Erreur lors de la mise à jour des privilèges",
            );
        } finally {
            setPermSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        setActionError("");
        try {
            await axios.delete(`${API}/admin/delete_user/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // setAccountDeleted(true);
            document.getElementById("confirm_delete_modal")?.close();
        } catch (e) {
            console.error("Delete error", e);
            setActionError(
                e?.response?.data?.detail || "Impossible de supprimer le compte.",
            );
        }
    };

    return (
        <AdminAuthCheck>
            {error ? (
                <div className="flex flex-col gap-4 items-center justify-center min-h-screen">
                    <div className="badge badge-error">{error}</div>
                    <button
                        className="btn btn-warning"
                        onClick={() => navigate("/admin")}
                    >
                        Retour à la liste
                    </button>
                </div>
            ) : !checkUser ? (
                <LoadingComponent />
            ) : (
                <div className="">
                    <DefaultHeader />
                    <Renamer pageTitle={"Admin Profil - Neogend"} />
                    <div className="max-w-screen xxl:max-w-2/3 mx-auto p-4">
                        <div className="flex box-border flex-col items-stretch justify-center md:flex-row gap-4">
                            {/* Colonne ADMIN: En-tête + détails regroupés */}
                            <div className="m-0 flex flex-col gap-4 h-fit flex-1">
                                {/* En-tête admin */}
                                <div className="bg-base-200 p-6 rounded-3xl shadow-lg flex items-center gap-4">
                                    <div className="avatar placeholder">
                                        <div className="bg-neutral text-neutral-content rounded-full w-14">
                                            <span className="text-xl">
                                                {`${checkUser?.last_name?.[0] || "?"}${
                                                    checkUser?.first_name?.[0] || "?"
                                                }`.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-lg font-bold truncate">
                                            <span className="uppercase">
                                                {(
                                                    checkUser?.last_name || "—"
                                                ).toUpperCase()}
                                            </span>{" "}
                                            <span className="opacity-90">
                                                {formatName(checkUser?.first_name || "—")}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span
                                                className={clsx("badge", {
                                                    "badge-primary":
                                                        checkUser.privileges === "admin",
                                                    "badge-info":
                                                        checkUser.privileges === "mod",
                                                    "badge-warning":
                                                        checkUser.privileges === "owner",
                                                    "badge-success":
                                                        checkUser.privileges === "player",
                                                })}
                                            >
                                                {privilegesToFront(checkUser.privileges)}
                                            </span>
                                            <span className="badge badge-ghost">
                                                Inscrit le{" "}
                                                {dbDateToFront(
                                                    checkUser?.inscription_date,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* Détails admin regroupés */}
                                <div className="bg-base-200 p-6 rounded-3xl shadow-lg flex-1 flex flex-col">
                                    <h3 className="text-sm uppercase opacity-60 mb-3">
                                        Administratif
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-[10rem,1fr] items-center">
                                            <div className="text-xs opacity-60">Mail</div>
                                            <div className="text-sm font-semibold break-all">
                                                {checkUser.email}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[10rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Discord
                                            </div>
                                            <div className="text-sm font-semibold">
                                                {checkUser.discord_id}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[10rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Inscription
                                            </div>
                                            <div className="text-sm font-semibold">
                                                {dbDateToFront(
                                                    checkUser.inscription_date,
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[10rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Statut
                                            </div>
                                            <div>
                                                <span
                                                    className={clsx("badge", {
                                                        "badge-success":
                                                            checkUser.inscription_status ===
                                                            "valid",
                                                        "badge-warning":
                                                            checkUser.inscription_status ===
                                                            "pending",
                                                        "badge-error":
                                                            checkUser.inscription_status ===
                                                            "denied",
                                                    })}
                                                >
                                                    {checkUser.inscription_status ===
                                                    "valid"
                                                        ? "Validé"
                                                        : checkUser.inscription_status ===
                                                          "pending"
                                                        ? "En attente"
                                                        : "Refusé"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[10rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Privilèges
                                            </div>
                                            <div>
                                                <span
                                                    className={clsx("badge", {
                                                        "badge-primary":
                                                            checkUser.privileges ===
                                                            "admin",
                                                        "badge-info":
                                                            checkUser.privileges ===
                                                            "mod",
                                                        "badge-warning":
                                                            checkUser.privileges ===
                                                            "owner",
                                                        "badge-success":
                                                            checkUser.privileges ===
                                                            "player",
                                                    })}
                                                >
                                                    {privilegesToFront(
                                                        checkUser.privileges,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Colonne RP: En-tête + détails regroupés */}
                            <div className="m-0 flex flex-col gap-4 h-fit flex-1">
                                {/* En-tête RP */}
                                <div className="bg-base-200 p-6 rounded-3xl shadow-lg flex items-center gap-4">
                                    <div className="avatar placeholder">
                                        <div className="bg-neutral text-neutral-content rounded-full w-14">
                                            <span className="text-xl">
                                                {`${checkUser?.rp_last_name?.[0] || "?"}${
                                                    checkUser?.rp_first_name?.[0] || "?"
                                                }`.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-lg font-bold truncate">
                                            <span className="uppercase">
                                                {(
                                                    checkUser?.rp_last_name || "—"
                                                ).toUpperCase()}
                                            </span>{" "}
                                            <span className="opacity-90">
                                                {formatName(
                                                    checkUser?.rp_first_name || "—",
                                                )}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span className="badge badge-outline">
                                                {gradesToFront(checkUser?.rp_grade)}
                                            </span>
                                            <span
                                                className={clsx("badge", {
                                                    "badge-primary":
                                                        checkUser.rp_service === "gn",
                                                    "badge-info":
                                                        checkUser.rp_service === "pn" ||
                                                        checkUser.rp_service === "pm",
                                                })}
                                            >
                                                {serviceToFront(checkUser.rp_service)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {/* Détails RP regroupés */}
                                <div className="bg-base-200 p-6 rounded-3xl shadow-lg flex-1 flex flex-col">
                                    <h3 className="text-sm uppercase opacity-60 mb-3">
                                        Rôle-play
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-[10rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Naissance
                                            </div>
                                            <div className="text-sm font-semibold">
                                                {dbDateToFront(checkUser.rp_birthdate)}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[10rem,1fr] items-center">
                                            <div className="text-xs opacity-60">Sexe</div>
                                            <div className="text-sm font-semibold">
                                                {checkUser.rp_gender == "male"
                                                    ? "Homme"
                                                    : "Femme"}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[10rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Grade
                                            </div>
                                            <div>
                                                <span className="badge badge-outline">
                                                    {gradesToFront(checkUser.rp_grade)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[10rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Service
                                            </div>
                                            <div>
                                                <span
                                                    className={clsx("badge", {
                                                        "badge-primary":
                                                            checkUser.rp_service === "gn",
                                                        "badge-info":
                                                            checkUser.rp_service ===
                                                                "pn" ||
                                                            checkUser.rp_service === "pm",
                                                    })}
                                                >
                                                    {serviceToFront(checkUser.rp_service)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[10rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                {checkUser.rp_service === "gn"
                                                    ? "NIGEND"
                                                    : "NIPOL"}
                                            </div>
                                            <div className="text-sm font-semibold">
                                                {checkUser.rp_nipol}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[10rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Qualification
                                            </div>
                                            <div className="text-sm font-semibold">
                                                {qualificationToFront(
                                                    checkUser.rp_qualif,
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[10rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Affectation
                                            </div>
                                            <div className="text-sm font-semibold">
                                                {affectationToFront(
                                                    checkUser.rp_affectation,
                                                )}
                                                {checkUser.rp_affectation
                                                    ? ` (${checkUser.rp_affectation})`
                                                    : ""}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-[10rem,1fr] items-center">
                                            <div className="text-xs opacity-60">
                                                Serveur
                                            </div>
                                            <div>
                                                <span className="badge badge-info">
                                                    {serverToFront(checkUser.rp_server)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Colonne Modifications: Admin + RP + Actions */}
                            <div className="m-0 flex flex-col gap-4 h-fit flex-1">
                                {/* En tête Admin */}
                                <div className="bg-base-200 p-6 rounded-3xl shadow-lg flex items-center gap-4 text-center">
                                    <div className="flex-1 min-w-0">
                                        {dicPermModify[user?.privileges]?.includes(
                                            checkUser.privileges,
                                        ) ? (
                                            <div className="bg-success/10 border border-success/20 p-2 rounded-md">
                                                <span className="text-success">
                                                    Vous avez la permission de modifier
                                                    cet utilisateur.
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="bg-error/10 border border-error/20 p-2 rounded-md">
                                                <span className="text-error">
                                                    Vous n'avez pas la permission de
                                                    modifier cet utilisateur.
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Formulaire + liste modifications + actions */}
                                {actionError && (
                                    <div className="alert alert-error">
                                        <span>{actionError}</span>
                                    </div>
                                )}

                                {/* Gestion de l'inscription */}
                                <div className="bg-base-200 p-6 rounded-3xl shadow-lg flex flex-col gap-3">
                                    <h3 className="text-sm uppercase opacity-60 mb-1">
                                        Inscription
                                    </h3>
                                    {checkUser.inscription_status === "pending" ? (
                                        checkUser.first_name &&
                                        checkUser.first_name !== "inconnu" ? (
                                            <div className="bg-warning/10 border border-warning/20 p-3 rounded">
                                                <p className="mb-2 text-center">
                                                    Le profil a été complété par
                                                    l'utilisateur. Veuillez vérifier les
                                                    informations puis valider
                                                    l'inscription.
                                                </p>
                                                <button
                                                    className="btn btn-success mx-auto block"
                                                    disabled={
                                                        !dicPermModify[
                                                            user?.privileges
                                                        ]?.includes(checkUser.privileges)
                                                    }
                                                    onClick={handleValidateInscription}
                                                >
                                                    Valider l'inscription
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="bg-info/10 border border-info/20 p-3 rounded">
                                                <p>
                                                    L'utilisateur n'a pas encore complété
                                                    son profil.
                                                </p>
                                            </div>
                                        )
                                    ) : checkUser.inscription_status === "valid" ? (
                                        <div className="bg-success/10 border border-success/20 p-3 rounded">
                                            <p>Inscription validée.</p>
                                        </div>
                                    ) : (
                                        <div className="bg-error/10 border border-error/20 p-3 rounded">
                                            <p>Inscription refusée.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions de sécurité */}
                                <div className="bg-base-200 p-6 rounded-3xl shadow-lg flex flex-col gap-3">
                                    <h3 className="text-sm uppercase opacity-60 mb-1">
                                        Actions
                                    </h3>
                                    {forceDisconnect && (
                                        <div className="alert alert-warning">
                                            <span>
                                                Utilisateur déconnecté (token invalidé).
                                            </span>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <button
                                            className="btn btn-warning btn-outline"
                                            disabled={
                                                !dicPermModify[
                                                    user?.privileges
                                                ]?.includes(checkUser.privileges)
                                            }
                                            onClick={() =>
                                                document
                                                    .getElementById(
                                                        "confirm_disconnect_modal",
                                                    )
                                                    ?.showModal()
                                            }
                                        >
                                            Forcer la déconnexion
                                        </button>
                                        <button
                                            className="btn btn-warning btn-outline"
                                            disabled={
                                                !dicPermModify[
                                                    user?.privileges
                                                ]?.includes(checkUser.privileges)
                                            }
                                            onClick={handleResetPassword}
                                        >
                                            Réinitialiser le mot de passe
                                        </button>

                                        <button
                                            className="btn btn-error btn-outline btn-disabled"
                                            disabled
                                        >
                                            Suspendre l'accès (bientôt)
                                        </button>
                                        <button
                                            className="btn btn-error btn-outline"
                                            disabled={
                                                !dicPermModify[
                                                    user?.privileges
                                                ]?.includes(checkUser.privileges)
                                            }
                                            onClick={() =>
                                                document
                                                    .getElementById(
                                                        "confirm_delete_modal",
                                                    )
                                                    ?.showModal()
                                            }
                                        >
                                            Supprimer le compte
                                        </button>
                                    </div>

                                    {/* Modals */}
                                    <dialog
                                        id="confirm_disconnect_modal"
                                        className="modal"
                                    >
                                        <form method="dialog" className="modal-box">
                                            <h3 className="font-bold text-lg text-center">
                                                Forcer la déconnexion
                                            </h3>
                                            <p className="italic text-center">
                                                Cette action invalide le token de
                                                l'utilisateur et le déconnecte
                                                immédiatement.
                                            </p>
                                            <div className="modal-action justify-between">
                                                <button
                                                    type="button"
                                                    className="btn btn-error"
                                                    onClick={handleForceLogout}
                                                >
                                                    Confirmer
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn"
                                                    onClick={() =>
                                                        document
                                                            .getElementById(
                                                                "confirm_disconnect_modal",
                                                            )
                                                            ?.close()
                                                    }
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </form>
                                    </dialog>
                                    <dialog id="confirm_delete_modal" className="modal">
                                        <form method="dialog" className="modal-box">
                                            <h3 className="font-bold text-lg text-center">
                                                Confirmer la suppression
                                            </h3>
                                            <p className="italic text-center">
                                                Cette action supprimera définitivement le
                                                compte de l'utilisateur.
                                            </p>
                                            <div className="modal-action justify-between">
                                                <button
                                                    type="button"
                                                    className="btn btn-error"
                                                    onClick={handleDeleteAccount}
                                                >
                                                    Confirmer
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn"
                                                    onClick={() =>
                                                        document
                                                            .getElementById(
                                                                "confirm_delete_modal",
                                                            )
                                                            ?.close()
                                                    }
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </form>
                                    </dialog>

                                    <dialog id="reset_password_modal" className="modal">
                                        <form method="dialog" className="modal-box">
                                            <h3 className="font-bold text-lg text-center">
                                                Mot de passe temporaire
                                            </h3>
                                            <p className="italic text-center mb-2">
                                                Communiquez ce mot de passe à
                                                l'utilisateur. Il sera invité à le changer
                                                à sa prochaine connexion.
                                            </p>
                                            <div className="join w-full">
                                                <input
                                                    readOnly
                                                    value={tempPassword}
                                                    className="input input-bordered join-item w-full"
                                                />
                                                <button
                                                    type="button"
                                                    className="btn join-item"
                                                    onClick={async () => {
                                                        try {
                                                            await navigator.clipboard.writeText(
                                                                tempPassword,
                                                            );
                                                        } catch {
                                                            // noop
                                                        }
                                                    }}
                                                >
                                                    Copier
                                                </button>
                                            </div>
                                            <div className="modal-action">
                                                <button className="btn">Fermer</button>
                                            </div>
                                        </form>
                                    </dialog>
                                </div>

                                {/* Modifications (hors statut/date d'inscription) */}
                                <div className="bg-base-200 p-6 rounded-3xl shadow-lg flex flex-col gap-3">
                                    <h3 className="text-sm uppercase opacity-60 mb-1">
                                        Modifications
                                    </h3>
                                    {saveError && (
                                        <div className="alert alert-error">
                                            <span>{saveError}</span>
                                        </div>
                                    )}
                                    {saveSuccess && (
                                        <div className="alert alert-success">
                                            <span>{saveSuccess}</span>
                                        </div>
                                    )}
                                    <form
                                        onSubmit={handleSubmit(onAddModification)}
                                        className="flex flex-col gap-3"
                                    >
                                        <div className="flex flex-col md:flex-row gap-2">
                                            <select
                                                className="select select-bordered md:w-1/3 w-full"
                                                {...register("field", { required: true })}
                                                disabled={
                                                    !dicPermModify[
                                                        user?.privileges
                                                    ]?.includes(checkUser.privileges)
                                                }
                                            >
                                                <option value="">Sélectionner</option>
                                                {Object.entries(fieldConfig)
                                                    .filter(
                                                        ([k]) =>
                                                            ![
                                                                "inscription_date",
                                                                "inscription_status",
                                                                "privileges",
                                                            ].includes(k),
                                                    )
                                                    .map(([key, cfg]) => (
                                                        <option key={key} value={key}>
                                                            {cfg.label}
                                                        </option>
                                                    ))}
                                            </select>
                                            <div className="flex-1">
                                                {selectedField &&
                                                    (() => {
                                                        const cfg =
                                                            fieldConfig[selectedField];
                                                        if (!cfg) return null;
                                                        if (
                                                            cfg.type === "text" ||
                                                            cfg.type === "email" ||
                                                            cfg.type === "number"
                                                        ) {
                                                            return (
                                                                <input
                                                                    type={
                                                                        cfg.type ===
                                                                        "number"
                                                                            ? "number"
                                                                            : cfg.type
                                                                    }
                                                                    className={clsx(
                                                                        "input input-bordered w-full",
                                                                        {
                                                                            "input-error":
                                                                                errors.value,
                                                                        },
                                                                    )}
                                                                    placeholder={
                                                                        cfg.label
                                                                    }
                                                                    {...register(
                                                                        "value",
                                                                        {
                                                                            required: true,
                                                                            pattern:
                                                                                cfg.pattern,
                                                                        },
                                                                    )}
                                                                    disabled={
                                                                        !dicPermModify[
                                                                            user
                                                                                ?.privileges
                                                                        ]?.includes(
                                                                            checkUser.privileges,
                                                                        )
                                                                    }
                                                                />
                                                            );
                                                        }
                                                        if (cfg.type === "select") {
                                                            return (
                                                                <select
                                                                    className={clsx(
                                                                        "select select-bordered w-full",
                                                                        {
                                                                            "select-error":
                                                                                errors.value,
                                                                        },
                                                                    )}
                                                                    {...register(
                                                                        "value",
                                                                        {
                                                                            required: true,
                                                                        },
                                                                    )}
                                                                    disabled={
                                                                        !dicPermModify[
                                                                            user
                                                                                ?.privileges
                                                                        ]?.includes(
                                                                            checkUser.privileges,
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        {cfg.label}
                                                                    </option>
                                                                    {cfg.options.map(
                                                                        (o) => (
                                                                            <option
                                                                                key={
                                                                                    o.value
                                                                                }
                                                                                value={
                                                                                    o.value
                                                                                }
                                                                            >
                                                                                {o.label}
                                                                            </option>
                                                                        ),
                                                                    )}
                                                                </select>
                                                            );
                                                        }
                                                        if (
                                                            selectedField === "rp_grade"
                                                        ) {
                                                            const service =
                                                                checkUser.rp_service; // 'gn' | 'pn' | 'pm'
                                                            const grades =
                                                                service === "gn"
                                                                    ? gradeGendarmerie
                                                                    : service === "pn"
                                                                    ? gradePoliceNationale
                                                                    : gradePoliceMunicipale;
                                                            return (
                                                                <select
                                                                    className={clsx(
                                                                        "select select-bordered w-full",
                                                                        {
                                                                            "select-error":
                                                                                errors.value,
                                                                        },
                                                                    )}
                                                                    {...register(
                                                                        "value",
                                                                        {
                                                                            required: true,
                                                                            validate: (
                                                                                v,
                                                                            ) =>
                                                                                !!frontToGrades(
                                                                                    v,
                                                                                ),
                                                                        },
                                                                    )}
                                                                    disabled={
                                                                        !dicPermModify[
                                                                            user
                                                                                ?.privileges
                                                                        ]?.includes(
                                                                            checkUser.privileges,
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="">
                                                                        Grade
                                                                    </option>
                                                                    {grades.map((g) => (
                                                                        <option
                                                                            key={g}
                                                                            value={frontToGrades(
                                                                                g,
                                                                            )}
                                                                        >
                                                                            {g}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            );
                                                        }
                                                        if (cfg.type === "date") {
                                                            return (
                                                                <div className="w-full">
                                                                    <RHFDateText
                                                                        control={control}
                                                                        name="value"
                                                                        className="input input-bordered w-full"
                                                                        rules={{
                                                                            required: true,
                                                                        }}
                                                                        disabled={
                                                                            !dicPermModify[
                                                                                user
                                                                                    ?.privileges
                                                                            ]?.includes(
                                                                                checkUser.privileges,
                                                                            )
                                                                        }
                                                                    />
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })()}
                                            </div>
                                            <button
                                                type="submit"
                                                className="btn btn-primary md:w-auto w-full"
                                                disabled={
                                                    !dicPermModify[
                                                        user?.privileges
                                                    ]?.includes(checkUser.privileges)
                                                }
                                            >
                                                Ajouter
                                            </button>
                                        </div>
                                    </form>

                                    {/* Liste des modifications en attente */}
                                    <div className="mt-2">
                                        {!modifications.length ? (
                                            <div className="text-center italic opacity-60">
                                                Aucune modification en attente
                                            </div>
                                        ) : (
                                            <ul className="space-y-2">
                                                {modifications.map((m) => (
                                                    <li
                                                        key={m.field}
                                                        className="flex items-center justify-between bg-base-100 p-2 rounded-md border border-base-content/10"
                                                    >
                                                        <div>
                                                            <span className="font-semibold mr-2">
                                                                {fieldConfig[m.field]
                                                                    ?.label || m.field}
                                                                :
                                                            </span>
                                                            <span className="italic">
                                                                {m.label}
                                                            </span>
                                                        </div>
                                                        <button
                                                            className="btn btn-sm btn-ghost"
                                                            onClick={() =>
                                                                removeModification(
                                                                    m.field,
                                                                )
                                                            }
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="flex justify-between mt-2">
                                        <button
                                            className="btn"
                                            onClick={clearModifications}
                                            disabled={!modifications.length}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            className={clsx("btn btn-primary", {
                                                "btn-disabled":
                                                    saving ||
                                                    !modifications.length ||
                                                    !dicPermModify[
                                                        user?.privileges
                                                    ]?.includes(checkUser.privileges),
                                            })}
                                            onClick={submitAll}
                                        >
                                            {saving ? (
                                                <>
                                                    <span className="loading loading-dots mr-2" />
                                                    Enregistrement…
                                                </>
                                            ) : (
                                                "Enregistrer"
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Permissions */}
                                <div className="bg-base-200 p-6 rounded-3xl shadow-lg flex flex-col gap-3">
                                    <h3 className="text-sm uppercase opacity-60 mb-1">
                                        Permissions
                                    </h3>
                                    {!isOwner && (
                                        <div className="alert alert-warning">
                                            <span>
                                                Seul un propriétaire peut modifier les
                                                privilèges.
                                            </span>
                                        </div>
                                    )}
                                    {permError && (
                                        <div className="alert alert-error">
                                            <span>{permError}</span>
                                        </div>
                                    )}
                                    {permSuccess && (
                                        <div className="alert alert-success">
                                            <span>{permSuccess}</span>
                                        </div>
                                    )}
                                    <div className="flex flex-col md:flex-row gap-2 items-center md:justify-between">
                                        <select
                                            className="select select-bordered md:w-1/2 w-full"
                                            value={permValue}
                                            onChange={(e) => setPermValue(e.target.value)}
                                            disabled={!isOwner || permSaving}
                                        >
                                            <option value="player">Utilisateur</option>
                                            <option value="mod">Modérateur</option>
                                            <option value="admin">Administrateur</option>
                                            <option value="owner">Propriétaire</option>
                                        </select>
                                        <button
                                            className={clsx("btn btn-primary", {
                                                "btn-disabled":
                                                    !isOwner ||
                                                    permSaving ||
                                                    !permValue ||
                                                    permValue === checkUser?.privileges,
                                            })}
                                            onClick={handleSetPrivileges}
                                        >
                                            {permSaving ? (
                                                <>
                                                    <span className="loading loading-dots mr-2" />
                                                    Mise à jour…
                                                </>
                                            ) : (
                                                "Mettre à jour"
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminAuthCheck>
    );
}

export default AdminProfilePage;
