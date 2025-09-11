import React, { useEffect, useState } from "react";

function LoadingComponent() {
    const [showEasterEgg, setShowEasterEgg] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowEasterEgg(true);
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col justify-center items-center">
                <div className="flex bg-base-200 p-6 rounded-3xl shadow-lg gap-4 w-fit">
                    <span className="loading loading-spinner"></span>
                    <span>Chargement...</span>
                </div>
                {showEasterEgg && (
                    <div className="mt-8 text-center">
                        Si vous êtes encore là, <br /> c'est que j'ai sûrement fait une
                        bêtise 😅 <br />
                        ou que votre connexion est lente... 😝
                    </div>
                )}
            </div>
        </div>
    );
}

export default LoadingComponent;
