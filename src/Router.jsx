import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import AdminUserPage from "./pages/AdminOnlyPage.jsx";
import AdminProfilePage from "./pages/AdminProfilesPage.jsx";
import AdminHomePage from "./pages/AdminHomePage.jsx";
import ProfilePage from "./pages/ProfilesPages.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <div>
                <Outlet />
            </div>
        ),
        errorElement: <div>Une erreur est survenue</div>,
        children: [
            {
                index: true,
                element: <Navigate to="/login" replace />,
            },
            {
                path: "login",
                element: <LoginPage />,
            },
            {
                path: "register",
                element: <SignUpPage />,
            },
            {
                path: "home",
                element: <HomePage />,
            },
            {
                path: "admin",
                element: <AdminHomePage />,
            },
            {
                path: "admin/user/:id",
                element: <AdminProfilePage />,
            },
            {
                path: "profile",
                element: <ProfilePage />,
            },
            {
                path: "*",
                element: <div>Page non trouvée</div>,
            },
        ],
    },
]);

function Routing() {
    return <RouterProvider router={router} />;
}

export default Routing;
