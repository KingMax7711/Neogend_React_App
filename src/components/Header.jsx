import { NavLink, useNavigate } from "react-router-dom";
import { CircleUserRound, LogOut, Menu, UserRoundCog } from "lucide-react";
import formatName from "../tools/formatName";
import { useAuthStore } from "../stores/authStore";
import clsx from "clsx";

function DefaultHeader() {
    const { user, endSession } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await endSession();
        navigate("/login");
    };

    const PageMenuLink = ({ name, path, adminOnly }) => {
        const accesGranted = ["admin", "owner"];
        const isGranted = accesGranted.includes(user?.privileges);
        if (adminOnly && !isGranted) return null;

        return (
            <NavLink
                to={path}
                className={({ isActive }) =>
                    clsx("btn btn-ghost w-full text-left mb-1", {
                        "btn-warning btn-outline text-warning hover:text-warning-content":
                            adminOnly,
                        "font-bold text-primary": isActive,
                    })
                }
            >
                {name}
            </NavLink>
        );
    };

    return (
        <header className="w-full py-4 px-6 bg-base-300 grid grid-cols-[auto_1fr_auto] items-center gap-4 sticky top-0 left-0 z-50">
            <nav className="flex gap-4 bg-transparent border border-base-100 px-3 py-1.5 rounded-2xl">
                <div className="dropdown dropdown-start">
                    <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-ghost btn-circle w-fit h-fit"
                    >
                        <Menu size={28} style={{ color: "var(--color-base-content)" }} />
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-md dropdown-content bg-base-200 border border-base-200 rounded-box z-1 mt-3 w-52 p-2 shadow"
                    >
                        <PageMenuLink name="Accueil" path="/home" />
                        <PageMenuLink name="NEOFIC" path="/neofic/accueil" />
                        <PageMenuLink name="Admin" path="/admin" adminOnly />
                    </ul>
                </div>
            </nav>
            <h1 className="text-2xl font-bold justify-self-center text-center select-none">
                Neogend
            </h1>

            <div className="flex items-center gap-4 justify-self-end">
                <span className="hidden md:inline-block">
                    {user?.inscription_status === "valid" ? (
                        <span className="status status-success"></span>
                    ) : (
                        <span className="status status-warning"></span>
                    )}
                    {" " +
                        formatName(user?.first_name) +
                        " " +
                        (user?.last_name
                            ? user.last_name.slice(0, 1).toUpperCase()
                            : "") +
                        (user?.last_name ? "." : "")}
                </span>
                <div className="bg-transparent p-3 rounded-2xl border border-base-100 px-3 py-1.5">
                    <div className="dropdown dropdown-end">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-ghost btn-circle w-fit h-fit"
                        >
                            <UserRoundCog
                                size={28}
                                style={{ color: "var(--color-base-content)" }}
                            />
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-md dropdown-content bg-base-200 border border-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
                        >
                            <PageMenuLink name="Profil" path="/profile" />
                            <button
                                onClick={handleLogout}
                                className="btn btn-error btn-outline"
                            >
                                Déconnexion
                            </button>
                        </ul>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default DefaultHeader;
