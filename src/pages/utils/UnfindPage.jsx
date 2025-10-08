import React from "react";
import { Link } from "react-router-dom";

function UnfindPage() {
    return (
        <div className="flex-1 flex items-center justify-center gap-4">
            <div className="bg-base-100 p-3 md:p6 rounded-3xl shadow-lg border border-primary flex flex-col items-center gap-2">
                <p className="text-6xl font-bold mb-2">404</p>
                <p className="text-sm text-center">
                    Désolé, la page que vous recherchez n'existe pas.
                </p>

                <Link to="/home" className="btn btn-primary">
                    Retourner à la page d'accueil
                </Link>
                <p className="italic text-sm text-center mt-4">
                    Si vous pensez qu'il s'agit d'une erreur, <br /> veuillez contacter le
                    support.
                </p>
            </div>
        </div>
    );
}

export default UnfindPage;
