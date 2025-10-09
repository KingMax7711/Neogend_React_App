/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore.js";
import AuthCheck from "../../components/AuthCheck.jsx";
import DefaultHeader from "../../components/Header.jsx";
import Renamer from "../../components/Renamer.jsx";
import NotificationsCard from "../../components/NotificationsCard.jsx";
import {
    MailSearch,
    FileWarning,
    DoorClosedLocked,
    CarFront,
    ArchiveRestore,
    IdCard,
} from "lucide-react";
import axios from "axios";
import clsx from "clsx";
import API from "../../global/API.js";

import AppCard from "../../components/AppCard.jsx";
import formatName from "../../tools/formatName.js";
import { gradesToFront } from "../../tools/gradesTranslate.js";
import { serviceToFront } from "../../tools/serviceTranslate.js";

function HomePage() {
    const { user, token } = useAuthStore();
    const [notifList, setNotifList] = useState([]);
    const [notifLoading, setNotifLoading] = useState(false);
    const [notifError, setNotifError] = useState("");
    const prevNotifHashRef = useRef("");
    const firstNotifLoadRef = useRef(true);
    const [seeAllNotifs, setSeeAllNotifs] = useState(false);
    const profileRef = useRef(null);
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
            desc: "PV d'Immobilisation & de mise en Fourrière",
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

    // Liste des Notifications
    useEffect(() => {
        // Ne lance rien tant que le token n'est pas prêt
        if (!token) return;

        let cancelled = false;

        const stableHash = (list) => {
            try {
                const norm = [...(list || [])]
                    .map((notif) => ({
                        id: notif?.id ?? null,
                        user_id: notif?.user_id ?? null,
                        title: notif?.title ?? "",
                        message: notif?.message ?? "",
                        redirect_to: notif?.redirect_to ?? "",
                        created_at: notif?.created_at ?? "",
                        is_read: notif?.is_read ?? false,
                    }))
                    .sort((a, b) => {
                        // Dates au format yyyy-mm-dd -> tri lexicographique fonctionne.
                        // On veut la plus récente en premier => comparer b vs a.
                        const da = a.created_at || "";
                        const db = b.created_at || "";
                        if (da !== db) return db.localeCompare(da);
                        // En fallback, trier par id descendant (plus récent d'abord)
                        const ia = a.id ?? 0;
                        const ib = b.id ?? 0;
                        return ib - ia;
                    });
                return JSON.stringify(norm);
            } catch {
                return "";
            }
        };

        const fetchNotif = async () => {
            if (cancelled) return;
            try {
                if (firstNotifLoadRef.current) setNotifLoading(true);
                setNotifError("");
                let response;
                if (!seeAllNotifs) {
                    response = await axios.get(
                        `${API}/notifications_public/notifications/get_unread/`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        },
                    );
                } else {
                    response = await axios.get(
                        `${API}/notifications_public/notifications/get_all/`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        },
                    );
                }
                if (!cancelled) {
                    // Ordonner du plus récent au plus ancien (date desc, puis id desc)
                    const next = (response.data || []).slice().sort((a, b) => {
                        const da = a?.created_at || "";
                        const db = b?.created_at || "";
                        if (da !== db) return db.localeCompare(da);
                        const ia = a?.id ?? 0;
                        const ib = b?.id ?? 0;
                        return ib - ia;
                    });
                    const nextHash = stableHash(next);
                    if (nextHash !== prevNotifHashRef.current) {
                        setNotifList(next);
                        prevNotifHashRef.current = nextHash;
                    }
                }
            } catch (err) {
                console.error("Error fetching notifications:", err);
                if (!cancelled) {
                    setNotifError("Impossible de charger les notifications.");
                }
            } finally {
                if (!cancelled) {
                    setNotifLoading(false);
                    firstNotifLoadRef.current = false;
                }
            }
        };

        const poll = () => {
            if (document.hidden) return; // ignore si onglet caché
            fetchNotif();
        };

        fetchNotif();
        const intervalId = setInterval(poll, 30000);
        const onVisibility = () => {
            if (!document.hidden) fetchNotif();
        };
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            cancelled = true;
            clearInterval(intervalId);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [token, user, seeAllNotifs]);

    const handleMarkAllAsRead = async () => {
        await axios.put(
            `${API}/notifications_public/notifications/mark_all_as_read/`,
            null,
            {
                headers: { Authorization: `Bearer ${token}` },
            },
        );
        setNotifList((prev) =>
            seeAllNotifs ? prev.map((n) => ({ ...n, is_read: true })) : [],
        );
    };

    return (
        <AuthCheck>
            <Renamer pageTitle="Accueil" />
            <div>
                <DefaultHeader />
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-6 md:gap-10 p-4 xxl:mx-52">
                    {/* Résumé Profil */}
                    <div
                        ref={profileRef}
                        className="col-span-1 bg-base-200 p-6 rounded-3xl shadow-lg h"
                    >
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
                    {/* Futur Statistiques */}
                    <div className="hidden md:block col-span-1 bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-lg font-semibold mb-4 text-center">
                            Statistiques
                        </h2>
                        <div className="flex items-center justify-center h-full text-base-content/50">
                            (A venir)
                        </div>
                    </div>
                    {/* Notifications */}
                    <div className="md:col-span-2 bg-base-200 p-6 rounded-3xl shadow-lg h-fit md:h-auto">
                        {/* En tête PC */}
                        <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center mb-4">
                            <div
                                className="justify-self-start"
                                onClick={() => setSeeAllNotifs((v) => !v)}
                            >
                                <button className="btn btn-sm">
                                    {seeAllNotifs ? "Voir moins" : "Voir toutes"}
                                </button>
                            </div>
                            <h2 className="text-lg font-semibold text-center">
                                Notifications
                            </h2>
                            <div className="justify-self-end">
                                <button
                                    className="btn btn-sm"
                                    onClick={handleMarkAllAsRead}
                                >
                                    Marquer tout comme lu
                                </button>
                            </div>
                        </div>
                        {/* En tête Mobile */}
                        <div className="md:hidden flex flex-col items-center mb-4">
                            <h2 className="text-lg font-semibold text-center col-span-2">
                                Notifications
                            </h2>
                            <div className="flex gap-2 justify-between">
                                <div
                                    className="justify-self-start"
                                    onClick={() => setSeeAllNotifs((v) => !v)}
                                >
                                    <button className="btn btn-sm">
                                        {seeAllNotifs ? "Voir moins" : "Voir toutes"}
                                    </button>
                                </div>
                                <div className="justify-self-end">
                                    <button
                                        className="btn btn-sm"
                                        onClick={handleMarkAllAsRead}
                                    >
                                        Marquer tout comme lu
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Liste des notifications */}
                        <div
                            className={
                                "flex flex-col gap-3 max-h-[190px] overflow-y-auto pr-1 h-full" +
                                (notifList.length > 0
                                    ? ""
                                    : " items-center justify-center")
                            }
                        >
                            {notifList.length > 0 ? (
                                notifList.map((n) => (
                                    <NotificationsCard
                                        key={`${n.id}-${n.is_read ? "1" : "0"}`}
                                        notification={n}
                                        onMarked={(id) =>
                                            setNotifList((prev) =>
                                                seeAllNotifs
                                                    ? prev.map((x) =>
                                                          x.id === id
                                                              ? { ...x, is_read: true }
                                                              : x,
                                                      )
                                                    : prev.filter((x) => x.id !== id),
                                            )
                                        }
                                    />
                                ))
                            ) : (
                                <div className="text-center text-base-content/50">
                                    Aucune notification
                                </div>
                            )}
                        </div>
                    </div>
                    {/* My Applications */}
                    <div className="md:col-span-2 md:row-span-2 bg-base-200 p-6 rounded-3xl shadow-lg md:h-full">
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
                                    enabled={
                                        user?.inscription_status === "valid"
                                            ? a.enabled
                                            : false
                                    }
                                    ctaLabel="Ouvrir"
                                />
                            ))}
                        </div>
                    </div>
                    {/* Futur Notes IGGN */}
                    <div className="md:col-span-2 md:row-span-1 bg-base-200 p-6 rounded-3xl shadow-lg md:h-full">
                        <h2 className="text-lg font-semibold mb-4 text-center">
                            Notes IGGN
                        </h2>
                        <div className="flex items-center justify-center h-full text-base-content/50">
                            (A venir)
                        </div>
                    </div>
                    {/* Futur Notes DGGN */}
                    <div className="md:col-span-2 md:row-span-1 bg-base-200 p-6 rounded-3xl shadow-lg md:h-full">
                        <h2 className="text-lg font-semibold mb-4 text-center">
                            Notes DGGN
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
