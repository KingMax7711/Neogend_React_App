import React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useAuthStore } from "../../stores/authStore.js";
import { useForm } from "react-hook-form";
import RHFDateText from "../../components/RHFDateText.jsx";
import axios from "axios";
import clsx from "clsx";
import { X } from "lucide-react";

import API from "../../global/API.js";
import AdminAuthCheck from "../../components/AdminAuthCheck.jsx";
import Renamer from "../../components/Renamer.jsx";
import DefaultHeader from "../../components/Header.jsx";
import formatName from "../../tools/formatName.js";
import { dbDateToFront } from "../../tools/dateTranslate.js";

function AdminInfracPage() {
    const { user, token } = useAuthStore();
    const [fnpcList, setFnpcList] = useState([]);
    const [propList, setPropList] = useState([]);
    const [infracList, setInfracList] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const firstLoadRef = useRef(true);
    const prevHashRef = useRef("");
    const firstPropLoadRef = useRef(true);
    const prevPropHashRef = useRef("");
    const firstInfracLoadRef = useRef(true);
    const prevInfracHashRef = useRef("");

    // eslint-disable-next-line no-unused-vars
    const scrollYRef = useRef(0);

    const handleSelect = async (id) => {
        const y = window.scrollY;
        setSelectedId(id);
        // restaure la position après le render
        requestAnimationFrame(() =>
            window.scrollTo({ top: y, left: 0, behavior: "auto" }),
        );
    };

    useEffect(() => {
        // Ne lance rien tant que le token n'est pas prêt ou que l'utilisateur n'est pas admin
        const accesGranted = ["admin", "owner"];
        const isGranted = accesGranted.includes(user?.privileges);
        if (!token || !isGranted) return;

        let cancelled = false;

        const stableHash = (list) => {
            try {
                const norm = [...(list || [])]
                    .map((fnpc) => ({
                        id: fnpc?.id ?? fnpc?.user_id ?? null,
                        neph: fnpc?.neph ?? null,
                        numero_titre: fnpc?.numero_titre ?? null,
                        date_delivrance: fnpc?.date_delivrance ?? null,
                        date_expiration: fnpc?.date_expiration ?? null,
                        statut: fnpc?.statut ?? null,
                        validite: fnpc?.validite ?? null,

                        // Permis
                        cat_am: fnpc?.cat_am ?? null,
                        cat_am_delivrance: fnpc?.cat_am_delivrance ?? null,
                        cat_a1: fnpc?.cat_a1 ?? null,
                        cat_a1_delivrance: fnpc?.cat_a1_delivrance ?? null,
                        cat_a2: fnpc?.cat_a2 ?? null,
                        cat_a2_delivrance: fnpc?.cat_a2_delivrance ?? null,
                        cat_a: fnpc?.cat_a ?? null,
                        cat_a_delivrance: fnpc?.cat_a_delivrance ?? null,
                        cat_b1: fnpc?.cat_b1 ?? null,
                        cat_b1_delivrance: fnpc?.cat_b1_delivrance ?? null,
                        cat_b: fnpc?.cat_b ?? null,
                        cat_b_delivrance: fnpc?.cat_b_delivrance ?? null,
                        cat_c1: fnpc?.cat_c1 ?? null,
                        cat_c1_delivrance: fnpc?.cat_c1_delivrance ?? null,
                        cat_c: fnpc?.cat_c ?? null,
                        cat_c_delivrance: fnpc?.cat_c_delivrance ?? null,
                        cat_d1: fnpc?.cat_d1 ?? null,
                        cat_d1_delivrance: fnpc?.cat_d1_delivrance ?? null,
                        cat_d: fnpc?.cat_d ?? null,
                        cat_d_delivrance: fnpc?.cat_d_delivrance ?? null,
                        cat_be: fnpc?.cat_be ?? null,
                        cat_be_delivrance: fnpc?.cat_be_delivrance ?? null,
                        cat_c1e: fnpc?.cat_c1e ?? null,
                        cat_c1e_delivrance: fnpc?.cat_c1e_delivrance ?? null,
                        cat_ce: fnpc?.cat_ce ?? null,
                        cat_ce_delivrance: fnpc?.cat_ce_delivrance ?? null,
                        cat_d1e: fnpc?.cat_d1e ?? null,
                        cat_d1e_delivrance: fnpc?.cat_d1e_delivrance ?? null,
                        cat_de: fnpc?.cat_de ?? null,
                        cat_de_delivrance: fnpc?.cat_de_delivrance ?? null,

                        code_restriction: fnpc?.code_restriction ?? null,
                        probatoire: fnpc?.probatoire ?? null,
                        date_probatoire: fnpc?.date_probatoire ?? null,
                        points: fnpc?.points ?? null,
                        prop_id: fnpc?.prop_id ?? null,
                        prefecture_delivrance: fnpc?.prefecture_delivrance ?? null,
                    }))
                    .sort(
                        (a, b) => (a.id ?? 0) - (b.id ?? 0) || a.id.localeCompare(b.id),
                    );
                return JSON.stringify(norm);
            } catch {
                return "";
            }
        };

        const fetchFnpc = async () => {
            if (cancelled) return;
            try {
                if (firstLoadRef.current) setLoading(true);
                setError("");
                const response = await axios.get(`${API}/fnpc/read/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!cancelled) {
                    const next = response.data || [];
                    const nextHash = stableHash(next);
                    if (nextHash !== prevHashRef.current) {
                        setFnpcList(next);
                        prevHashRef.current = nextHash;
                    }
                }
            } catch (err) {
                console.error("Error fetching fnpc:", err);
                if (!cancelled) {
                    setError("Impossible de charger le fnpc.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    firstLoadRef.current = false;
                }
            }
        };

        const poll = () => {
            if (document.hidden) return; // ignore si onglet caché
            fetchFnpc();
        };

        fetchFnpc();
        const intervalId = setInterval(poll, 30000);
        const onVisibility = () => {
            if (!document.hidden) fetchFnpc();
        };
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            cancelled = true;
            clearInterval(intervalId);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [token, user]);

    useEffect(() => {
        // Ne lance rien tant que le token n'est pas prêt ou que l'utilisateur n'est pas admin
        const accesGranted = ["admin", "owner"];
        const isGranted = accesGranted.includes(user?.privileges);
        if (!token || !isGranted) return;

        let cancelled = false;

        const stableHash = (list) => {
            try {
                const norm = [...(list || [])]
                    .map((prop) => ({
                        id: prop?.id ?? prop?.user_id ?? null,
                        nom_famille: prop?.nom_famille ?? null,
                        nom_usage: prop?.nom_usage ?? null,
                        prenom: prop?.prenom ?? null,
                        second_prenom: prop?.second_prenom ?? null,
                        date_naissance: prop?.date_naissance ?? null,
                        sexe: prop?.sexe ?? null,
                        lieu_naissance: prop?.lieu_naissance ?? null,
                        departement_naissance_numero:
                            prop?.departement_naissance_numero ?? null,
                        adresse_numero: prop?.adresse_numero ?? null,
                        adresse_type_voie: prop?.adresse_type_voie ?? null,
                        adresse_nom_voie: prop?.adresse_nom_voie ?? null,
                        adresse_code_postal: prop?.adresse_code_postal ?? null,
                        adresse_commune: prop?.adresse_commune ?? null,
                    }))
                    .sort(
                        (a, b) => (a.id ?? 0) - (b.id ?? 0) || a.id.localeCompare(b.id),
                    );
                return JSON.stringify(norm);
            } catch {
                return "";
            }
        };

        const fetchProps = async () => {
            if (cancelled) return;
            try {
                if (firstPropLoadRef.current) setLoading(true);
                setError("");
                const response = await axios.get(`${API}/proprietaires/read/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!cancelled) {
                    const next = response.data || [];
                    const nextHash = stableHash(next);
                    if (nextHash !== prevPropHashRef.current) {
                        setPropList(next);
                        prevPropHashRef.current = nextHash;
                    }
                }
            } catch (err) {
                console.error("Error fetching proprietaires:", err);
                if (!cancelled) {
                    setError("Impossible de charger les propriétaires.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    firstPropLoadRef.current = false;
                }
            }
        };

        const poll = () => {
            if (document.hidden) return; // ignore si onglet caché
            fetchProps();
        };

        fetchProps();
        const intervalId = setInterval(poll, 30000);
        const onVisibility = () => {
            if (!document.hidden) fetchProps();
        };
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            cancelled = true;
            clearInterval(intervalId);
            document.removeEventListener("visibilitychange", onVisibility);
        };
        // NOTE: on NE met PAS usersList en dépendance pour éviter des fetchs en boucle.
    }, [token, user]);

    useEffect(() => {
        // Ne lance rien tant que le token n'est pas prêt ou que l'utilisateur n'est pas admin
        const accesGranted = ["admin", "owner"];
        const isGranted = accesGranted.includes(user?.privileges);
        if (!token || !isGranted) return;

        let cancelled = false;

        const stableHash = (list) => {
            try {
                const norm = [...(list || [])]
                    .map((infrac) => ({
                        id: infrac?.id ?? infrac?.user_id ?? null,
                        article: infrac?.article ?? null,
                        classe: infrac?.classe ?? null,
                        natinf: infrac?.natinf ?? null,
                        points: infrac?.points ?? null,
                        nipol: infrac?.nipol ?? null,
                        date_infraction: infrac?.date_infraction ?? null,
                        details: infrac?.details ?? null,
                        statut: infrac?.statut ?? null,
                    }))
                    .sort(
                        (a, b) => (a.id ?? 0) - (b.id ?? 0) || a.id.localeCompare(b.id),
                    );
                return JSON.stringify(norm);
            } catch {
                return "";
            }
        };

        const fetchInfrac = async () => {
            if (cancelled) return;
            try {
                if (firstInfracLoadRef.current) setLoading(true);
                setError("");
                const response = await axios.get(`${API}/infractions/read/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!cancelled) {
                    const next = response.data || [];
                    const nextHash = stableHash(next);
                    if (nextHash !== prevInfracHashRef.current) {
                        setInfracList(next);
                        prevInfracHashRef.current = nextHash;
                    }
                }
            } catch (err) {
                console.error("Error fetching infractions:", err);
                if (!cancelled) {
                    setError("Impossible de charger les infractions.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    firstInfracLoadRef.current = false;
                }
            }
        };

        const poll = () => {
            if (document.hidden) return; // ignore si onglet caché
            fetchInfrac();
        };

        fetchInfrac();
        const intervalId = setInterval(poll, 30000);
        const onVisibility = () => {
            if (!document.hidden) fetchInfrac();
        };
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            cancelled = true;
            clearInterval(intervalId);
            document.removeEventListener("visibilitychange", onVisibility);
        };
        // NOTE: on NE met PAS usersList en dépendance pour éviter des fetchs en boucle.
    }, [token, user]);

    // Si la liste change et que l'ID sélectionné n'existe plus, on nettoie
    useEffect(() => {
        if (selectedId != null && !infracList.some((p) => p.id === selectedId)) {
            setSelectedId(null);
        }
    }, [infracList, selectedId]);

    const selectedInfrac = useMemo(
        () => infracList.find((p) => p.id === selectedId) ?? null,
        [infracList, selectedId],
    );

    const findPropLinkToFnpc = (fnpc) => {
        const prop = propList.find((p) => p.id === fnpc.prop_id);
        return prop ? prop : null;
    };

    const findFnpcLinkToInfrac = (infrac) => {
        const fnpc = fnpcList.find((f) => f.neph === infrac.neph);
        return fnpc ? fnpc : null;
    };

    const TableRow = ({ infrac }) => {
        const linkedFnpc = findFnpcLinkToInfrac(infrac);
        const linkedProp = findPropLinkToFnpc(linkedFnpc);
        return (
            <tr key={infrac.id} className="text-center">
                <td>{infrac.id}</td>
                <td>{infrac.neph}</td>
                <td>
                    {linkedProp
                        ? linkedProp.prenom !== "" && linkedProp.nom_famille !== ""
                            ? `${formatName(
                                  linkedProp.prenom,
                              )} ${linkedProp.nom_famille[0].toUpperCase()}.`
                            : "Propriétaire inconnu"
                        : "Aucun propriétaire"}
                </td>
                <td>{dbDateToFront(infrac.date_infraction)}</td>
                <td>{infrac.article ? infrac.article : "N/A"}</td>
                <td>{infrac.classe + "ème Classe"}</td>
                <td>{infrac.natinf ? infrac.natinf : "N/A"}</td>
                <td>{"-" + infrac.points}</td>
                <td>
                    {infrac.statut == "paye"
                        ? "Payé"
                        : infrac.statut == "attente"
                        ? "En attente"
                        : infrac.statut == "impaye"
                        ? "Impayé"
                        : "Inconnu"}
                </td>
                <td>
                    {infrac.details != null ? (
                        infrac.details.length > 35 ? (
                            <span>{infrac.details.slice(0, 35)}...</span>
                        ) : (
                            infrac.details
                        )
                    ) : (
                        "Aucun détail"
                    )}
                </td>
                <td>{infrac.nipol}</td>

                <td>
                    <input
                        type="radio"
                        className="radio radio-primary"
                        name="edit"
                        value={infrac.id}
                        checked={selectedId === infrac.id}
                        onMouseDown={(e) => e.preventDefault()} // évite le focus qui scroll
                        onChange={() => handleSelect(infrac.id)}
                    />
                </td>
                <td>
                    <button
                        className="btn btn-error btn-sm"
                        onClick={() => deleteHandle(infrac.id)}
                    >
                        Supprimer
                    </button>
                </td>
            </tr>
        );
    };

    const MobileInfracCard = ({ infrac }) => {
        const linkedFnpc = findFnpcLinkToInfrac(infrac);
        const linkedProp = findPropLinkToFnpc(linkedFnpc || {});
        const ownerLabel = linkedProp
            ? linkedProp.prenom !== "" && linkedProp.nom_famille !== ""
                ? `${formatName(linkedProp.prenom)} ${
                      linkedProp.nom_famille?.[0]?.toUpperCase() || ""
                  }.`
                : "Propriétaire inconnu"
            : "Aucun propriétaire";

        const detailsCompact =
            infrac.details != null
                ? infrac.details.length > 35
                    ? `${infrac.details.slice(0, 35)}...`
                    : infrac.details
                : "Aucun détail";

        return (
            <div
                key={infrac.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(infrac.id)}
                className={clsx(
                    "card card-compact bg-base-100 shadow-md rounded-box border border-base-content/5 cursor-pointer",
                    { "border-primary": selectedId === infrac.id },
                )}
            >
                <div className="card-body">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="card-title text-base-content">
                                NEPH: <span className="font-mono">{infrac.neph}</span>
                            </h3>
                            <p className="text-sm text-base-content/70">
                                ID: <span className="font-mono">{infrac.id}</span>
                            </p>
                        </div>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                className="radio radio-primary pointer-events-none"
                                name="edit-mobile"
                                value={infrac.id}
                                readOnly
                                checked={selectedId === infrac.id}
                            />
                        </label>
                    </div>

                    <div className="divider my-2" />

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="opacity-70">Propriétaire</div>
                        <div className="font-medium">{ownerLabel}</div>

                        <div className="opacity-70">Date infraction</div>
                        <div className="font-medium">{infrac.date_infraction}</div>

                        <div className="opacity-70">Article</div>
                        <div className="font-medium">
                            {infrac.article ? infrac.article : "N/A"}
                        </div>

                        <div className="opacity-70">Natinf</div>
                        <div className="font-medium">
                            {infrac.natinf ? infrac.natinf : "N/A"}
                        </div>

                        <div className="opacity-70">Classe</div>
                        <div className="font-medium">{infrac.classe + "ème Classe"}</div>

                        <div className="opacity-70">Points</div>
                        <div className="font-medium">
                            {"-" + infrac.points + " Points"}
                        </div>

                        <div className="opacity-70">Statut</div>
                        <div className="font-medium">
                            {infrac.statut == "paye"
                                ? "Payé"
                                : infrac.statut == "attente"
                                ? "En attente"
                                : infrac.statut == "impaye"
                                ? "Impayé"
                                : "Inconnu"}
                        </div>

                        <div className="opacity-70">Détails</div>
                        <div className="font-medium break-words">{detailsCompact}</div>

                        <div className="opacity-70">Nipol</div>
                        <div className="font-medium">{infrac.nipol}</div>
                    </div>
                </div>
            </div>
        );
    };

    const sortedInfracList = [...infracList].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

    const {
        register,
        handleSubmit,
        reset,
        // eslint-disable-next-line no-unused-vars
        watch,
        control,
        formState: { isSubmitting, errors },
    } = useForm({
        defaultValues: {
            id: "",
            neph: "",
            article: "",
            classe: "",
            natinf: "",
            points: "",
            nipol: "",
            date_infraction: "",
            details: "",
            statut: "",
        },
    });

    // Pré-remplir le formulaire quand la sélection change
    useEffect(() => {
        if (!selectedInfrac) {
            reset({
                id: "",
                neph: "",
                article: "",
                classe: "",
                natinf: "",
                points: "",
                nipol: "",
                date_infraction: "",
                details: "",
                statut: "",
            });
            return;
        }
        reset({
            id: selectedInfrac?.id ?? "",
            neph: selectedInfrac?.neph ?? "",
            article: selectedInfrac?.article ?? "",
            classe: selectedInfrac?.classe ?? "",
            natinf: selectedInfrac?.natinf ?? "",
            points: selectedInfrac?.points ?? "",
            nipol: selectedInfrac?.nipol ?? "",
            date_infraction: selectedInfrac?.date_infraction ?? "",
            details: selectedInfrac?.details ?? "",
            statut: selectedInfrac?.statut ?? "",
        });
    }, [selectedInfrac, reset]);

    // Construit un payload typé et met toutes les chaînes en minuscules
    const buildInfracPayload = (raw) => {
        const s = (v) => {
            if (v === undefined || v === null) return null;
            const t = String(v).trim();
            if (!t) return null;
            const low = t.toLowerCase();
            if (low === "null" || low === "undefined") return null;
            return low;
        };
        const n = (v) => {
            if (v === undefined || v === null || v === "") return null;
            const num = Number(v);
            return Number.isFinite(num) ? num : null;
        };
        const d = (v) => {
            if (v === undefined || v === null || v === "") return null;
            // On suppose déjà au format YYYY-MM-DD depuis l'input date
            return String(v);
        };

        const out = {
            neph: n(raw.neph),
            article: s(raw.article),
            classe: s(raw.classe),
            natinf: s(raw.natinf),
            points: n(raw.points),
            nipol: s(raw.nipol),
            date_infraction: d(raw.date_infraction),
            details: s(raw.details),
            statut: s(raw.statut),
        };
        return out;
    };

    const editSubmit = async (data) => {
        try {
            const baseId = selectedInfrac?.id ?? null;
            const payload = buildInfracPayload(data);
            console.log("Soumission infraction", { baseId, payload });
            setErrorMsg("");
            if (baseId != null) {
                const res = await axios.put(
                    `${API}/infractions/update/${baseId}/`,
                    payload,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );
                const updated = res?.data || payload;
                setInfracList((prev) => {
                    const idx = prev.findIndex((p) => p.id === baseId);
                    if (idx === -1) return prev;
                    const next = [...prev];
                    next[idx] = { ...prev[idx], ...updated, id: baseId };
                    return next;
                });
                setSelectedId(null);
            } else {
                const res = await axios.post(`${API}/infractions/create/`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const created = res?.data;
                if (created && created.id != null) {
                    setInfracList((prev) => {
                        const next = [...prev, created];
                        return next;
                    });
                    reset();
                }
            }
        } catch (e) {
            console.error("Échec de l'enregistrement", e);
            setErrorMsg(e?.response?.data?.detail || "Erreur lors de l'enregistrement");
        }
    };

    const deleteHandle = async (id) => {
        if (!id) return;
        try {
            await axios.delete(`${API}/infractions/delete/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setInfracList((prev) => prev.filter((p) => p.id !== id));
            if (selectedId === id) setSelectedId(null);
        } catch (e) {
            console.error("Suppression échouée", e);
        }
    };

    return (
        <AdminAuthCheck>
            <Renamer pageTitle="INFRAC - NEOGEND" />
            <div className="">
                <DefaultHeader />
                <div className="flex flex-col md:flex-row md:items-start items-center justify-center gap-8 p-6">
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-center">
                            INFRACTIONS
                        </h2>
                        {loading ? (
                            <div className="flex justify-center">
                                <span className="loading loading-spinner text-primary"></span>
                            </div>
                        ) : error ? (
                            <div className="badge badge-error">{error}</div>
                        ) : (
                            <div>
                                <div className="md:block hidden overflow-x-auto rounded-box border border-base-content/5 bg-base-100 w-fit">
                                    <table className="table">
                                        <thead>
                                            <tr className="text-center">
                                                <th className="">ID</th>
                                                <th className="">NEPH</th>
                                                <th className="">Propriétaires</th>
                                                <th className="">Date Infraction</th>
                                                <th className="">Article</th>
                                                <th className="">Classe</th>
                                                <th className="">Natinf</th>
                                                <th className="">Points</th>
                                                <th className="">Statut</th>
                                                <th className="">Détails</th>
                                                <th className="">N° Agent</th>
                                                <th className="">Sélectionner</th>
                                                <th className="">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedInfracList.map((infrac) => (
                                                <TableRow
                                                    key={infrac.id}
                                                    infrac={infrac}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="block md:hidden space-y-4 w-full">
                                    {sortedInfracList.map((infrac) => (
                                        <MobileInfracCard
                                            key={infrac.id}
                                            infrac={infrac}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg w-full max-w-2xl">
                        <h2 className="text-xl font-bold mb-4 text-center">Édition</h2>
                        <p className="text-center italic text-sm">
                            Sélectionnez une infraction pour l'éditer <br />
                            ou créez-en une nouvelle
                        </p>
                        {selectedInfrac && (
                            <div className="flex items-center justify-center mb-4 gap-2 bg-warning/10 p-2 rounded-lg w-fit mx-auto border border-warning/50">
                                <p>Edition de L'infraction : </p>
                                <span className="badge badge-info">{selectedId}</span>
                                <button
                                    className="btn btn-error btn-sm btn-circle"
                                    onClick={() => setSelectedId(null)}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(editSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">NEPH</span>
                                    </label>
                                    <select
                                        className={clsx("select select-bordered", {
                                            "select-error": errors.neph,
                                        })}
                                        aria-invalid={!!errors.neph}
                                        {...register("neph", {
                                            required: "Le NEPH est requis",
                                        })}
                                    >
                                        <option value="">Sélectionnez un NEPH</option>
                                        {fnpcList.map((fnpc) => (
                                            <option key={fnpc.neph} value={fnpc.neph}>
                                                {findPropLinkToFnpc(fnpc)
                                                    ? `${fnpc.neph} - ${formatName(
                                                          findPropLinkToFnpc(fnpc)
                                                              .prenom || "",
                                                      )} ${
                                                          findPropLinkToFnpc(
                                                              fnpc,
                                                          ).nom_famille?.[0]?.toUpperCase() ||
                                                          ""
                                                      }.` // Initiale du nom de famille
                                                    : `${fnpc.neph} - Propriétaire inconnu`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Points Perdu</span>
                                    </label>
                                    <input
                                        type="number"
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.points,
                                        })}
                                        aria-invalid={!!errors.points}
                                        {...register("points", { required: true })}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Date d'Infraction
                                        </span>
                                    </label>
                                    <RHFDateText
                                        control={control}
                                        name="date_infraction"
                                        className="input input-bordered w-full"
                                        rules={{ required: true }}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Article</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.article,
                                        })}
                                        aria-invalid={!!errors.article}
                                        {...register("article")}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Classe</span>
                                    </label>
                                    <select
                                        className={clsx("select select-bordered", {
                                            "select-error": errors.classe,
                                        })}
                                        aria-invalid={!!errors.classe}
                                        {...register("classe", {
                                            required: true,
                                        })}
                                    >
                                        <option value="">Sélectionner une classe</option>
                                        <option value="1">1ère Classe</option>
                                        <option value="2">2ème Classe</option>
                                        <option value="3">3ème Classe</option>
                                        <option value="4">4ème Classe</option>
                                        <option value="5">5ème Classe</option>
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Natinf</span>
                                    </label>
                                    <input
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.natinf,
                                        })}
                                        aria-invalid={!!errors.natinf}
                                        {...register("natinf")}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Statut</span>
                                    </label>
                                    <select
                                        className={clsx("select select-bordered", {
                                            "select-error": errors.statut,
                                        })}
                                        aria-invalid={!!errors.statut}
                                        {...register("statut", { required: true })}
                                    >
                                        <option value="">Sélectionner un statut</option>
                                        <option value="paye">Payé</option>
                                        <option value="attente">En Attente</option>
                                        <option value="impaye">Impayé</option>
                                        <option value="autre">Autre</option>
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Nipol/Nigend de l'agent
                                        </span>
                                    </label>
                                    <input
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.nipol,
                                        })}
                                        aria-invalid={!!errors.nipol}
                                        {...register("nipol", { required: true })}
                                    />
                                </div>
                                <div className="form-control grid md:col-span-2">
                                    <label className="label">
                                        <span className="label-text">Details</span>
                                    </label>
                                    <textarea
                                        className={clsx(
                                            "textarea textarea-bordered w-full",
                                            {
                                                "input-error": errors.details,
                                            },
                                        )}
                                        aria-invalid={!!errors.details}
                                        {...register("details")}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                {selectedId == null ? (
                                    <span className="italic text-sm">
                                        Création d'un enregistrement
                                    </span>
                                ) : (
                                    <span className="italic text-sm">
                                        Modification d'un enregistrement
                                    </span>
                                )}
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                                </button>
                            </div>
                            {selectedId != null && (
                                <div className="bg-error/5 p-3 rounded-lg border border-error/20 text-error text-sm space-y-1 text-center">
                                    <p>
                                        Attention, cet enregistrement est lié au NEPH :
                                        <span className="font-bold">
                                            {" "}
                                            {selectedInfrac.neph}{" "}
                                        </span>
                                        <br />
                                        Relié au propriétaire :{" "}
                                        <span className="font-bold">
                                            {(() => {
                                                const fnpc = selectedInfrac
                                                    ? findFnpcLinkToInfrac(selectedInfrac)
                                                    : null;
                                                const prop = fnpc
                                                    ? findPropLinkToFnpc(fnpc)
                                                    : null;
                                                if (!prop) return "Inconnu";
                                                const prenom = formatName(
                                                    prop.prenom || "",
                                                );
                                                const initial =
                                                    prop.nom_famille?.[0]?.toUpperCase() ||
                                                    "";
                                                return `${prenom} ${initial}.`;
                                            })()}
                                        </span>
                                    </p>
                                </div>
                            )}
                            {errorMsg && (
                                <div className="badge badge-error mt-2">{errorMsg}</div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </AdminAuthCheck>
    );
}

export default AdminInfracPage;
