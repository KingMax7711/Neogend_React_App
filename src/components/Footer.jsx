import React from "react";

function Footer({ className = "" }) {
    const currentVersion = import.meta?.env?.VITE_REACT_APP_VERSION
        ? String(import.meta.env.VITE_REACT_APP_VERSION).trim()
        : "1.0.0";

    return (
        <footer className={`mt-auto ${className}`}>
            <div className="flex flex-col-reverse md:flex-row md:justify-between justify-center items-center text-sm italic">
                <div className="flex w-fit">
                    <p>
                        &copy; {new Date().getFullYear()} Neogend. Tout droits réservés.
                    </p>
                    <p className="ml-2">|</p>
                    <p className="ml-2">Version {currentVersion}</p>
                </div>
                <div className="w-fit">
                    <p>Ce site n'est en aucun cas affilié à l'État français.</p>
                </div>
                <div className="hidden md:flex">
                    <p>Propriétaire : Enzo L.</p>
                    <p className="mx-2">|</p>
                    <p>Développeur : Maxime C.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
