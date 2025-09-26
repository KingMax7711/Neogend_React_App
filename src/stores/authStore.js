import { create } from "zustand";
import axios from "axios";
import API from "../global/API";

const log = (level, msg, meta) => {
    const prefix = `[AUTH ${level.toUpperCase()}]`;
    if (meta) console[level](`(${new Date().toLocaleTimeString()})`, prefix, msg, meta);
    else console[level](`(${new Date().toLocaleTimeString()})`, prefix, msg);
};

export const useAuthStore = create((set, get) => ({
    token: "",
    user: null,
    status: "initializing", // initializing | recovering | authenticated | unauthenticated | forced-logout
    error: null,
    lastEvent: "",
    _inFlight: null,
    _heartbeatId: null,
    _heartbeatDelay: 30000,

    _setStatus: (status) => set({ status }),
    _setError: (code, message) => set({ error: code ? { code, message } : null }),
    _setEvent: (evt) => set({ lastEvent: evt }),

    setToken: (token) => set({ token }),
    setUser: (user) => set({ user }),
    isAuthenticated: () => get().status === "authenticated" && !!get().user,
    clearSession: () => set({ token: "", user: null }),

    endSession: async (reason = "LOGOUT") => {
        log("info", `Fin de session (${reason})`);
        try {
            await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
        } catch {
            // Ignore network/logout errors silently
        }
        get().stopHeartbeat();
        set({ token: "", user: null });
        if (["FORCED", "TOKEN_VERSION"].includes(reason))
            get()._setStatus("forced-logout");
        else get()._setStatus("unauthenticated");
    },

    refreshAccess: async () => {
        log("info", "Refresh access token");
        try {
            const r = await axios.post(
                `${API}/auth/refresh`,
                {},
                { withCredentials: true },
            );
            const access = r.data?.access_token;
            if (!access) throw new Error("Missing access token in refresh response");
            set({ token: access });
            log("info", "Refresh OK");
            return access;
        } catch (e) {
            const code = e?.response?.status;
            if (code === 403) {
                log("warn", "Refresh 403 -> forced logout");
                await get().endSession("FORCED");
            } else if (code === 401) {
                log("warn", "Refresh 401 -> no valid refresh token");
                await get().endSession("NO_REFRESH");
            } else log("error", "Refresh erreur réseau/serveur");
            throw e;
        }
    },

    _fetchMe: async (token) => {
        const r = await axios.get(`${API}/users/me/`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        });
        return r.data;
    },

    ensureSession: async () => {
        const state = get();
        if (state._inFlight) return state._inFlight;
        const promise = (async () => {
            const first = state.status === "initializing";
            log("info", first ? "Init session" : "Check session");
            set({ error: null });
            let token = get().token;
            try {
                if (!token) {
                    log("info", "Pas d'access token -> tentative de refresh");
                    token = await get().refreshAccess();
                }
                let me;
                try {
                    me = await get()._fetchMe(token);
                } catch (e) {
                    const code = e?.response?.status;
                    if (code === 401) {
                        log("warn", "/users/me 401 -> tentative refresh");
                        token = await get().refreshAccess();
                        me = await get()._fetchMe(token);
                    } else if (code === 403) {
                        log("warn", "/users/me 403 -> forced logout");
                        await get().endSession("FORCED");
                        throw e;
                    } else throw e;
                }
                set({ user: me });
                get()._setStatus("authenticated");
                get()._setEvent("session-ok");
                if (!get()._heartbeatId) get().startHeartbeat();
                else get()._adjustHeartbeat();
                return me;
            } catch (e) {
                if (["forced-logout", "unauthenticated"].includes(get().status))
                    get()._setEvent("session-ended");
                else {
                    const net = !e?.response;
                    if (net) {
                        log("warn", "Erreur réseau -> recovering");
                        get()._setStatus(first ? "initializing" : "recovering");
                        get()._setError("NETWORK", "API injoignable");
                        if (!first) {
                            if (!get()._heartbeatId) get().startHeartbeat();
                            else get()._adjustHeartbeat();
                        }
                    } else {
                        const code = e?.response?.status;
                        get()._setError(`HTTP_${code}`, "Echec session");
                        get()._setStatus("unauthenticated");
                    }
                }
                throw e;
            }
        })();
        set({ _inFlight: promise });
        try {
            return await promise;
        } finally {
            set({ _inFlight: null });
        }
    },

    _desiredHeartbeatDelay: () => (get().status === "recovering" ? 15000 : 30000),
    _adjustHeartbeat: () => {
        const { _heartbeatId, _heartbeatDelay } = get();
        if (!_heartbeatId) return;
        const desired = get()._desiredHeartbeatDelay();
        if (desired !== _heartbeatDelay) {
            clearInterval(_heartbeatId);
            const id = setInterval(() => {
                const st = get().status;
                if (st === "authenticated" || st === "recovering") {
                    get()
                        .ensureSession()
                        .catch(() => {});
                }
                get()._adjustHeartbeat();
            }, desired);
            set({ _heartbeatId: id, _heartbeatDelay: desired });
        }
    },
    startHeartbeat: () => {
        const { _heartbeatId } = get();
        if (_heartbeatId) return;
        const delay = get()._desiredHeartbeatDelay();
        const id = setInterval(() => {
            const st = get().status;
            if (st === "authenticated" || st === "recovering") {
                get()
                    .ensureSession()
                    .catch(() => {});
            }
            get()._adjustHeartbeat();
        }, delay);
        set({ _heartbeatId: id, _heartbeatDelay: delay });
    },
    stopHeartbeat: () => {
        const { _heartbeatId } = get();
        if (_heartbeatId) {
            clearInterval(_heartbeatId);
            set({ _heartbeatId: null });
        }
    },
    forceReconnect: () => {
        const { status, _inFlight } = get();
        if (_inFlight) return _inFlight;
        if (!["initializing", "authenticated"].includes(status))
            get()._setStatus("recovering");
        return get()
            .ensureSession()
            .catch(() => {});
    },
}));

export const initializeSessionFromToken = async (accessToken) => {
    const { setToken, ensureSession } = useAuthStore.getState();
    setToken(accessToken);
    try {
        await ensureSession();
    } catch {
        // Initial ensureSession may fail (network); status will reflect it
    }
};
