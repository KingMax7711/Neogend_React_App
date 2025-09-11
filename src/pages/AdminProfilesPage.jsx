import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

// LOCAL
import { useAuthStore } from "../stores/authStore";
import Renamer from "../components/Renamer";
import AdminAuthCheck from "../components/AdminAuthCheck";
import DefaultHeader from "../components/Header";
import LoadingComponent from "../components/LoadingComponent";
import formatName from "../tools/formatName";
import { privilegesToFront } from "../tools/privilegesTranslate";
import { gradesToFront } from "../tools/gradesTranslate";
import { qualificationToFront } from "../tools/qualificationTranslate";
import { affectationToFront } from "../tools/affectationTranslate";
import { serverToFront } from "../tools/serverTranslate";
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
    const navigate = useNavigate();
    console.log("User ID from params:", id);

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
                <div className="min-h-screen bg-base-300">
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
                            <p className="text-warning text-center italic">
                                Consultation Seulement
                            </p>
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
                                            <span className="font-bold">Grade: </span>
                                            <span>
                                                {gradesToFront(checkUser.rp_grade)}
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
                            <p className="text-warning text-center italic">
                                Consultation Seulement
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </AdminAuthCheck>
    );
}

export default AdminProfilePage;
