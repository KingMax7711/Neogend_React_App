import React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link, Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import RHFDateText from "../../components/RHFDateText.jsx";
import axios from "axios";
import API from "../../global/API.js";
import Renamer from "../../components/Renamer.jsx";

import DefaultHeader from "../../components/Header.jsx";
import AdminAuthCheck from "../../components/AdminAuthCheck.jsx";
import { useAuthStore } from "../../stores/authStore.js";
import { privilegesToFront } from "../../tools/privilegesTranslate.js";
import formatName from "../../tools/formatName.js";
import clsx from "clsx";
import { frontToServer } from "../../tools/serverTranslate.js";
import { frontToAffectation } from "../../tools/affectationTranslate.js";
import { frontToGrades } from "../../tools/gradesTranslate.js";
import { frontToService } from "../../tools/serviceTranslate.js";
import { frontToQualification } from "../../tools/qualificationTranslate.js";

const filesList = [
    { name: "fnpc", fullName: "Fichier National des Permis de Conduire" },
    { name: "fpr", fullName: "Fichier des Personnes Recherchées" },
    { name: "taj", fullName: "Titre d'Antécédents Judiciaires" },
    { name: "fijait", fullName: "Fichier des Auteurs d'Infraction Terroristes" },
    { name: "siv", fullName: "Système d'Immatriculation des Véhicules" },
    { name: "foves", fullName: "Fichier des Objets et des Véhicules Signalés" },
    { name: "proprio", fullName: "Propriétaire" },
    { name: "infrac", fullName: "Infractions" },
];

function FileInspectGridCase({ fileName, fullName }) {
    return (
        <div className="bg-base-100 p-6 rounded-3xl shadow-lg border border-primary max-w-80">
            <div className="flex flex-col items-center xl:justify-between">
                <span className="font-bold">{fileName.toUpperCase()}</span>
                <div className="flex gap-1">
                    <Link
                        to={`/admin/files/${fileName}`}
                        className="btn btn-warning btn-sm"
                    >
                        Consulter
                    </Link>
                </div>
                <p className="italic text-center mt-2 text-sm">{fullName}</p>
            </div>
        </div>
    );
}

function AdminHomePage() {
    const { user, token } = useAuthStore();
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [createUserLoading, setCreateUserLoading] = useState(false);
    const [createUserError, setCreateUserError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentTempPassword, setCurrentTempPassword] = useState("");
    const firstLoadRef = useRef(true);
    const prevHashRef = useRef("");
    const navigate = useNavigate();

    // Formulaire de création de notification (modal)
    const {
        register: registerNotif,
        handleSubmit: handleNotifSubmit,
        reset: resetNotif,
        watch: watchNotif,
        formState: { errors: notifErrors, isSubmitting: notifSubmitting },
    } = useForm({
        defaultValues: {
            target: "one", // 'one' | 'all'
            user_id: "",
            title: "",
            message: "",
            redirect_to: "",
        },
    });
    const [notifError, setNotifError] = useState("");
    const [notifSuccess, setNotifSuccess] = useState("");

    const handleManageNotifications = async (data) => {
        try {
            setNotifError("");
            setNotifSuccess("");
            const payloadBase = {
                title: (data.title || "").trim(),
                message: (data.message || "").trim(),
                redirect_to: (data.redirect_to || "").trim() || null,
            };

            if (!payloadBase.title || !payloadBase.message) {
                setNotifError("Titre et message sont requis.");
                return;
            }

            if (data.target === "all") {
                await axios.post(`${API}/notifications/create_all/`, payloadBase, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                const userId = Number(data.user_id);
                if (!userId) {
                    setNotifError("Veuillez sélectionner un utilisateur.");
                    return;
                }
                await axios.post(
                    `${API}/notifications/create/`,
                    { ...payloadBase, user_id: userId },
                    { headers: { Authorization: `Bearer ${token}` } },
                );
            }

            setNotifSuccess("Notification envoyée avec succès.");
            resetNotif({
                target: data.target,
                user_id: "",
                title: "",
                message: "",
                redirect_to: "",
            });
            // Fermer le modal après un bref délai pour laisser voir le succès
            setTimeout(() => {
                const dlg = document.getElementById("manage_notifications_modal");
                if (dlg) dlg.close();
                setNotifSuccess("");
            }, 800);
        } catch (e) {
            console.error("Failed to create notification", e);
            const msg = e?.response?.data?.detail || "Erreur lors de l'envoi";
            setNotifError(msg);
        }
    };

    const handleCreateUser = (data) => {
        setCreateUserError("");
        setCreateUserLoading(true);
        const payload = {
            discord_id: data.discord_id, // déjà un nombre grâce à valueAsNumber
            rp_first_name: (data.rp_first_name || "").trim().toLowerCase(),
            rp_last_name: (data.rp_last_name || "").trim().toLowerCase(),
            rp_service: frontToService(data.rp_service),
            rp_nipol: data.rp_nipol, // nombre
            rp_grade: frontToGrades(data.rp_grade),
            rp_affectation: frontToAffectation(data.rp_affectation),
            rp_qualification: data.rp_qualification,
            rp_server: frontToServer(data.rp_server),
        };
        axios
            .post(`${API}/admin/register/`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setCurrentTempPassword(response.data.temp_password);
                // Reset du formulaire
                const form = document.querySelector("#create_user_modal form");
                if (form) {
                    form.reset();
                }
                // Fermer le modal
                const dlg = document.getElementById("create_user_modal");
                if (dlg) {
                    dlg.close();
                }
                // Ouvrir le modal du mot de passe temporaire
                const password_modal = document.getElementById("temp_password_modal");
                if (password_modal) {
                    password_modal.showModal();
                }

                // Réinitialiser le formulaire ou effectuer d'autres actions
            })
            .catch((err) => {
                console.error("Error creating user:", err);
                setCreateUserError(err.response?.data.detail || "Unknown error");
            })
            .finally(() => {
                setCreateUserLoading(false);
            });
    };

    useEffect(() => {
        // Ne lance rien tant que le token n'est pas prêt ou que l'utilisateur n'est pas admin
        const accesGranted = ["admin", "owner"];
        const isGranted = accesGranted.includes(user?.privileges);
        if (!token || !isGranted) return;

        let cancelled = false;

        const stableHash = (list) => {
            try {
                const norm = [...(list || [])]
                    .map((u) => ({
                        id: u?.id ?? u?.user_id ?? null,
                        email: u?.email ?? "",
                        first_name: u?.first_name ?? u?.firstName ?? "",
                        last_name: u?.last_name ?? u?.lastName ?? "",
                        rp_first_name: u?.rp_first_name ?? u?.rpFirstName ?? "",
                        rp_last_name: u?.rp_last_name ?? u?.rpLastName ?? "",
                        rp_nipol: u?.rp_nipol ?? u?.nipol ?? "",
                        privileges: u?.privileges ?? "player",
                        inscription_date: u?.inscription_date ?? null,
                    }))
                    .sort(
                        (a, b) =>
                            (a.id ?? 0) - (b.id ?? 0) || a.email.localeCompare(b.email),
                    );
                return JSON.stringify(norm);
            } catch {
                return "";
            }
        };

        const fetchUsers = async () => {
            if (cancelled) return;
            try {
                if (firstLoadRef.current) setLoading(true);
                setError("");
                const response = await axios.get(`${API}/admin/users/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!cancelled) {
                    const next = response.data || [];
                    const nextHash = stableHash(next);
                    if (nextHash !== prevHashRef.current) {
                        setUsersList(next);
                        prevHashRef.current = nextHash;
                    }
                }
            } catch (err) {
                console.error("Error fetching users:", err);
                if (!cancelled) {
                    setError(
                        err?.response?.data?.detail ||
                            "Impossible de charger les utilisateurs.",
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    firstLoadRef.current = false;
                }
            }
        };

        const poll = () => {
            if (document.hidden) return; // ignore si onglet caché
            fetchUsers();
        };

        fetchUsers();
        const intervalId = setInterval(poll, 30000);
        const onVisibility = () => {
            if (!document.hidden) fetchUsers();
        };
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            cancelled = true;
            clearInterval(intervalId);
            document.removeEventListener("visibilitychange", onVisibility);
        };
        // NOTE: on NE met PAS usersList en dépendance pour éviter des fetchs en boucle.
    }, [token, user]);

    const TableRow = ({ u }) => (
        <tr key={u.id}>
            <td>{u.id}</td>
            <td>
                {u.inscription_status === "valid" ? (
                    <span className="status status-success"></span>
                ) : (
                    <span className="status status-warning"></span>
                )}
                {" " +
                    formatName(u.first_name) +
                    " " +
                    (u?.last_name ? u.last_name.slice(0, 1).toUpperCase() : "") +
                    (u?.last_name ? "." : "")}
            </td>
            <td>
                <span className="italic">
                    {" " +
                        formatName(u.rp_first_name) +
                        " " +
                        (u?.rp_last_name
                            ? u.rp_last_name.slice(0, 1).toUpperCase()
                            : "") +
                        (u?.rp_last_name ? "." : "")}
                </span>
            </td>
            <td>
                {u.rp_service === "gn" ? (
                    <span className="status status-primary"></span>
                ) : (
                    <span className="status status-info"></span>
                )}{" "}
                <span className="italic">{u.rp_nipol}</span>
            </td>

            <td>{u.email}</td>
            <td>
                <span
                    className={clsx("badge badge-md", {
                        "badge-primary": u.privileges === "admin",
                        "badge-info": u.privileges === "mod",
                        "badge-warning": u.privileges === "owner",
                        "badge-success": u.privileges === "player",
                    })}
                >
                    {privilegesToFront(u.privileges)}
                </span>
            </td>
            <td>
                <Link
                    className="btn btn-primary btn-outline w-30"
                    to={`/admin/user/${u.id}`}
                >
                    Consulter
                </Link>
            </td>
        </tr>
    );

    const userMobileCard = (u) => (
        <div
            key={u.id}
            className="bg-base-100 p-4 rounded-3xl shadow-lg flex flex-col gap-3 mt-2"
        >
            <div className="flex justify-between items-center">
                <span className="font-bold text-lg">
                    {u.inscription_status === "valid" ? (
                        <span className="status status-success"></span>
                    ) : (
                        <span className="status status-warning"></span>
                    )}{" "}
                    {formatName(u.first_name)}{" "}
                    {u?.last_name ? u.last_name.slice(0, 1).toUpperCase() + "." : ""}
                </span>
                <span
                    className={clsx("badge badge-md ml-2", {
                        "badge-primary": u.privileges === "admin",
                        "badge-info": u.privileges === "mod",
                        "badge-warning": u.privileges === "owner",
                        "badge-success": u.privileges === "player",
                    })}
                >
                    {privilegesToFront(u.privileges)}
                </span>
            </div>
            <div className="flex flex-col gap-1">
                <span>
                    <span className="font-bold">ID :</span> {u.id}
                </span>
                <span>
                    <span className="font-bold">
                        {u.rp_service == "gn" ? "NIGEND" : "NIPOL"}
                    </span>{" "}
                    {u.rp_nipol}
                </span>
                <span>
                    <span className="font-bold">Email :</span> {u.email}
                </span>
                <span>
                    <span className="font-bold">Statut :</span>{" "}
                    {u.inscription_status === "valid" ? (
                        <span className="badge badge-success">Validé</span>
                    ) : (
                        <span className="badge badge-warning">En attente</span>
                    )}
                </span>
            </div>
            <div className="flex gap-2 mt-2">
                <Link
                    className="btn btn-primary btn-outline flex-1"
                    to={`/admin/user/${u.id}`}
                >
                    Consulter
                </Link>
            </div>
        </div>
    );

    // Sort usersList by ID before rendering
    const sortedUsersList = [...usersList].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

    // Normalisation pour recherche (supprime accents + lower)
    const norm = (str) =>
        (str || "")
            .toString()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase();

    const serviceList = [
        "Gendarmerie Nationale",
        "Police Nationale",
        "Police Municipale",
    ];

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

    const {
        register,
        handleSubmit,
        watch,
        // eslint-disable-next-line no-unused-vars
        control,
        formState: { errors },
    } = useForm();
    const filterUsers = (list, termRaw) => {
        const term = norm(termRaw.trim());
        if (!term) return list;
        return list.filter((u) => {
            const fullName = norm(`${u.first_name || ""} ${u.last_name || ""}`);
            const fullRpName = norm(`${u.rp_first_name || ""} ${u.rp_last_name || ""}`);
            const emailN = norm(u.email);
            const idN = String(u.id || "");
            const nipolN = String(u.rp_nipol || "");
            const privRaw = norm(u.privileges);
            const privFront = norm(privilegesToFront(u.privileges));
            return (
                fullName.includes(term) ||
                fullRpName.includes(term) ||
                emailN.includes(term) ||
                idN.includes(term) ||
                nipolN.includes(term) ||
                privRaw.includes(term) ||
                privFront.includes(term)
            );
        });
    };

    const handleForceLogout = async () => {
        await axios.post(`${API}/admin/users/disconnect_all/`, null, {
            headers: { Authorization: `Bearer ${token}` },
        });
        navigate("/login");
    };

    return (
        <AdminAuthCheck>
            <Renamer pageTitle={"Admin - Neogend"} />
            <div className="">
                <DefaultHeader />
                <div className="bg-base-200 p-6 rounded-3xl shadow-lg m-6 flex flex-col md:flex-row gap-8 h-fit w-fit mx-auto">
                    <div className="flex flex-col gap-4 justify-between md:justify-start items-center md:items-start">
                        <div className="flex flex-col md:flex-row  justify-between w-full gap-4">
                            {/* Gestion des Notifications */}
                            <div className="flex flex-col bg-base-300 p-6 rounded-3xl shadow-lg gap-2">
                                <h2 className="mb-1 text-center font-bold text-lg">
                                    Notifications
                                </h2>
                                <p className="italic text-center">
                                    Gérer les notifications
                                </p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() =>
                                        document
                                            .getElementById("manage_notifications_modal")
                                            .showModal()
                                    }
                                >
                                    Gérer
                                </button>
                            </div>
                            {/* Security Action */}
                            <div className="flex flex-col bg-error/5 border border-error/40 p-6 rounded-3xl shadow-lg gap-1 md:w-fit">
                                <h2 className="mb-2 text-center font-bold text-lg">
                                    Action de sécurité
                                </h2>
                                <div className="flex flex-col xxl:flex-row gap-4">
                                    <button
                                        className="btn btn-error btn-outline"
                                        onClick={() =>
                                            document
                                                .getElementById("discard_all_modal")
                                                .showModal()
                                        }
                                    >
                                        Forcer la déconnexion
                                    </button>
                                    <button
                                        className="btn btn-error btn-outline btn-disabled"
                                        disabled
                                    >
                                        Suspendre l'accès
                                    </button>
                                </div>
                                <dialog id="discard_all_modal" className="modal">
                                    <form
                                        method="dialog"
                                        className="modal-box"
                                        onSubmit={handleForceLogout}
                                    >
                                        <h2 className="font-bold text-lg text-center">
                                            Êtes-vous sûr de vouloir forcer la déconnexion
                                            de tous les utilisateurs ?
                                        </h2>
                                        <p className="text-center italic">
                                            Cette action déconnectera tous les
                                            utilisateurs actuellement connectés, y compris
                                            vous-même.
                                        </p>
                                        <div className="modal-action justify-between">
                                            <button
                                                type="submit"
                                                className="btn btn-error"
                                            >
                                                Oui, déconnecter
                                            </button>
                                            <button
                                                type="button"
                                                className="btn"
                                                onClick={() =>
                                                    document
                                                        .getElementById(
                                                            "discard_all_modal",
                                                        )
                                                        .close()
                                                }
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    </form>
                                </dialog>
                            </div>
                            <dialog id="manage_notifications_modal" className="modal">
                                <div className="modal-box max-w-xl">
                                    <h2 className="font-bold text-lg text-center">
                                        Nouvelle notification
                                    </h2>
                                    <p className="text-center italic mb-3">
                                        Envoyer une notification à un utilisateur ou à
                                        tous.
                                    </p>

                                    {notifError && (
                                        <div className="alert alert-error mb-3">
                                            <span>{notifError}</span>
                                        </div>
                                    )}
                                    {notifSuccess && (
                                        <div className="alert alert-success mb-3">
                                            <span>{notifSuccess}</span>
                                        </div>
                                    )}

                                    <form
                                        onSubmit={handleNotifSubmit(
                                            handleManageNotifications,
                                        )}
                                    >
                                        <div className="flex flex-col gap-3">
                                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                <label className="label cursor-pointer gap-2">
                                                    <input
                                                        type="radio"
                                                        className="radio"
                                                        value="one"
                                                        {...registerNotif("target")}
                                                        defaultChecked
                                                    />
                                                    <span className="label-text">
                                                        Un utilisateur
                                                    </span>
                                                </label>
                                                <label className="label cursor-pointer gap-2">
                                                    <input
                                                        type="radio"
                                                        className="radio"
                                                        value="all"
                                                        {...registerNotif("target")}
                                                    />
                                                    <span className="label-text">
                                                        Tous les utilisateurs
                                                    </span>
                                                </label>
                                            </div>

                                            {watchNotif("target") !== "all" && (
                                                <select
                                                    className={clsx(
                                                        "select select-bordered w-full",
                                                        {
                                                            "select-error":
                                                                notifErrors.user_id,
                                                        },
                                                    )}
                                                    {...registerNotif("user_id", {
                                                        required:
                                                            watchNotif("target") !==
                                                            "all",
                                                    })}
                                                >
                                                    <option value="">
                                                        Sélectionner un utilisateur…
                                                    </option>
                                                    {sortedUsersList.map((u) => (
                                                        <option key={u.id} value={u.id}>
                                                            #{u.id} —{" "}
                                                            {formatName(u.first_name)}{" "}
                                                            {u.last_name?.toUpperCase()}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}

                                            <input
                                                type="text"
                                                placeholder="Titre"
                                                className={clsx(
                                                    "input input-bordered w-full",
                                                    {
                                                        "input-error": notifErrors.title,
                                                    },
                                                )}
                                                {...registerNotif("title", {
                                                    required: true,
                                                })}
                                            />

                                            <textarea
                                                placeholder="Message"
                                                className={clsx(
                                                    "textarea textarea-bordered w-full min-h-32",
                                                    {
                                                        "textarea-error":
                                                            notifErrors.message,
                                                    },
                                                )}
                                                {...registerNotif("message", {
                                                    required: true,
                                                })}
                                            />

                                            <input
                                                type="text"
                                                placeholder="URL de redirection (optionnel)"
                                                className="input input-bordered w-full"
                                                {...registerNotif("redirect_to")}
                                            />
                                        </div>

                                        <div className="modal-action justify-between mt-4">
                                            <button
                                                type="submit"
                                                className={clsx("btn btn-primary", {
                                                    "btn-disabled": notifSubmitting,
                                                })}
                                            >
                                                {notifSubmitting ? (
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
                                                            "manage_notifications_modal",
                                                        )
                                                        .close()
                                                }
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    </form>

                                    <form method="dialog" className="modal-backdrop">
                                        <button>close</button>
                                    </form>
                                </div>
                            </dialog>
                        </div>
                        {/* Data Management */}
                        <div className="bg-base-300 p-6 rounded-3xl shadow-lg">
                            <h2 className="text-2xl font-bold mb-4 text-center">
                                Gestion des Fichiers
                            </h2>
                            <p className="mb-4 text-center italic">
                                Permet la consultation et la modification des fichiers
                            </p>
                            <div className="grid grid-cols-1 xxl:grid-cols-2 gap-2">
                                {filesList.map((fileName) => (
                                    <FileInspectGridCase
                                        key={fileName.name}
                                        fileName={fileName.name}
                                        fullName={fileName.fullName}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* User Management */}
                    <div className="bg-base-300 p-6 rounded-3xl shadow-lg flex flex-col gap-2 items-center w-fit">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] w-full items-center mb-4">
                            <div className="w-fit">
                                <span></span>
                            </div>
                            <h2 className="text-2xl font-bold text-center w-full md:w-fit">
                                Gestion des Utilisateurs
                            </h2>
                            <div className="md:w-fit md:justify-self-end w-full flex justify-center md:block">
                                <button
                                    className="btn btn-primary"
                                    onClick={() =>
                                        document
                                            .getElementById("create_user_modal")
                                            .showModal()
                                    }
                                >
                                    Créer un Utilisateur
                                </button>
                                <dialog id="create_user_modal" className="modal">
                                    <div className="modal-box">
                                        <h3 className="font-bold text-lg text-center">
                                            Créer un Utilisateur
                                        </h3>
                                        <p className="py-4 italic">
                                            Information Personnelle :
                                        </p>
                                        <form onSubmit={handleSubmit(handleCreateUser)}>
                                            <div className="flex flex-col gap-2">
                                                <input
                                                    className={clsx(
                                                        "input input-bordered w-full",
                                                        {
                                                            "input-error":
                                                                errors.discord_id,
                                                        },
                                                    )}
                                                    type="number"
                                                    placeholder="ID Discord"
                                                    {...register("discord_id", {
                                                        required: true,
                                                    })}
                                                />
                                                <select
                                                    className={clsx(
                                                        "select select-bordered w-full",
                                                        {
                                                            "select-error":
                                                                errors.rp_server,
                                                        },
                                                    )}
                                                    {...register("rp_server", {
                                                        required: true,
                                                        validate: (value) =>
                                                            frontToServer(value) !==
                                                            "Aucun",
                                                    })}
                                                >
                                                    <option value="">Serveur</option>
                                                    {serverList.map((server) => (
                                                        <option
                                                            key={server}
                                                            value={server}
                                                        >
                                                            {server}
                                                        </option>
                                                    ))}
                                                </select>
                                                <p className="italic">Information RP :</p>
                                                <div className="flex gap-2">
                                                    <input
                                                        className={clsx(
                                                            "input input-bordered w-full",
                                                            {
                                                                "input-error":
                                                                    errors.rp_first_name,
                                                            },
                                                        )}
                                                        type="text"
                                                        placeholder="Prénom RP"
                                                        {...register("rp_first_name", {
                                                            required: true,
                                                        })}
                                                    />
                                                    <input
                                                        className={clsx(
                                                            "input input-bordered w-full",
                                                            {
                                                                "input-error":
                                                                    errors.rp_last_name,
                                                            },
                                                        )}
                                                        type="text"
                                                        placeholder="Nom RP"
                                                        {...register("rp_last_name", {
                                                            required: true,
                                                        })}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <select
                                                        className={clsx(
                                                            "select select-bordered w-1/2",
                                                            {
                                                                "input-error":
                                                                    errors.rp_service,
                                                            },
                                                        )}
                                                        {...register("rp_service", {
                                                            required: true,
                                                            validate: (value) =>
                                                                frontToService(value) !==
                                                                "Aucun",
                                                        })}
                                                    >
                                                        <option value="">Service</option>
                                                        {serviceList.map((service) => (
                                                            <option
                                                                key={service}
                                                                value={service}
                                                            >
                                                                {service}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        className={clsx(
                                                            "input input-bordered w-1/2",
                                                            {
                                                                "input-error":
                                                                    errors.rp_nipol,
                                                            },
                                                        )}
                                                        type="number"
                                                        placeholder={
                                                            watch("rp_service") ===
                                                            "Gendarmerie Nationale"
                                                                ? "NIGEND"
                                                                : "NIPOL"
                                                        }
                                                        {...register("rp_nipol", {
                                                            required: true,
                                                        })}
                                                    />
                                                </div>
                                                <select
                                                    className={clsx(
                                                        "select select-bordered w-full",
                                                        {
                                                            "input-error":
                                                                errors.rp_grade,
                                                        },
                                                    )}
                                                    {...register("rp_grade", {
                                                        required: true,
                                                        validate: (value) =>
                                                            frontToGrades(value) !==
                                                            "Aucun",
                                                    })}
                                                >
                                                    <option value="">Grade</option>
                                                    {watch("rp_service") ===
                                                    "Gendarmerie Nationale"
                                                        ? gradeGendarmerie.map(
                                                              (grade) => (
                                                                  <option
                                                                      key={grade}
                                                                      value={grade}
                                                                  >
                                                                      {grade}
                                                                  </option>
                                                              ),
                                                          )
                                                        : watch("rp_service") ===
                                                          "Police Nationale"
                                                        ? gradePoliceNationale.map(
                                                              (grade) => (
                                                                  <option
                                                                      key={grade}
                                                                      value={grade}
                                                                  >
                                                                      {grade}
                                                                  </option>
                                                              ),
                                                          )
                                                        : watch("rp_service") ===
                                                          "Police Nationale"
                                                        ? gradePoliceNationale.map(
                                                              (grade) => (
                                                                  <option
                                                                      key={grade}
                                                                      value={grade}
                                                                  >
                                                                      {grade}
                                                                  </option>
                                                              ),
                                                          )
                                                        : watch("rp_service") ===
                                                          "Police Municipale"
                                                        ? gradePoliceMunicipale.map(
                                                              (grade) => (
                                                                  <option
                                                                      key={grade}
                                                                      value={grade}
                                                                  >
                                                                      {grade}
                                                                  </option>
                                                              ),
                                                          )
                                                        : null}
                                                </select>
                                                <select
                                                    className={clsx(
                                                        "select select-bordered w-full",
                                                        {
                                                            "input-error":
                                                                errors.rp_qualification,
                                                        },
                                                    )}
                                                    {...register("rp_qualification", {
                                                        required: true,
                                                        validate: (value) =>
                                                            frontToQualification(
                                                                value,
                                                            ) !== "Aucun",
                                                    })}
                                                >
                                                    <option value="">
                                                        Qualification
                                                    </option>
                                                    <option value="opj">
                                                        Officier de Police Judiciaire
                                                    </option>
                                                    <option value="apj">
                                                        Agent de Police Judiciaire
                                                    </option>
                                                    <option value="apja">
                                                        Agent de Police Judiciaire Adjoint
                                                    </option>
                                                    <option value="afp">
                                                        Agent de la Force Publique
                                                    </option>
                                                </select>
                                                <select
                                                    className={clsx(
                                                        "select select-bordered w-full",
                                                        {
                                                            "input-error":
                                                                errors.rp_affectation,
                                                        },
                                                    )}
                                                    {...register("rp_affectation", {
                                                        required: true,
                                                        validate: (value) =>
                                                            frontToAffectation(value) !==
                                                            "Aucun",
                                                    })}
                                                >
                                                    <option value="">Affectation</option>
                                                    {affectationList.map(
                                                        (affectation) => (
                                                            <option
                                                                key={affectation}
                                                                value={affectation}
                                                            >
                                                                {affectation}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                <button
                                                    className={clsx("btn btn-primary", {
                                                        "btn-disabled": createUserLoading,
                                                    })}
                                                    type="submit"
                                                >
                                                    {createUserLoading ? (
                                                        <>
                                                            <span className="loading loading-dots"></span>
                                                            "Création..."
                                                        </>
                                                    ) : (
                                                        "Créer"
                                                    )}
                                                </button>
                                                {createUserError && (
                                                    <div className="text-error mt-2  text-center">
                                                        {createUserError}
                                                    </div>
                                                )}
                                            </div>
                                        </form>
                                    </div>

                                    <form method="dialog" className="modal-backdrop">
                                        <button>close</button>
                                    </form>
                                </dialog>
                            </div>
                            <dialog id="temp_password_modal" className="modal">
                                <form method="dialog" className="modal-box">
                                    <h3 className="font-bold text-lg text-center">
                                        Mot de passe temporaire
                                    </h3>
                                    <p className="italic text-center mb-2">
                                        Communiquez ce mot de passe à l'utilisateur. Il
                                        sera invité à le changer à sa prochaine connexion.
                                    </p>
                                    <div className="join w-full">
                                        <input
                                            readOnly
                                            value={currentTempPassword}
                                            className="input input-bordered join-item w-full"
                                        />
                                        <button
                                            type="button"
                                            className="btn join-item"
                                            onClick={async () => {
                                                try {
                                                    await navigator.clipboard.writeText(
                                                        currentTempPassword,
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
                        <div className="w-full flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2 w-full justify-center">
                                <input
                                    type="text"
                                    name="search"
                                    id="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input input-bordered w-full md:w-1/2 lg:w-1/3"
                                    placeholder="Rechercher (nom, allias, nigend...)"
                                    autoComplete="off"
                                />
                                {searchTerm && (
                                    <button
                                        className="btn btn-warning btn-sm"
                                        onClick={() => setSearchTerm("")}
                                        type="button"
                                    >
                                        Effacer
                                    </button>
                                )}
                            </div>
                        </div>
                        {loading ? (
                            <div>Loading users...</div>
                        ) : error ? (
                            <div className="text-error">{error}</div>
                        ) : (
                            <>
                                <div className="md:block hidden overflow-x-auto rounded-box border border-base-content/5 bg-base-100 w-fit">
                                    <table className="table">
                                        <thead>
                                            <tr className="text-center">
                                                <th>Id</th>
                                                <th>Nom</th>
                                                <th>Allias</th>
                                                <th>NIPOL/NIGEND</th>
                                                <th>Email</th>
                                                <th>Autorisation</th>
                                                <th>Profil</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                const filtered = filterUsers(
                                                    sortedUsersList,
                                                    searchTerm,
                                                );
                                                if (!filtered.length)
                                                    return (
                                                        <tr>
                                                            <td
                                                                colSpan={6}
                                                                className="text-center italic opacity-60"
                                                            >
                                                                Aucun utilisateur trouvé
                                                            </td>
                                                        </tr>
                                                    );
                                                return filtered.map((u) => (
                                                    <TableRow key={u.id} u={u} />
                                                ));
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="md:hidden block">
                                    {(() => {
                                        const filtered = filterUsers(
                                            sortedUsersList,
                                            searchTerm,
                                        );
                                        if (!filtered.length)
                                            return (
                                                <div className="text-center italic opacity-60 mt-2">
                                                    Aucun utilisateur trouvé
                                                </div>
                                            );
                                        return filtered.map((u) => userMobileCard(u));
                                    })()}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AdminAuthCheck>
    );
}

export default AdminHomePage;
