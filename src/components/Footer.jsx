import React from "react";

function Footer({ className = "" }) {
    const currentVersion =
        import.meta?.env?.VITE_REACT_APP_VERSION &&
        String(import.meta.env.VITE_REACT_APP_VERSION).trim();

    return (
        <footer className={`mt-auto ${className}`}>
            <div className="flex md:justify-between justify-center text-sm italic">
                <div className="flex">
                    <p>&copy; {new Date().getFullYear()} Neogend. All rights reserved.</p>
                    <p className="ml-2">|</p>
                    <p className="ml-2">Version {currentVersion}</p>
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
