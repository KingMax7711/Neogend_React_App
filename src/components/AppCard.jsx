import React from "react";
import { NavLink } from "react-router-dom";

function AppCard({
    title,
    desc,
    to = "#",
    icon = null,
    enabled = true,
    ctaLabel = "Ouvrir",
}) {
    const cardBase =
        "group card bg-base-100 border rounded-2xl transition overflow-hidden";
    const enabledCls =
        "border-base-content/10 hover:border-primary/40 shadow-sm hover:shadow-md";
    const disabledCls = "border-base-content/10 opacity-60 cursor-not-allowed";

    return (
        <div className={[cardBase, enabled ? enabledCls : disabledCls].join(" ")}>
            <div className="card-body">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {icon ? (
                            <span className="rounded-xl bg-primary/10 text-primary p-2">
                                {icon}
                            </span>
                        ) : null}
                        <div>
                            <h3 className="card-title text-base leading-tight">
                                {title}
                            </h3>
                            {desc ? (
                                <p className="text-xs text-base-content/60 mt-0.5">
                                    {desc}
                                </p>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                    {!enabled ? (
                        <span className="badge badge-ghost">Indisponible</span>
                    ) : (
                        <span className="badge badge-primary">Disponible</span>
                    )}
                    {enabled ? (
                        <NavLink
                            to={to}
                            className="btn btn-primary btn-sm group-hover:translate-x-0.5 transition-transform"
                        >
                            {ctaLabel}
                        </NavLink>
                    ) : (
                        <button className="btn btn-ghost btn-sm" disabled aria-disabled>
                            {ctaLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AppCard;
