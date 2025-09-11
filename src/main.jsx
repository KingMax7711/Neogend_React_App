import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Routing from "./Router.jsx";
import { initTheme } from "./handlers/themesHandler.js";

// Ensure theme is applied on boot (fallback if inline script was blocked)
initTheme();

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <Routing />
    </StrictMode>,
);
