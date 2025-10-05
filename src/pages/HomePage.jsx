/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import AuthCheck from "../components/AuthCheck";
import DefaultHeader from "../components/Header";
import Renamer from "../components/Renamer";
import {
    MailSearch,
    FileWarning,
    DoorClosedLocked,
    CarFront,
    ArchiveRestore,
    IdCard,
} from "lucide-react";
import "../App.css";
import AppCard from "../components/AppCard.jsx";
import formatName from "../tools/formatName";
import { gradesToFront } from "../tools/gradesTranslate";
import { serviceToFront } from "../tools/serviceTranslate";

function HomePage() {
    const user = useAuthStore((s) => s.user);
    const apps = [
        {
            id: 1,
            title: "NEOFIC",
            desc: "Consultations des fichiers",
            icon: <MailSearch size={20} />,
            to: "/neofic/accueil",
            enabled: true,
        },
        {
            id: 2,
            title: "PVe",
            desc: "Procès Verbaux électroniques",
            icon: <FileWarning size={20} />,
            to: "/pve/accueil",
            enabled: false,
        },
        {
            id: 3,
            title: "GAV",
            desc: "PV de Garde à Vue & de retenue",
            icon: <DoorClosedLocked size={20} />,
            to: "/gav/accueil",
            enabled: false,
        },
        {
            id: 4,
            title: "IMMO",
            desc: "PV d'Immobilisation & de Fourrière",
            icon: <CarFront size={20} />,
            to: "/fourriere/accueil",
            enabled: false,
        },
        {
            id: 5,
            title: "SAISIE",
            desc: "PV de saisies",
            icon: <ArchiveRestore size={20} />,
            to: "/saisies/accueil",
            enabled: false,
        },
        {
            id: 6,
            title: "RET",
            desc: "PV de rétention du permis de conduire",
            icon: <IdCard size={20} />,
            to: "/retention/accueil",
            enabled: false,
        },
    ];

    return (
        <AuthCheck>
            <Renamer pageTitle="Accueil" />
            <div>
                <DefaultHeader />
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-6 md:gap-10 p-4 md:mx-52">
                    {/* Résumé Profil */}
                    <div className="col-span-1 bg-base-200 p-6 rounded-3xl shadow-lg h-fit">
                        <h2 className="text-lg font-semibold mb-4 text-center">
                            Profil RP
                        </h2>
                        {user ? (
                            <div className="flex flex-col items-center gap-4">
                                {/* Détails avec labels */}
                                <div className="w-full bg-base-300 rounded-2xl p-4 flex flex-col gap-3 shadow">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="opacity-60">Nom</span>
                                        <span className="font-semibold uppercase">
                                            {(user?.rp_last_name || "—").toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="opacity-60">Prénom</span>
                                        <span className="font-semibold">
                                            {formatName(user?.rp_first_name || "—")}
                                        </span>
                                    </div>
                                    <div className="divider my-1"></div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="opacity-60">Grade</span>
                                        <span className="badge badge-outline">
                                            {gradesToFront(user?.rp_grade) || "—"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="opacity-60">Service</span>
                                        <span className="badge badge-ghost">
                                            {serviceToFront(user?.rp_service) || "—"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-base-content/50">
                                Chargement…
                            </div>
                        )}
                    </div>
                    {/* Remplissage */}
                    <div className="col-span-1 bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-lg font-semibold mb-4 text-center">
                            Statistiques
                        </h2>
                        <div className="flex items-center justify-center h-full text-base-content/50">
                            (A venir)
                        </div>
                    </div>

                    {/* Futur Notifications */}
                    <div className="md:col-span-2 bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-lg font-semibold mb-4 text-center">
                            Notifications
                        </h2>
                        <div className="flex items-center justify-center h-full text-base-content/50">
                            (A venir)
                        </div>
                    </div>
                    {/* My Applications */}
                    <div className="md:col-span-2 md:row-span-2 bg-base-200 p-6 rounded-3xl shadow-lg h-fit">
                        <h2 className="text-lg font-semibold mb-4 text-center">
                            Mes Applications
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {apps.map((a) => (
                                <AppCard
                                    key={a.id}
                                    title={a.title}
                                    desc={a.desc}
                                    to={a.to}
                                    icon={a.icon}
                                    enabled={a.enabled}
                                    ctaLabel="Ouvrir"
                                />
                            ))}
                        </div>
                    </div>
                    {/* Futur Notes IGGN */}
                    <div className="md:col-span-2 md:row-span-2 bg-base-200 p-6 rounded-3xl shadow-lg h-fit">
                        <h2 className="text-lg font-semibold mb-4 text-center">
                            Notes IGGN
                        </h2>
                        <div className="flex items-center justify-center h-full text-base-content/50">
                            (A venir)
                        </div>
                    </div>
                </div>
            </div>
        </AuthCheck>
    );
}

export default HomePage;
