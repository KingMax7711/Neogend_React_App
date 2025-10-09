import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../global/API";
import { useAuthStore } from "../stores/authStore";

function NotificationsCard({ notification, onMarked }) {
    const navigate = useNavigate();
    const token = useAuthStore((s) => s.token);
    const [localRead, setLocalRead] = useState(!!notification?.is_read);
    const [busy, setBusy] = useState(false);

    // Synchronise l'état local si le parent met à jour notification.is_read
    useEffect(() => {
        setLocalRead(!!notification?.is_read);
    }, [notification?.is_read]);

    if (!notification) return null;

    const handleClick = async () => {
        if (busy) return;
        const redirect = notification?.redirect_to || null;
        try {
            setBusy(true);
            if (!localRead) {
                // Marquer comme lu côté API
                await axios.put(
                    `${API}/notifications_public/notifications/mark_as_read/${notification.id}/`,
                    null,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );
                setLocalRead(true);
                onMarked?.(notification.id);
            }
        } catch (e) {
            // On ne bloque pas la navigation si l'appel échoue
            console.error("Failed to mark notification as read", e);
        } finally {
            setBusy(false);
            if (redirect) {
                if (redirect.startsWith("/") && !redirect.startsWith("//")) {
                    navigate(redirect);
                } else if (
                    redirect.startsWith("http://") ||
                    redirect.startsWith("https://")
                ) {
                    window.open(redirect, "_blank", "noopener,noreferrer");
                } else {
                    // Fallback: tenter comme route interne
                    navigate(redirect);
                }
            }
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={busy}
            className={`card text-left w-full p-4 shadow-sm transition-all duration-200 border mx-auto ${
                localRead
                    ? "bg-base-100 border-base-content/10 hover:shadow-md"
                    : "bg-primary/10 border-primary/30 hover:border-primary/50"
            } ${busy ? "opacity-70 cursor-wait" : "cursor-pointer"}`}
            role="article"
            aria-live={localRead ? "off" : "polite"}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <span
                        className={`inline-block h-3 w-3 rounded-full mt-1 ${
                            localRead ? "bg-gray-300" : "bg-primary animate-pulse"
                        }`}
                        aria-hidden
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                        <h3 className="text-sm font-semibold text-base-content truncate">
                            {notification?.title ?? "Nouvelle notification"}
                        </h3>
                        <time className="text-xs text-gray-400 ml-3 whitespace-nowrap">
                            {notification?.created_at
                                ? new Date(notification.created_at).toLocaleString()
                                : ""}
                        </time>
                    </div>

                    <p className="mt-1 text-xs text-gray-600 line-clamp-none md:line-clamp-4 hover:line-clamp-none whitespace-pre-line">
                        {notification?.message ?? ""}
                    </p>

                    {notification?.meta && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                            {Object.entries(notification.meta)
                                .slice(0, 3)
                                .map(([k, v]) => (
                                    <span
                                        key={k}
                                        className="badge badge-ghost badge-sm text-xs px-2 py-1"
                                    >
                                        {k}: {String(v)}
                                    </span>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
}

export default NotificationsCard;
