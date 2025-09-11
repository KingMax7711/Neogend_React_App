// !!! DEPRECATED !!!
// ??? Replace by AdminHomePage.jsx
// TODO: Remove this file in future versions (uses for copy/paste code only)

/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import API from "../global/API";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import AdminAuthCheck from "../components/AdminAuthCheck";
import DefaultHeader from "../components/Header";
import Renamer from "../components/Renamer";
import formatName from "../tools/formatName";
import "../App.css";

function AdminUserPage() {
    const navigate = useNavigate();
    const { user, token } = useAuthStore();
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const firstLoadRef = useRef(true);
    const prevHashRef = useRef("");

    const adminToogleButtonHandler = (userId) => {
        let selectedUser = usersList.find((u) => u.id === userId);
        if (!selectedUser) return;

        axios
            .post(
                `${API}/admin/set_user_admin/${userId}`,
                { is_admin: !selectedUser.is_admin },
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            )
            .then(() => {
                selectedUser.is_admin = !selectedUser.is_admin;
                setUsersList([...usersList]);
            })
            .catch((err) => {
                console.error("Error toggling admin status:", err);
            });
    };

    const deleteUserHandler = (userId) => {
        axios
            .delete(`${API}/admin/delete_user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(() => {
                setUsersList(usersList.filter((u) => u.id !== userId));
            })
            .catch((err) => {
                console.error("Error deleting user:", err);
            });
    };

    useEffect(() => {
        // Ne lance rien tant que le token n'est pas prêt ou que l'utilisateur n'est pas admin
        if (!token || !user?.is_admin) return;

        let cancelled = false;

        const stableHash = (list) => {
            try {
                const norm = [...(list || [])]
                    .map((u) => ({
                        id: u?.id ?? u?.user_id ?? null,
                        email: u?.email ?? "",
                        first_name: u?.first_name ?? u?.firstName ?? "",
                        last_name: u?.last_name ?? u?.lastName ?? "",
                        is_admin: Boolean(u?.is_admin ?? u?.isAdmin ?? false),
                        created_at: u?.created_at ?? null,
                    }))
                    .sort(
                        (a, b) =>
                            (a.id ?? 0) - (b.id ?? 0) || a.email.localeCompare(b.email),
                    );
                return JSON.stringify(norm);
            } catch {
                return "";
            }
        };

        const fetchUsers = async () => {
            if (cancelled) return;
            try {
                if (firstLoadRef.current) setLoading(true);
                setError("");
                const response = await axios.get(`${API}/admin/users/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!cancelled) {
                    const next = response.data || [];
                    const nextHash = stableHash(next);
                    if (nextHash !== prevHashRef.current) {
                        setUsersList(next);
                        prevHashRef.current = nextHash;
                    }
                }
            } catch (err) {
                console.error("Error fetching users:", err);
                if (!cancelled)
                    setError(
                        err?.response?.data?.detail ||
                            "Impossible de charger les utilisateurs.",
                    );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    firstLoadRef.current = false;
                }
            }
        };

        const poll = () => {
            if (document.hidden) return; // ignore si onglet caché
            fetchUsers();
        };

        fetchUsers();
        const intervalId = setInterval(poll, 10000);
        const onVisibility = () => {
            if (!document.hidden) fetchUsers();
        };
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            cancelled = true;
            clearInterval(intervalId);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [token, user?.is_admin, usersList]);

    const TableRow = ({ u }) => (
        <tr key={u.id}>
            <td>{u.id}</td>
            <td>{formatName(u.first_name)}</td>
            <td>{formatName(u.last_name)}</td>
            <td>{u.email}</td>
            <td>
                {u.is_admin ? (
                    <div className="badge badge-success w-15">Yes</div>
                ) : (
                    <div className="badge badge-error w-15">No</div>
                )}
            </td>
            <td>
                <button
                    className="btn btn-sm btn-warning btn-outline w-30"
                    onClick={() => adminToogleButtonHandler(u.id)}
                >
                    {u.is_admin ? "Remove Admin" : "Make Admin"}
                </button>
            </td>
            <td>
                <button
                    className="btn btn-sm btn-error btn-outline w-30"
                    onClick={() => deleteUserHandler(u.id)}
                >
                    Delete
                </button>
            </td>
        </tr>
    );

    return (
        <>
            <AdminAuthCheck>
                <div className="min-h-screen bg-base-300">
                    <DefaultHeader />
                    <Renamer pageTitle={"Admin - Neogend"} />
                    <div className="flex flex-col items-center p-4">
                        <h1>Welcome to the Admin Page</h1>
                        <h2>User Information:</h2>
                        {loading && (
                            <div className="flex items-center gap-2 py-4">
                                <span className="loading loading-spinner loading-sm" />
                                <span>Chargement…</span>
                            </div>
                        )}
                        {error && (
                            <div className="alert alert-error my-3">
                                <span>{error}</span>
                            </div>
                        )}
                        {usersList.length > 0 && (
                            <>
                                <div className="md:hidden grid grid-cols-1 gap-3 w-full">
                                    {usersList.map((u) => (
                                        <div
                                            key={u.id}
                                            className="card bg-base-100 border border-base-content/5"
                                        >
                                            <div className="card-body p-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="card-title text-base font-semibold break-words">
                                                        {formatName(u.first_name)}{" "}
                                                        {formatName(u.last_name)}
                                                    </h3>
                                                    {u.is_admin ? (
                                                        <div className="badge badge-success">
                                                            Admin
                                                        </div>
                                                    ) : (
                                                        <div className="badge badge-ghost">
                                                            User
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex justify-between">
                                                    <div className="text-sm text-base-content/70 break-words">
                                                        {u.email}
                                                    </div>
                                                    <div className="text-xs text-base-content/50">
                                                        ID: {u.id}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between">
                                                    <button
                                                        className="btn btn-sm btn-warning btn-outline w-30"
                                                        onClick={() =>
                                                            adminToogleButtonHandler(u.id)
                                                        }
                                                    >
                                                        {u.is_admin
                                                            ? "Remove Admin"
                                                            : "Make Admin"}
                                                    </button>

                                                    <button
                                                        className="btn btn-sm btn-error btn-outline w-30"
                                                        onClick={() =>
                                                            deleteUserHandler(u.id)
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="md:block hidden overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Id</th>
                                                <th>First Name</th>
                                                <th>Last Name</th>
                                                <th>Email</th>
                                                <th>Admin</th>
                                                <th>Change Privileges</th>
                                                <th>Delete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usersList.map((u) => (
                                                <TableRow key={u.id} u={u} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </AdminAuthCheck>
        </>
    );
}

export default AdminUserPage;
