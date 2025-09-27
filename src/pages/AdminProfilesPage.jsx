import React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

// LOCAL
import { useAuthStore } from "../stores/authStore";
import Renamer from "../components/Renamer";
import AdminAuthCheck from "../components/AdminAuthCheck";
import DefaultHeader from "../components/Header";
import LoadingComponent from "../components/LoadingComponent";
import formatName from "../tools/formatName";
import { privilegesToFront } from "../tools/privilegesTranslate";
import { frontToGrades, gradesToFront } from "../tools/gradesTranslate";
import { frontToQualification } from "../tools/qualificationTranslate";
import { qualificationToFront } from "../tools/qualificationTranslate";
import { affectationToFront, frontToAffectation } from "../tools/affectationTranslate";
import { frontToServer, serverToFront } from "../tools/serverTranslate";
import { serviceToFront } from "../tools/serviceTranslate";
import { useNavigate } from "react-router-dom";
import API from "../global/API";
import clsx from "clsx";
import "../App.css";
import { useParams } from "react-router-dom";

function AdminProfilePage() {
    const { id } = useParams();
    const { token } = useAuthStore();
    const [checkUser, setCheckUser] = useState(null);
    const [error, setError] = useState(null);
    const [modifications, setModifications] = useState([]); // [{field, value, label}]
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState("");
    const [tempPassword, setTempPassword] = useState("");
    const navigate = useNavigate();

    const handleResetPassword = async () => {
        if (!id || !token) return;
        setSaveError("");
        setSaveSuccess("");

        // Générer un mot de passe temporaire (plus long + complexe)
        const generateTempPassword = () => {
            const chars =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+";
            let password = "";
            const length = 12; // augmenter si besoin
            for (let i = 0; i < length; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return password;
        };

        const newTemp = generateTempPassword();
        setTempPassword(newTemp); // setState async, on réutilise newTemp pour la requête
        try {
            const response = await axios.post(
                `${API}/admin/users/${id}/password`,
                { new_password: newTemp },
                { headers: { Authorization: `Bearer ${token}` } },
            );
            setSaveSuccess("Mot de passe réinitialisé avec succès.");
            console.log("Password reset response:", response.data);
        } catch (error) {
            console.error("Error resetting password:", error);
            setSaveError("Impossible de réinitialiser le mot de passe.");
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

    // react-hook-form pour ajout d'une modification à la fois
    const {
        register,
        handleSubmit,
        reset,
        watch,
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

        // Label lisible (toujours côté front) + valeur envoyée côté backend
        let label;
        if (cfg.type === "select") {
            label = cfg.options.find((o) => o.value === inputValue)?.label || inputValue;
        } else if (cfg.type === "grade-select") {
            // inputValue est déjà le code backend (ex: lcl). On reconvertit vers le label lisible.
            label = gradesToFront(inputValue) || inputValue;
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
                                            <span>{formatName(checkUser.last_name)}</span>
                                        </div>
                                        <div className="w-fit">
                                            <span className="font-bold">Prénom: </span>
                                            <span>
                                                {formatName(checkUser.first_name)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center items-left w-full gap-5">
                                        <div className="w-fit">
                                            <span className="font-bold">Mail: </span>
                                            <span>{checkUser.email}</span>
                                        </div>
                                        <div className="w-fit">
                                            <span className="font-bold">
                                                Identifiant Discord:{" "}
                                            </span>
                                            <span>{checkUser.discord_id}</span>
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
                                            <span>{checkUser.inscription_date}</span>
                                        </div>
                                        <div className="w-fit">
                                            <span className="font-bold">Statut: </span>
                                            <span
                                                className={clsx({
                                                    "badge-success badge":
                                                        checkUser.inscription_status ===
                                                        "valid",
                                                    "badge-warning badge":
                                                        checkUser.inscription_status ===
                                                        "pending",
                                                    "badge-error badge":
                                                        checkUser.inscription_status ===
                                                        "denied",
                                                })}
                                            >
                                                {checkUser.inscription_status === "valid"
                                                    ? "Validé"
                                                    : checkUser.inscription_status ===
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
                                            "badge-primary":
                                                checkUser.privileges === "admin",
                                            "badge-info": checkUser.privileges === "mod",
                                            "badge-warning":
                                                checkUser.privileges === "owner",
                                            "badge-success":
                                                checkUser.privileges === "player",
                                        })}
                                    >
                                        {privilegesToFront(checkUser.privileges)}
                                    </span>
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
                                            <span>
                                                {formatName(checkUser.rp_last_name)}
                                            </span>
                                        </div>
                                        <div className="w-fit">
                                            <span className="font-bold">Prénom: </span>
                                            <span>
                                                {formatName(checkUser.rp_first_name)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-center items-left w-full gap-5">
                                        <div className="w-fit">
                                            <span className="font-bold">
                                                Date de naissance:{" "}
                                            </span>
                                            <span>{checkUser.rp_birthdate}</span>
                                        </div>
                                        <div className="w-fit">
                                            <span className="font-bold">Sexe: </span>
                                            <span>
                                                {checkUser.rp_gender == "male"
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
                                            <span className="font-bold">Service: </span>
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
                                        <div className="w-fit">
                                            <span className="font-bold">Grade: </span>
                                            <span>
                                                {gradesToFront(checkUser.rp_grade)}
                                            </span>
                                        </div>
                                        <div className="w-fit">
                                            <span className="font-bold">
                                                {checkUser.rp_service === "gn"
                                                    ? "NIGEND : "
                                                    : "NIPOL : "}
                                            </span>
                                            <span>{checkUser.rp_nipol}</span>
                                        </div>
                                        <div className="w-fit">
                                            <span className="font-bold">
                                                Qualification:{" "}
                                            </span>
                                            <span>
                                                {qualificationToFront(
                                                    checkUser.rp_qualif,
                                                )}
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
                                                {checkUser.rp_affectation}
                                                {" : "}
                                            </span>
                                            <span>
                                                {affectationToFront(
                                                    checkUser.rp_affectation,
                                                )}
                                            </span>
                                            <span className="badge badge-info badge-sm ml-2">
                                                {serverToFront(checkUser.rp_server)}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col m-6 gap-4">
                            <div className="bg-base-200 p-6 rounded-3xl shadow-lg flex flex-col gap-4 h-fit border border-info">
                                <h2 className="text-xl font-bold text-center text-neutral">
                                    Administration du Profil
                                </h2>
                                <p className="text-center italic">
                                    de : {formatName(checkUser.first_name)}{" "}
                                    {formatName(checkUser.last_name)}
                                    <br />
                                    Alias : {formatName(checkUser.rp_first_name)}{" "}
                                    {formatName(checkUser.rp_last_name)}
                                </p>
                                <button
                                    className="btn btn-info"
                                    onClick={() => navigate("/admin")}
                                >
                                    Retour à la liste
                                </button>
                            </div>
                            <div className="bg-base-200 p-6 rounded-3xl shadow-lg flex flex-col gap-4 h-fit border border-info">
                                <h2 className="text-xl font-bold text-center text-neutral">
                                    Modification du profil
                                </h2>
                                <div className="bg-base-300 p-4 rounded-xl flex flex-col gap-3">
                                    <h3 className="text-center italic">
                                        Réinitialisation du Mot de Passe
                                    </h3>
                                    <button
                                        className="btn btn-warning"
                                        onClick={handleResetPassword}
                                    >
                                        Réinitialiser
                                    </button>
                                    {tempPassword ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <p>Mot de Passe Temporaire :</p>
                                            <span className="text-center italic p-1 bg-info rounded-lg w-fit">
                                                {tempPassword}
                                            </span>
                                        </div>
                                    ) : null}
                                </div>
                                <div className="bg-base-300 p-4 rounded-xl flex flex-col gap-3">
                                    <form
                                        onSubmit={handleSubmit(onAddModification)}
                                        className="flex flex-col gap-3"
                                    >
                                        <div className="flex flex-col md:flex-row gap-2">
                                            <select
                                                className={clsx(
                                                    "select select-bordered w-full",
                                                    { "select-error": errors.field },
                                                )}
                                                {...register("field", {
                                                    required: "Champ requis",
                                                })}
                                            >
                                                <option value="">
                                                    Quel champ modifier ?
                                                </option>
                                                {Object.entries(fieldConfig).map(
                                                    ([key, cfg]) => (
                                                        <option key={key} value={key}>
                                                            {cfg.label} ({key})
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                            {/* Input dynamique */}
                                            {selectedField &&
                                                fieldConfig[selectedField] &&
                                                (() => {
                                                    const cfg =
                                                        fieldConfig[selectedField];
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
                                                                {...register("value", {
                                                                    required:
                                                                        "Valeur requise",
                                                                })}
                                                            >
                                                                <option value="">
                                                                    Valeur...
                                                                </option>
                                                                {cfg.options.map((o) => (
                                                                    <option
                                                                        key={o.value}
                                                                        value={o.value}
                                                                    >
                                                                        {o.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        );
                                                    }
                                                    if (cfg.type === "grade-select") {
                                                        // On dépend du service potentiellement déjà dans modifications ou dans checkUser
                                                        const serviceMod =
                                                            modifications.find(
                                                                (m) =>
                                                                    m.field ===
                                                                    "rp_service",
                                                            );
                                                        const effectiveService =
                                                            serviceMod
                                                                ? serviceMod.value
                                                                : checkUser?.rp_service; // gn/pn/pm
                                                        let grades = [];
                                                        if (effectiveService === "gn")
                                                            grades = gradeGendarmerie;
                                                        else if (
                                                            effectiveService === "pn"
                                                        )
                                                            grades = gradePoliceNationale;
                                                        else if (
                                                            effectiveService === "pm"
                                                        )
                                                            grades =
                                                                gradePoliceMunicipale;
                                                        return (
                                                            <select
                                                                className={clsx(
                                                                    "select select-bordered w-full",
                                                                    {
                                                                        "select-error":
                                                                            errors.value,
                                                                    },
                                                                )}
                                                                disabled={
                                                                    !effectiveService
                                                                }
                                                                {...register("value", {
                                                                    required:
                                                                        "Valeur requise",
                                                                })}
                                                            >
                                                                <option value="">
                                                                    {effectiveService
                                                                        ? "Grade..."
                                                                        : "Choisir service d'abord"}
                                                                </option>
                                                                {grades.map((g) => (
                                                                    <option
                                                                        key={g}
                                                                        label={g}
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
                                                    return (
                                                        <input
                                                            type={cfg.type}
                                                            className={clsx(
                                                                "input input-bordered w-full",
                                                                {
                                                                    "input-error":
                                                                        errors.value,
                                                                },
                                                            )}
                                                            {...register("value", {
                                                                required:
                                                                    "Valeur requise",
                                                                pattern: cfg.pattern
                                                                    ? {
                                                                          value: cfg.pattern,
                                                                          message:
                                                                              "Format invalide",
                                                                      }
                                                                    : undefined,
                                                            })}
                                                            placeholder={cfg.label}
                                                        />
                                                    );
                                                })()}
                                            <button
                                                type="submit"
                                                className="btn btn-primary md:w-32"
                                            >
                                                Ajouter
                                            </button>
                                        </div>
                                        {errors.field && (
                                            <span className="text-error text-sm">
                                                {errors.field.message}
                                            </span>
                                        )}
                                        {errors.value && (
                                            <span className="text-error text-sm">
                                                {errors.value.message}
                                            </span>
                                        )}
                                    </form>
                                    {/* Liste des modifications préparées */}
                                    {modifications.length > 0 && (
                                        <div className="flex flex-col gap-2">
                                            <h4 className="font-bold text-sm">
                                                Modifications en attente :
                                            </h4>
                                            <ul className="flex flex-col gap-1">
                                                {modifications.map((m) => (
                                                    <li
                                                        key={m.field}
                                                        className="flex items-center justify-between bg-base-100 rounded-xl px-3 py-2 text-sm"
                                                    >
                                                        <span>
                                                            <span className="font-bold">
                                                                {
                                                                    fieldConfig[m.field]
                                                                        ?.label
                                                                }{" "}
                                                                :
                                                            </span>{" "}
                                                            {m.label}
                                                        </span>
                                                        <button
                                                            className="btn btn-xs btn-error"
                                                            onClick={() =>
                                                                removeModification(
                                                                    m.field,
                                                                )
                                                            }
                                                            type="button"
                                                        >
                                                            Retirer
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    className={clsx(
                                                        "btn btn-success flex-1",
                                                        { "btn-disabled": saving },
                                                    )}
                                                    onClick={submitAll}
                                                    type="button"
                                                >
                                                    {saving ? (
                                                        <span className="loading loading-dots" />
                                                    ) : (
                                                        "Enregistrer"
                                                    )}
                                                </button>
                                                <button
                                                    className="btn btn-outline btn-warning"
                                                    onClick={clearModifications}
                                                    type="button"
                                                >
                                                    Vider
                                                </button>
                                            </div>
                                            {saveError && (
                                                <div className="badge badge-error mt-2">
                                                    {saveError}
                                                </div>
                                            )}
                                            {saveSuccess && (
                                                <div className="badge badge-success mt-2">
                                                    {saveSuccess}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {modifications.length === 0 && (
                                        <div className="text-xs italic opacity-70">
                                            Aucune modification en attente.
                                        </div>
                                    )}
                                </div>
                            </div>
                            {checkUser.temp_password && (
                                <div className="bg-error/5 p-6 rounded-3xl shadow-lg flex flex-col gap-4 h-fit border border-error border-dashed">
                                    <h2 className="text-xl font-bold text-center text-neutral">
                                        Avertissement
                                    </h2>
                                    <p className="text-center italic">
                                        Le mot de passe de cet utilisateur est un mot de
                                        passe temporaire. <br /> Merci de lui rappeler de
                                        le changer dès sa prochaine connexion.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AdminAuthCheck>
    );
}

export default AdminProfilePage;
