import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import "./App.css";

// Pages publiques
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import PersonneRecherche from "./pages/PersonneRecherche.jsx";
import AccueilRecherche from "./pages/AccueilRecherche.jsx";
import VehiculeRecherche from "./pages/VehiculeRecherche.jsx";

// Pages admin
import AdminUserPage from "./pages/AdminOnlyPage.jsx";
import AdminProfilePage from "./pages/AdminProfilesPage.jsx";
import AdminHomePage from "./pages/AdminHomePage.jsx";
import ProfilePage from "./pages/ProfilesPages.jsx";
import AdminPropioPage from "./pages/AdminPropioPage.jsx";
import AdminFnpcPage from "./pages/AdminFnpcPage.jsx";
import AdminInfracPage from "./pages/AdminInfracPage.jsx";
import AdminFprPage from "./pages/AdminFprPage.jsx";
import AdminSivPage from "./pages/AdminSivPage.jsx";

// Utilitaires
import UnfindPage from "./pages/UnfindPage.jsx";
import Footer from "./components/Footer.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <div className="min-h-screen bg-base-300 flex flex-col">
                <main className="flex-1 flex flex-col">
                    <Outlet />
                </main>
                <Footer />
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
                path: "admin/files/proprio",
                element: <AdminPropioPage />,
            },
            {
                path: "admin/files/fnpc",
                element: <AdminFnpcPage />,
            },
            {
                path: "admin/files/infrac",
                element: <AdminInfracPage />,
            },
            {
                path: "admin/files/fpr",
                element: <AdminFprPage />,
            },
            {
                path: "admin/files/siv",
                element: <AdminSivPage />,
            },
            {
                path: "profile",
                element: <ProfilePage />,
            },
            {
                path: "neofic/accueil",
                element: <AccueilRecherche />,
            },
            {
                path: "neofic/personnes",
                element: <PersonneRecherche />,
            },
            {
                path: "neofic/vehicules",
                element: <VehiculeRecherche />,
            },
            {
                path: "*",
                element: <UnfindPage />,
            },
        ],
    },
]);

function Routing() {
    return <RouterProvider router={router} />;
}

export default Routing;
