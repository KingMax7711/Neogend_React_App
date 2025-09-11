import React from "react";

// LOCAL
import { useAuthStore } from "../stores/authStore";
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
    const { user } = useAuthStore();

    const handlePasswordChange = () => {
        console.log("Change Password Clicked");
        console.log(user);
        // TODO: implement password change logic
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
                                            onClick={handlePasswordChange}
                                        >
                                            Changement de mot de passe
                                        </button>
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
