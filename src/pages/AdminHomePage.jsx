import React from "react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import API from "../global/API";
import Renamer from "../components/Renamer";
import "../App.css";
import DefaultHeader from "../components/Header";
import AdminAuthCheck from "../components/AdminAuthCheck";
import { useAuthStore } from "../stores/authStore";
import { privilegesToFront } from "../tools/privilegesTranslate";
import { Eye, PencilLine } from "lucide-react";
import formatName from "../tools/formatName";
import clsx from "clsx";
import { frontToServer } from "../tools/serverTranslate";
import { frontToAffectation } from "../tools/affectationTranslate";
import { frontToGrades } from "../tools/gradesTranslate";
import { frontToService } from "../tools/serviceTranslate";

const filesList = ["fnpc", "siv", "fpr", "taj", "foves", "fijait"];

function FileInspectGridCase({ fileName }) {
    return (
        <div className="bg-base-100 p-6 rounded-3xl shadow-lg border border-primary">
            <div className="flex flex-col items-center xl:justify-between">
                <span className="font-bold">{fileName.toUpperCase()}</span>
                <div className="flex gap-1">
                    <button className="btn btn-info btn-sm">Consulter</button>
                    <button className="btn btn-warning btn-sm">Editer</button>
                </div>
            </div>
        </div>
    );
}

function AdminHomePage() {
    const { user, token } = useAuthStore();
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [changeErrorMessage, setChangeErrorMessage] = useState("");
    const [createUserLoading, setCreateUserLoading] = useState(false);
    const [createUserError, setCreateUserError] = useState("");
    const firstLoadRef = useRef(true);
    const prevHashRef = useRef("");

    const handlePrivilegeChange = (userId, newPrivilege) => {
        let selectedUser = usersList.find((u) => u.id === userId);
        setChangeErrorMessage("");
        if (!selectedUser) return;

        axios
            .post(
                `${API}/admin/set_user_privileges/${userId}`,
                { privilege: newPrivilege },
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            )
            .then(() => {
                selectedUser.privileges = newPrivilege;
                setUsersList([...usersList]);
            })
            .catch((err) => {
                console.error("Error changing user privileges:", err);
                setChangeErrorMessage(err.response?.data.detail || "Unknown error");
            });
    };

    const deleteUserHandler = (userId) => {
        axios
            .delete(`${API}/admin/delete_user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                setUsersList(usersList.filter((u) => u.id !== userId));
            })
            .catch((err) => {
                console.error("Error deleting user:", err);
            });
    };

    const handleCreateUser = (data) => {
        setCreateUserError("");
        setCreateUserLoading(true);
        const payload = {
            first_name: (data.first_name || "").trim().toLowerCase(),
            last_name: (data.last_name || "").trim().toLowerCase(),
            email: (data.email || "").trim().toLowerCase(),
            discord_id: data.discord_id, // déjà un nombre grâce à valueAsNumber
            rp_first_name: (data.rp_first_name || "").trim().toLowerCase(),
            rp_last_name: (data.rp_last_name || "").trim().toLowerCase(),
            rp_birthdate: data.rp_birthdate,
            rp_gender: data.rp_gender,
            rp_service: frontToService(data.rp_service),
            rp_nipol: data.rp_nipol, // nombre
            rp_grade: frontToGrades(data.rp_grade),
            rp_affectation: frontToAffectation(data.rp_affectation),
            rp_server: frontToServer(data.rp_server),
        };

        console.log("Payload:", payload);

        axios
            .post(`${API}/admin/register/`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                console.log("User created successfully:", response.data);
                document.querySelector("#create_user_modal form").reset();
                document.getElementById("create_user_modal").close();

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
                        privileges: u?.privileges ?? "player",
                        is_admin: Boolean(u?.is_admin ?? u?.isAdmin ?? false),
                        created_at: u?.created_at ?? null,
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
                if (!cancelled)
                    setError(
                        err?.response?.data?.detail ||
                            "Impossible de charger les utilisateurs.",
                    );
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
        const intervalId = setInterval(poll, 10000);
        const onVisibility = () => {
            if (!document.hidden) fetchUsers();
        };
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            cancelled = true;
            clearInterval(intervalId);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [token, user, usersList]);

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
                    u.last_name.slice(0, 1).toUpperCase() +
                    "."}
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
                <select
                    name="privileges"
                    id=""
                    className="select select-bordered"
                    value={u.privileges}
                    onChange={(e) => handlePrivilegeChange(u.id, e.target.value)}
                >
                    <option value="owner">Propriétaire</option>
                    <option value="admin">Admin</option>
                    <option value="mod">Modérateur</option>
                    <option value="player">Joueur</option>
                </select>
            </td>
            <td>
                <Link
                    className="btn btn-primary btn-outline w-30"
                    to={`/admin/user/${u.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Consulter
                </Link>
            </td>
            <td>
                <button
                    className="btn btn-error btn-outline w-30"
                    onClick={() => deleteUserHandler(u.id)}
                >
                    Supprimer
                </button>
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
                    {formatName(u.first_name)} {u.last_name.slice(0, 1).toUpperCase()}.
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
            <div className="flex flex-col gap-2 mt-2">
                <label className="font-bold">Changer l'autorisation :</label>
                <select
                    name="privileges"
                    className="select select-bordered w-full"
                    value={u.privileges}
                    onChange={(e) => handlePrivilegeChange(u.id, e.target.value)}
                >
                    <option value="owner">Propriétaire</option>
                    <option value="admin">Admin</option>
                    <option value="mod">Modérateur</option>
                    <option value="player">Joueur</option>
                </select>
            </div>
            <div className="flex gap-2 mt-2">
                <Link
                    className="btn btn-primary btn-outline flex-1"
                    to={`/admin/user/${u.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Consulter
                </Link>
                <button
                    className="btn btn-error btn-outline flex-1"
                    onClick={() => deleteUserHandler(u.id)}
                >
                    Supprimer
                </button>
            </div>
        </div>
    );

    // Sort usersList by ID before rendering
    const sortedUsersList = [...usersList].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

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
        formState: { errors },
    } = useForm();

    return (
        <AdminAuthCheck>
            <Renamer pageTitle={"Admin - Neogend"} />
            <div className="min-h-screen bg-base-300">
                <DefaultHeader />
                <div className="bg-base-200 p-6 rounded-3xl shadow-lg m-6 flex flex-col md:flex-row gap-8 h-fit w-fit mx-auto">
                    <div className="flex flex-col gap-4 justify-between items-center md:items-start">
                        {/* User Info */}
                        <div className="flex flex-col bg-base-300 p-6 rounded-3xl shadow-lg gap-1 w-fit">
                            <h2 className="mb-2 text-center font-bold text-lg">
                                Authentification
                            </h2>
                            {/* User Details */}
                            <div className="flex">
                                <span className="font-bold">
                                    {privilegesToFront(user?.privileges)} :
                                </span>
                                <span className="ml-2">
                                    {formatName(user?.first_name)}
                                </span>
                            </div>
                            <div className="flex">
                                <span className="font-bold">ID Utilisateur :</span>
                                <span className="ml-2">{user?.id}</span>
                            </div>
                        </div>
                        {/* Data Management */}
                        <div className="bg-base-300 p-6 rounded-3xl shadow-lg">
                            <h2 className="text-2xl font-bold mb-4 text-center">
                                Gestion des Fichiers
                            </h2>
                            <p className="mb-4 text-center italic">
                                Permet la consultation et la modification des fichiers
                            </p>
                            {/* Files Grid */}
                            <div className="grid grid-cols-1 xxl:grid-cols-2 gap-2">
                                {filesList.map((fileName) => (
                                    <FileInspectGridCase
                                        key={fileName}
                                        fileName={fileName}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="bg-base-300 p-6 rounded-3xl shadow-lg flex flex-col gap-2 items-center w-fit">
                        <h2 className="text-2xl font-bold mb-4 text-center w-fit">
                            Gestion des Utilisateurs
                        </h2>
                        {loading ? (
                            <div>Loading users...</div>
                        ) : error ? (
                            <div>Error loading users</div>
                        ) : (
                            <div>
                                <div className="md:block hidden overflow-x-auto rounded-box border border-base-content/5 bg-base-100 w-fit">
                                    <table className="table">
                                        <thead>
                                            <tr className="text-center">
                                                <th>Id</th>
                                                <th>Nom</th>
                                                <th>Email</th>
                                                <th>Autorisation</th>
                                                <th>Changer les Autorisations</th>
                                                <th>Profil</th>
                                                <th>Supprimer</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedUsersList.map((u) => (
                                                <TableRow key={u.id} u={u} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="md:hidden block">
                                    {sortedUsersList.map((u) => userMobileCard(u))}
                                </div>
                                <div className="mt-4 flex justify-center">
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
                                            <form
                                                onSubmit={handleSubmit(handleCreateUser)}
                                            >
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex gap-2">
                                                        <input
                                                            className={clsx(
                                                                "input input-bordered w-full",
                                                                {
                                                                    "input-error":
                                                                        errors.first_name,
                                                                },
                                                            )}
                                                            type="text"
                                                            placeholder="Prénom"
                                                            {...register("first_name", {
                                                                required: true,
                                                            })}
                                                        />
                                                        <input
                                                            className={clsx(
                                                                "input input-bordered w-full",
                                                                {
                                                                    "input-error":
                                                                        errors.last_name,
                                                                },
                                                            )}
                                                            type="text"
                                                            placeholder="Nom"
                                                            {...register("last_name", {
                                                                required: true,
                                                            })}
                                                        />
                                                    </div>
                                                    <input
                                                        className={clsx(
                                                            "input input-bordered w-full",
                                                            {
                                                                "input-error":
                                                                    errors.email,
                                                            },
                                                        )}
                                                        type="email"
                                                        placeholder="Email"
                                                        {...register("email", {
                                                            required: true,
                                                            pattern:
                                                                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                        })}
                                                    />
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
                                                    <p className="italic">
                                                        Information RP :
                                                    </p>
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
                                                            {...register(
                                                                "rp_first_name",
                                                                {
                                                                    required: true,
                                                                },
                                                            )}
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
                                                        <input
                                                            className={clsx(
                                                                "input input-bordered w-1/2",
                                                                {
                                                                    "input-error":
                                                                        errors.rp_birthdate,
                                                                },
                                                            )}
                                                            type="date"
                                                            {...register("rp_birthdate", {
                                                                required: true,
                                                            })}
                                                        />
                                                        <select
                                                            className={clsx(
                                                                "select select-bordered w-1/2",
                                                                {
                                                                    "input-error":
                                                                        errors.rp_gender,
                                                                },
                                                            )}
                                                            {...register("rp_gender", {
                                                                required: true,
                                                                validate: (value) =>
                                                                    value !== "" ||
                                                                    "Veuillez sélectionner un sexe",
                                                            })}
                                                        >
                                                            {" "}
                                                            <option value="">Sexe</option>
                                                            <option value="male">
                                                                Homme
                                                            </option>
                                                            <option value="female">
                                                                Femme
                                                            </option>
                                                        </select>
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
                                                                    frontToService(
                                                                        value,
                                                                    ) !== "Aucun",
                                                            })}
                                                        >
                                                            <option value="">
                                                                Service
                                                            </option>
                                                            {serviceList.map(
                                                                (service) => (
                                                                    <option
                                                                        key={service}
                                                                        value={service}
                                                                    >
                                                                        {service}
                                                                    </option>
                                                                ),
                                                            )}
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
                                                                    errors.rp_affectation,
                                                            },
                                                        )}
                                                        {...register("rp_affectation", {
                                                            required: true,
                                                            validate: (value) =>
                                                                frontToAffectation(
                                                                    value,
                                                                ) !== "Aucun",
                                                        })}
                                                    >
                                                        <option value="">
                                                            Affectation
                                                        </option>
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
                                                        className={clsx(
                                                            "btn btn-primary",
                                                            {
                                                                "btn-disabled":
                                                                    createUserLoading,
                                                            },
                                                        )}
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
                            </div>
                        )}
                        {changeErrorMessage && (
                            <div className="badge badge-error badge-sm md:badge-lg mt-2">
                                {changeErrorMessage}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminAuthCheck>
    );
}

export default AdminHomePage;
