import { create } from "zustand";
import axios from "axios";
import API from "../global/API";

export const useAuthStore = create((set, get) => ({
    token: "",
    user: null,

    // Actions
    setToken: (token) => {
        console.log("[AUTH] setToken");
        set({ token });
        get().startSessionWatcher(); // lance la vérif globale si nécessaire
    },
    setUser: (user) => set({ user }),
    clearAuth: async () => {
        console.log("[AUTH] clearAuth");
        try {
            await axios.post(`${API}/auth/logout`, null, { withCredentials: true });
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            /* empty */
        }
        get().stopSessionWatcher();
        set({ token: "", user: null });
    },
    // Alias pour compat avec l’existant (clearToken)
    clearToken: () => {
        get().clearAuth();
    },

    // demande un nouveau access via le cookie refresh ---
    refreshAccess: async () => {
        try {
            const res = await axios.post(`${API}/auth/refresh`, null, {
                withCredentials: true, // indispensable pour envoyer le cookie
            });
            const { access_token } = res.data;
            get().setToken(access_token);
            return access_token;
        } catch (e) {
            console.warn("[auth] refresh failed", e?.response?.data || e.message);
            throw e;
        }
    },

    // API
    fetchMe: async () => {
        const token = get().token;
        if (!token) throw new Error("No token");
        console.log("[auth] fetchMe");
        try {
            const res = await axios.get(`${API}/users/me/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            set({ user: res.data });
            return res.data;
        } catch (err) {
            // Si 401 → tente un refresh puis rejoue
            console.log("[auth] fetchMe failed", err?.response?.data || err.message);
            console.log("[auth] trying to refresh token");
            if (err.response?.status === 401) {
                const newToken = await get().refreshAccess();
                const res2 = await axios.get(`${API}/users/me/`, {
                    headers: { Authorization: `Bearer ${newToken}` },
                });
                set({ user: res2.data });
                return res2.data;
            }
            throw err;
        }
    },

    // Surveillance de session (unique, gérée par le store)
    _intervalId: null,
    startSessionWatcher: () => {
        const { _intervalId } = get();
        if (_intervalId) return; // déjà en cours

        // Appel initial
        get()
            .fetchMe()
            .catch(() => get().clearAuth());

        const id = setInterval(() => {
            get()
                .fetchMe()
                .catch(() => get().clearAuth());
        }, 30000); // 30s
        set({ _intervalId: id });
    },
    stopSessionWatcher: () => {
        const id = get()._intervalId;
        if (id) {
            clearInterval(id);
            set({ _intervalId: null });
        }
    },
}));
