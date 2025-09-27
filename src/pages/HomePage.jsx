/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import AuthCheck from "../components/AuthCheck";
import DefaultHeader from "../components/Header";
import Renamer from "../components/Renamer";
import "../App.css";

function HomePage() {
    const user = useAuthStore((s) => s.user);

    return (
        <AuthCheck>
            <Renamer pageTitle="Home Page" />
            <div>
                <DefaultHeader />
                <h1>Welcome to the Home Page</h1>
                <div>
                    <h2>User Information:</h2>
                    <pre>{JSON.stringify(user, null, 2)}</pre>
                </div>
            </div>
        </AuthCheck>
    );
}

export default HomePage;
