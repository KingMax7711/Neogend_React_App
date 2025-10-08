import React from "react";
import Renamer from "../../components/Renamer";
import { NavLink } from "react-router-dom";

function ConditionsGenerales() {
    return (
        <div>
            <Renamer pageTitle="Conditions Générales" />
            <div className="mx-auto text-center mt-6">
                <NavLink to="/home" className="btn btn-primary mb-4">
                    Retour à l'accueil
                </NavLink>
            </div>
            <div className="bg-base-200 p-5 rounded-3xl shadow-lg mt-4 md:max-w-2/4 mx-auto">
                <h1 className="text-3xl font-bold mb-4 text-center">
                    Conditions Générales d'Utilisation (CGU)
                </h1>
                <iframe
                    src="/docs/cgu.pdf"
                    title="NEOCFS - CGU"
                    className="w-full max-w-6xl h-[80vh] border rounded shadow mx-auto"
                ></iframe>
            </div>
            <div className="bg-base-200 p-5 rounded-3xl shadow-lg mt-4 md:max-w-2/4 mx-auto">
                <h1 className="text-3xl font-bold mb-4 text-center">
                    Réglement Général de Protection des Données (RGPD)
                </h1>
                <iframe
                    src="/docs/rgpd.pdf"
                    title="NEOCFS - RGPD"
                    className="w-full max-w-6xl h-[80vh] border rounded shadow mx-auto"
                ></iframe>
            </div>
        </div>
    );
}

export default ConditionsGenerales;
