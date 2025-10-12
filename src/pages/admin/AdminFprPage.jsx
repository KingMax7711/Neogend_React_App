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

function AdminFprPage() {
    const { user, token } = useAuthStore();
    const [propList, setPropList] = useState([]);
    const [fprList, setFprList] = useState([]);
    const [fnpcList, setFnpcList] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const firstLoadRef = useRef(true);
    const prevHashRef = useRef("");
    const firstPropLoadRef = useRef(true);
    const prevPropHashRef = useRef("");
    const firstFprLoadRef = useRef(true);
    const prevFprHashRef = useRef("");

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

    // Fetch fnpc
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

    // Fetch proprietaires
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

    // Fetch fpr
    useEffect(() => {
        // Ne lance rien tant que le token n'est pas prêt ou que l'utilisateur n'est pas admin
        const accesGranted = ["admin", "owner"];
        const isGranted = accesGranted.includes(user?.privileges);
        if (!token || !isGranted) return;

        let cancelled = false;

        const stableHash = (list) => {
            try {
                const norm = [...(list || [])]
                    .map((fpr) => ({
                        id: fpr?.id ?? fpr?.user_id ?? null,
                        exactitude: fpr?.exactitude ?? null,

                        date_enregistrement: fpr?.date_enregistrement ?? null,
                        motif_enregistrement: fpr?.motif_enregistrement ?? null,
                        autorite_enregistrement: fpr?.autorite_enregistrement ?? null,
                        lieu_faits: fpr?.lieu_faits ?? null,
                        details: fpr?.details ?? null,

                        dangerosite: fpr?.dangerosite ?? null,
                        signes_distinctifs: fpr?.signes_distinctifs ?? null,

                        conduite: fpr?.conduite ?? null,

                        prop_id: fpr?.prop_id ?? null, //!!! ATTENTION INVERSION prop_id / id_prop (Je suis con j'ai pas fait gaffe en back)
                        neph: fpr?.neph ?? null,
                        num_fijait: fpr?.num_fijait ?? null,
                    }))
                    .sort(
                        (a, b) => (a.id ?? 0) - (b.id ?? 0) || a.id.localeCompare(b.id),
                    );
                return JSON.stringify(norm);
            } catch {
                return "";
            }
        };

        const fetchFpr = async () => {
            if (cancelled) return;
            try {
                if (firstFprLoadRef.current) setLoading(true);
                setError("");
                const response = await axios.get(`${API}/fpr/read/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!cancelled) {
                    const next = response.data || [];
                    const nextHash = stableHash(next);
                    if (nextHash !== prevFprHashRef.current) {
                        setFprList(next);
                        prevFprHashRef.current = nextHash;
                    }
                }
            } catch (err) {
                console.error("Error fetching fpr:", err);
                if (!cancelled) {
                    setError("Impossible de charger le fpr.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    firstFprLoadRef.current = false;
                }
            }
        };

        const poll = () => {
            if (document.hidden) return; // ignore si onglet caché
            fetchFpr();
        };

        fetchFpr();
        const intervalId = setInterval(poll, 30000);
        const onVisibility = () => {
            if (!document.hidden) fetchFpr();
        };
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            cancelled = true;
            clearInterval(intervalId);
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [token, user]);

    // Si la liste change et que l'ID sélectionné n'existe plus, on nettoie
    useEffect(() => {
        if (selectedId != null && !fprList.some((p) => p.id === selectedId)) {
            setSelectedId(null);
        }
    }, [fprList, selectedId]);

    const selectedFpr = useMemo(
        () => fprList.find((p) => p.id === selectedId) ?? null,
        [fprList, selectedId],
    );

    const findPropLinkToFpr = (fpr) => {
        const prop = propList.find((p) => p.id === fpr.prop_id);
        return prop ? prop : null;
    };

    const findPropLinkToFnpc = (fnpc) => {
        const prop = propList.find((p) => p.id === fnpc.prop_id);
        return prop ? prop : null;
    };

    const TableRow = ({ fpr }) => {
        const linkedProp = findPropLinkToFpr(fpr);
        const ownerLabel = linkedProp
            ? linkedProp.prenom !== "" && linkedProp.nom_famille !== ""
                ? `${formatName(linkedProp.prenom)} ${
                      linkedProp.nom_famille?.[0]?.toUpperCase() || ""
                  }.`
                : "Propriétaire inconnu"
            : "Aucun propriétaire";

        const fmt = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));
        const fmtName = (v) =>
            v === null || v === undefined || v === "" ? "—" : formatName(v);
        const fmtDate = (v) => (v ? dbDateToFront(v) : "—");

        return (
            <tr key={fpr.id} className="text-center">
                <td>{fmt(fpr.id)}</td>
                <td>{ownerLabel}</td>
                <td>{fmtName(fpr.exactitude)}</td>
                <td>{fmtDate(fpr.date_enregistrement)}</td>
                <td>{fmt(fpr.motif_enregistrement).toUpperCase()}</td>
                <td>{fmtName(fpr.autorite_enregistrement)}</td>
                <td>{fmt(fpr.lieu_faits).toUpperCase()}</td>
                <td>{fmtName(fpr.dangerosite)}</td>
                <td>{fmt(fpr.neph)}</td>
                <td>{fmt(fpr.num_fijait)}</td>
                <td>
                    <input
                        type="radio"
                        className="radio radio-primary"
                        name="edit"
                        value={fpr.id}
                        checked={selectedId === fpr.id}
                        onMouseDown={(e) => e.preventDefault()} // évite le focus qui scroll
                        onChange={() => handleSelect(fpr.id)}
                    />
                </td>
                <td>
                    <button
                        className="btn btn-error btn-sm"
                        onClick={() => deleteHandle(fpr.id)}
                    >
                        Supprimer
                    </button>
                </td>
            </tr>
        );
    };

    const MobileFprCard = ({ fpr }) => {
        const linkedProp = findPropLinkToFpr(fpr);
        const ownerLabel = linkedProp
            ? linkedProp.prenom !== "" && linkedProp.nom_famille !== ""
                ? `${formatName(linkedProp.prenom)} ${
                      linkedProp.nom_famille?.[0]?.toUpperCase() || ""
                  }.`
                : "Propriétaire inconnu"
            : "Aucun propriétaire";

        const fmt = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));
        const fmtName = (v) =>
            v === null || v === undefined || v === "" ? "—" : formatName(v);
        const fmtDate = (v) => (v ? dbDateToFront(v) : "—");

        return (
            <div
                key={fpr.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(fpr.id)}
                className={clsx(
                    "card card-compact bg-base-100 shadow-md rounded-box border border-base-content/5 cursor-pointer",
                    { "border-primary": selectedId === fpr.id },
                )}
            >
                <div className="card-body">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="card-title text-base-content">
                                ID: <span className="font-mono">{fmt(fpr.id)}</span>
                            </h3>
                            <p className="text-sm text-base-content/70">
                                Propriétaire:{" "}
                                <span className="font-medium">{ownerLabel}</span>
                            </p>
                        </div>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                className="radio radio-primary pointer-events-none"
                                name="edit-mobile"
                                value={fpr.id}
                                readOnly
                                checked={selectedId === fpr.id}
                            />
                        </label>
                    </div>

                    <div className="divider my-2" />

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="opacity-70">Exactitude</div>
                        <div className="font-medium">{fmtName(fpr.exactitude)}</div>

                        <div className="opacity-70">Date enr.</div>
                        <div className="font-medium">
                            {fmtDate(fpr.date_enregistrement)}
                        </div>

                        <div className="opacity-70">Motif</div>
                        <div className="font-medium">
                            {fmt(fpr.motif_enregistrement).toUpperCase()}
                        </div>

                        <div className="opacity-70">Autorité</div>
                        <div className="font-medium">
                            {fmt(fpr.autorite_enregistrement)}
                        </div>

                        <div className="opacity-70">Lieu</div>
                        <div className="font-medium">
                            {fmt(fpr.lieu_faits).toUpperCase()}
                        </div>

                        <div className="opacity-70">Dangerosité</div>
                        <div className="font-medium">{fmtName(fpr.dangerosite)}</div>

                        <div className="opacity-70">NEPH</div>
                        <div className="font-mono">{fmt(fpr.neph)}</div>

                        <div className="opacity-70">N° FIJAIT</div>
                        <div className="font-mono">{fmt(fpr.num_fijait)}</div>
                    </div>

                    {fpr?.signes_distinctifs || fpr?.details ? (
                        <div className="mt-2 text-xs text-base-content/70">
                            {fpr?.signes_distinctifs && (
                                <div>
                                    <span className="opacity-70">Signes:</span>{" "}
                                    {fpr.signes_distinctifs}
                                </div>
                            )}
                            {fpr?.details && (
                                <div className="line-clamp-3">
                                    <span className="opacity-70">Détails:</span>{" "}
                                    {fpr.details}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        );
    };

    const sortedFprList = [...fprList].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { isSubmitting, errors },
    } = useForm({
        defaultValues: {
            id: "",
            exactitude: "",
            date_enregistrement: new Date().toISOString().slice(0, 10),
            motif_enregistrement: "",
            autorite_enregistrement: "",
            lieu_faits: "",
            details: "",
            dangerosite: "",
            signes_distinctifs: "",
            conduite: "",
            prop_id: "",
            neph: "",
            num_fijait: "",
        },
    });

    // Pré-remplir le formulaire quand la sélection change
    useEffect(() => {
        if (!selectedFpr) {
            reset({
                id: "",
                exactitude: "",
                date_enregistrement: new Date().toISOString().slice(0, 10),
                motif_enregistrement: "",
                autorite_enregistrement: "",
                lieu_faits: "",
                details: "",
                dangerosite: "",
                signes_distinctifs: "",
                conduite: "",
                prop_id: "",
                neph: "",
                num_fijait: "",
            });
            return;
        }
        reset({
            //TODO: Normalize des valeurs
            id: selectedFpr.id ?? "",
            exactitude: selectedFpr.exactitude ?? "",
            date_enregistrement: selectedFpr.date_enregistrement ?? "",
            motif_enregistrement: selectedFpr.motif_enregistrement ?? "",
            autorite_enregistrement: selectedFpr.autorite_enregistrement ?? "",
            lieu_faits: selectedFpr.lieu_faits ?? "",
            details: selectedFpr.details ?? "",
            dangerosite: selectedFpr.dangerosite ?? "",
            signes_distinctifs: selectedFpr.signes_distinctifs ?? "",
            conduite: selectedFpr.conduite ?? "",
            prop_id: selectedFpr.prop_id ?? "", //!!! ATTENTION INVERSION prop_id / id_prop (Je suis con j'ai pas fait gaffe en back)
            neph: selectedFpr.neph ?? "",
            num_fijait: selectedFpr.num_fijait ?? "",
        });
    }, [selectedFpr, reset]);

    // Construit un payload typé et met toutes les chaînes en minuscules
    const buildFprPayload = (raw) => {
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
            exactitude: s(raw.exactitude),

            date_enregistrement: d(raw.date_enregistrement),
            motif_enregistrement: s(raw.motif_enregistrement),
            autorite_enregistrement: s(raw.autorite_enregistrement),
            lieu_faits: s(raw.lieu_faits),
            details: s(raw.details),
            dangerosite: s(raw.dangerosite),
            signes_distinctifs: s(raw.signes_distinctifs),
            conduite: s(raw.conduite),

            prop_id: n(raw.prop_id),
            neph: s(raw.neph),
            num_fijait: s(raw.num_fijait),
        };
        return out;
    };

    const editSubmit = async (data) => {
        try {
            const baseId = selectedFpr?.id ?? null;
            const payload = buildFprPayload(data);
            if (baseId != null) {
                const res = await axios.put(`${API}/fpr/update/${baseId}/`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const updated = res?.data || payload;
                setFprList((prev) => {
                    const idx = prev.findIndex((p) => p.id === baseId);
                    if (idx === -1) return prev;
                    const next = [...prev];
                    next[idx] = { ...prev[idx], ...updated, id: baseId };
                    return next;
                });
                setSelectedId(null);
            } else {
                const res = await axios.post(`${API}/fpr/create/`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const created = res?.data;
                if (created && created.id != null) {
                    setFprList((prev) => {
                        const next = [...prev, created];
                        return next;
                    });
                    reset();
                }
            }
        } catch (e) {
            console.error("Échec de l'enregistrement", e);
        }
    };

    const deleteHandle = async (id) => {
        if (!id) return;
        try {
            await axios.delete(`${API}/fpr/delete/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFprList((prev) => prev.filter((p) => p.id !== id));
            if (selectedId === id) setSelectedId(null);
        } catch (e) {
            console.error("Suppression échouée", e);
        }
    };

    return (
        <AdminAuthCheck>
            <Renamer pageTitle="FPR - NEOGEND" />
            <div className="">
                <DefaultHeader />
                <div className="flex flex-col md:flex-row md:items-start items-center justify-center gap-8 p-6">
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-center">FPR</h2>
                        <p className="text-center italic text-sm mb-4">
                            L'ensemble des données n'est pas affiché, pour plus de détails
                            sélectionner un enregistrement.
                        </p>
                        {loading ? (
                            <div className="flex justify-center">
                                <span className="loading loading-spinner text-primary"></span>
                            </div>
                        ) : error ? (
                            <div className="badge badge-error">{error}</div>
                        ) : (
                            <div>
                                <div className="md:block hidden overflow-x-auto rounded-box border border-base-content/5 bg-base-100 w-full">
                                    <table className="table">
                                        <thead>
                                            <tr className="text-center">
                                                <th>ID</th>
                                                <th>Propriétaire</th>
                                                <th>Exactitude</th>
                                                <th>Date enr.</th>
                                                <th>Motif</th>
                                                <th>Autorité</th>
                                                <th>Lieu</th>
                                                <th>Dangerosité</th>
                                                <th>NEPH</th>
                                                <th>N° FIJAIT</th>
                                                <th>Sélectionner</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedFprList.map((fpr) => (
                                                <TableRow key={fpr.id} fpr={fpr} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="block md:hidden space-y-4 w-full">
                                    {sortedFprList.map((fpr) => (
                                        <MobileFprCard key={fpr.id} fpr={fpr} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg w-full max-w-2xl">
                        <h2 className="text-xl font-bold mb-4 text-center">Édition</h2>
                        <p className="text-center italic text-sm">
                            Sélectionnez un enregistrement pour l'éditer <br />
                            ou créez-en un nouveau
                        </p>
                        {selectedFpr && (
                            <div className="flex items-center justify-center mb-4 gap-2 bg-warning/10 p-2 rounded-lg w-fit mx-auto border border-warning/50">
                                <p>Edition de L'enregistrement : </p>
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
                                        <span className="label-text">Propriétaire</span>
                                    </label>
                                    <select
                                        className={clsx("select select-bordered", {
                                            "select-error": errors.prop_id,
                                        })}
                                        aria-invalid={!!errors.prop_id}
                                        {...register("prop_id", { required: true })}
                                    >
                                        <option value="">Aucun</option>
                                        {propList.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                ({p.id}) {formatName(p.prenom)}{" "}
                                                {p.nom_famille?.[0]?.toUpperCase() || ""}.
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Exactitude de l'Identification
                                        </span>
                                    </label>
                                    <select
                                        className={clsx("select select-bordered", {
                                            "select-error": errors.exactitude,
                                        })}
                                        aria-invalid={!!errors.exactitude}
                                        {...register("exactitude")}
                                    >
                                        <option value="">Sélectionner</option>
                                        <option value="confirmer">Confirmer</option>
                                        <option value="non_confirmer">
                                            Non Confirmer
                                        </option>
                                        <option value="usurper">Usurper</option>
                                        <option value="surnom">Surnom</option>
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Date d'enregistrement
                                        </span>
                                    </label>
                                    <RHFDateText
                                        control={control}
                                        name="date_enregistrement"
                                        rules={{ required: true }}
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Motif d'enregistrement
                                        </span>
                                    </label>
                                    <select
                                        className={clsx("select select-bordered", {
                                            "select-error": errors.motif_enregistrement,
                                        })}
                                        aria-invalid={!!errors.motif_enregistrement}
                                        {...register("motif_enregistrement", {
                                            required: true,
                                        })}
                                    >
                                        <option value="">Sélectionner</option>
                                        <option value="al">Aliéné</option>
                                        <option value="e">
                                            Police Générales des Etrangers
                                        </option>
                                        <option value="it">
                                            Interdiction de Territoire
                                        </option>
                                        <option value="m">Mineur Fugueur</option>
                                        <option value="pj">
                                            Recherche de Police Judiciaire
                                        </option>
                                        <option value="s">Sûreté de l'Etat</option>
                                        <option value="v">Evadé</option>
                                        <option value="x">Personne Disparu</option>
                                        <option value="cj">Contrôle Judiciaire</option>
                                        <option value="g">Permis de Conduire</option>
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Autorité</span>
                                    </label>
                                    <input
                                        className="input input-bordered"
                                        {...register("autorite_enregistrement")}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Lieu des faits</span>
                                    </label>
                                    <input
                                        className="input input-bordered"
                                        {...register("lieu_faits")}
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Dangerosité</span>
                                    </label>
                                    <select
                                        className="select select-bordered"
                                        {...register("dangerosite")}
                                    >
                                        <option value="">Néant</option>
                                        <option value="vulnerable">Vulnérable</option>
                                        <option value="faible">Faible Risque</option>
                                        <option value="moyenne">Risque Modéré</option>
                                        <option value="forte">Fort Risque</option>
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Conduite</span>
                                    </label>
                                    <input
                                        className="input input-bordered"
                                        {...register("conduite")}
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Signes distinctifs
                                        </span>
                                    </label>
                                    <textarea
                                        rows={2}
                                        className="textarea textarea-bordered"
                                        {...register("signes_distinctifs")}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Information Diverses
                                        </span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="textarea textarea-bordered"
                                        {...register("details")}
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">NEPH</span>
                                    </label>
                                    <select
                                        className={clsx("select select-bordered", {
                                            "select-error": errors.neph,
                                        })}
                                        aria-invalid={!!errors.neph}
                                        {...register("neph")}
                                    >
                                        <option value="">Sélectionner</option>
                                        {fnpcList.map((fnpc) => (
                                            <option key={fnpc.id} value={fnpc.neph}>
                                                {fnpc.neph + findPropLinkToFnpc(fnpc)
                                                    ? `${fnpc.neph} (${formatName(
                                                          findPropLinkToFnpc(fnpc)
                                                              ?.prenom,
                                                      )} ${
                                                          findPropLinkToFnpc(
                                                              fnpc,
                                                          )?.nom_famille?.[0]?.toUpperCase() ||
                                                          ""
                                                      }.)`
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Numéro FIJAIT</span>
                                    </label>
                                    <input
                                        className="input input-bordered"
                                        {...register("num_fijait")}
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
                                        Attention, cet enregistrement est lié au
                                        propriétaire :{" "}
                                        <span className="font-bold">
                                            {formatName(
                                                findPropLinkToFpr(selectedFpr)?.prenom,
                                            )}{" "}
                                            {findPropLinkToFpr(
                                                selectedFpr,
                                            )?.nom_famille?.[0]?.toUpperCase()}
                                            .
                                        </span>
                                    </p>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </AdminAuthCheck>
    );
}

export default AdminFprPage;
