import React from "react";
import { NavLink } from "react-router-dom";
import { User, Car, Package } from "lucide-react";

import DefaultHeader from "../components/Header.jsx";
import AuthCheck from "../components/AuthCheck.jsx";
import Renamer from "../components/Renamer.jsx";

function AccueilRecherche() {
    const cards = [
        {
            key: "personnes",
            title: "Personnes",
            subtitle: "FNPC / FPR / TAJ / FIJAIT",
            desc: "Identité, permis, antécédents et alertes liées.",
            to: "/neofic/personnes",
            icon: <User size={22} strokeWidth={2} />,
        },
        {
            key: "vehicules",
            title: "Véhicules",
            subtitle: "SIV / FOVeS",
            desc: "Immatriculations, signalements et historiques.",
            to: "/neofic/vehicules",
            icon: <Car size={22} strokeWidth={2} />,
        },
        {
            key: "objets",
            title: "Objets",
            subtitle: "Objets signalés",
            desc: "Objets recherchés, saisis ou déclarés perdus.",
            to: "/neofic/objets",
            icon: <Package size={22} strokeWidth={2} />,
        },
    ];

    return (
        <AuthCheck>
            <Renamer pageTitle="NEOFIC" />
            <div>
                <DefaultHeader />

                <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
                    <header className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl font-semibold">NEOFIC</h1>
                        <p className="text-base-content/60 mt-2">
                            Choisissez un module de recherche
                        </p>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {cards.map(({ key, title, subtitle, desc, to, icon }) => (
                            <NavLink
                                key={key}
                                to={to}
                                className="group card bg-base-100 border border-base-content/10 hover:border-primary/40 shadow-sm hover:shadow-md transition rounded-2xl overflow-hidden"
                            >
                                <div className="card-body">
                                    <div className="flex items-center gap-3">
                                        <div className="shrink-0 rounded-xl bg-primary/10 text-primary p-2">
                                            {icon}
                                        </div>
                                        <div>
                                            <h2 className="card-title text-lg">
                                                {title}
                                            </h2>
                                            <p className="text-xs text-base-content/60">
                                                {subtitle}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-sm text-base-content/70">
                                        {desc}
                                    </p>
                                    <div className="mt-4">
                                        <span className="btn btn-primary btn-sm group-hover:translate-x-0.5 transition-transform">
                                            Accéder
                                        </span>
                                    </div>
                                </div>
                            </NavLink>
                        ))}
                    </div>
                </section>
            </div>
        </AuthCheck>
    );
}

export default AccueilRecherche;
