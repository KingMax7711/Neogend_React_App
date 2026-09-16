import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function BackToAdminButton() {
    return (
        <div className="">
            <Link to="/admin" className="btn btn-ghost btn-sm gap-2">
                <ArrowLeft size={18} />
                Retour à l'accueil
            </Link>
        </div>
    );
}

export default BackToAdminButton;
