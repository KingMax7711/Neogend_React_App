import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import "./App.css";

// Pages publiques
import LoginPage from "./pages/basic/LoginPage.jsx";
import SignUpPage from "./pages/basic/SignUpPage.jsx";
import HomePage from "./pages/basic/HomePage.jsx";
import PersonneRecherche from "./pages/neofic/PersonneRecherche.jsx";
import AccueilRecherche from "./pages/neofic/AccueilRecherche.jsx";
import VehiculeRecherche from "./pages/neofic/VehiculeRecherche.jsx";
import ConditionsGenerales from "./pages/utils/ConditionsGenerales.jsx";

// Pages admin
import AdminProfilePage from "./pages/admin/AdminProfilesPage.jsx";
import AdminHomePage from "./pages/admin/AdminHomePage.jsx";
import ProfilePage from "./pages/basic/ProfilesPages.jsx";
import AdminPropioPage from "./pages/admin/AdminPropioPage.jsx";
import AdminFnpcPage from "./pages/admin/AdminFnpcPage.jsx";
import AdminInfracPage from "./pages/admin/AdminInfracPage.jsx";
import AdminFprPage from "./pages/admin/AdminFprPage.jsx";
import AdminSivPage from "./pages/admin/AdminSivPage.jsx";

// Utilitaires
import UnfindPage from "./pages/utils/UnfindPage.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <div className="min-h-screen bg-base-300 flex flex-col">
                <ScrollToTop behavior="auto" />
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
                path: "conditions",
                element: <ConditionsGenerales />,
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
                path: "neofic/personnes/:id",
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
