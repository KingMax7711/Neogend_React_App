import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import clsx from "clsx";
import { X } from "lucide-react";

import { useAuthStore } from "../stores/authStore";
import AdminAuthCheck from "../components/AdminAuthCheck.jsx";
import Renamer from "../components/Renamer.jsx";
import DefaultHeader from "../components/Header.jsx";
import API from "../global/API";
import formatName from "../tools/formatName.js";
import { useForm } from "react-hook-form";
import RHFDateText from "../components/RHFDateText";

function AdminSivPage() {
    const { user, token } = useAuthStore();
    const [sivList, setSivList] = useState([]);
    const [propList, setPropList] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Date du jour au format YYYY-MM-DD
    const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

    const firstLoadRef = useRef(true);
    const prevHashRef = useRef("");
    const firstPropLoadRef = useRef(true);
    const prevPropHashRef = useRef("");

    // eslint-disable-next-line no-unused-vars
    const scrollYRef = useRef(0);

    const handleSelect = async (id) => {
        const y = window.scrollY;
        setSelectedId(id);
        requestAnimationFrame(() =>
            window.scrollTo({ top: y, left: 0, behavior: "auto" }),
        );
    };

    // Fetch SIV
    useEffect(() => {
        const accesGranted = ["admin", "owner"];
        const isGranted = accesGranted.includes(user?.privileges);
        if (!token || !isGranted) return;

        let cancelled = false;

        const stableHash = (list) => {
            try {
                const norm = [...(list || [])]
                    .map((siv) => ({
                        id: siv?.id ?? siv?.user_id ?? null,
                        prop_id: siv?.prop_id ?? null,
                        co_prop_id: siv?.co_prop_id ?? null,
                        ci_numero_immatriculation: siv?.ci_numero_immatriculation ?? null,
                        ci_etat_administratif: siv?.ci_etat_administratif ?? null,
                        vl_marque: siv?.vl_marque ?? null,
                        vl_couleur_dominante: siv?.vl_couleur_dominante ?? null,
                        tech_puissance_fiscale: siv?.tech_puissance_fiscale ?? null,
                        ct_date_echeance: siv?.ct_date_echeance ?? null,
                        as_assureur: siv?.as_assureur ?? null,
                    }))
                    .sort(
                        (a, b) => (a.id ?? 0) - (b.id ?? 0) || a.id.localeCompare(b.id),
                    );
                return JSON.stringify(norm);
            } catch {
                return "";
            }
        };

        const fetchSiv = async () => {
            if (cancelled) return;
            try {
                if (firstLoadRef.current) setLoading(true);
                setError("");
                const response = await axios.get(`${API}/siv/read/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!cancelled) {
                    const next = response.data || [];
                    const nextHash = stableHash(next);
                    if (nextHash !== prevHashRef.current) {
                        setSivList(next);
                        prevHashRef.current = nextHash;
                    }
                }
            } catch (err) {
                console.error("Error fetching SIV:", err);
                if (!cancelled) {
                    setError("Impossible de charger le SIV.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    firstLoadRef.current = false;
                }
            }
        };

        const poll = () => {
            if (document.hidden) return;
            fetchSiv();
        };

        fetchSiv();
        const intervalId = setInterval(poll, 30000);
        const onVisibility = () => {
            if (!document.hidden) fetchSiv();
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
            if (document.hidden) return;
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
    }, [token, user]);

    // Si la liste change et que l'ID sélectionné n'existe plus, on nettoie
    useEffect(() => {
        if (selectedId != null && !sivList.some((p) => p.id === selectedId)) {
            setSelectedId(null);
        }
    }, [sivList, selectedId]);

    const selectedSiv = useMemo(
        () => sivList.find((p) => p.id === selectedId) ?? null,
        [sivList, selectedId],
    );

    const findPropById = (pid) => propList.find((p) => p.id === pid) || null;

    const TableRow = ({ siv }) => {
        const owner = findPropById(siv.prop_id);
        const ownerLabel = owner
            ? owner.prenom !== "" && owner.nom_famille !== ""
                ? `${formatName(owner.prenom)} ${
                      owner.nom_famille?.[0]?.toUpperCase() || ""
                  }.`
                : "Propriétaire inconnu"
            : "Aucun propriétaire";

        const fmt = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));

        return (
            <tr key={siv.id} className="text-center">
                <td>{fmt(siv.id)}</td>
                <td className="font-mono">
                    {fmt(siv.ci_numero_immatriculation).toUpperCase()}
                </td>
                <td>{ownerLabel}</td>
                <td>{fmt(siv.vl_marque)}</td>
                <td>{fmt(siv.vl_couleur_dominante)}</td>
                <td>{fmt(siv.tech_puissance_fiscale)}</td>
                <td>{fmt(siv.ct_date_echeance)}</td>
                <td>{fmt(siv.as_assureur)}</td>
                <td>
                    <input
                        type="radio"
                        className="radio radio-primary"
                        name="edit"
                        value={siv.id}
                        checked={selectedId === siv.id}
                        onMouseDown={(e) => e.preventDefault()}
                        onChange={() => handleSelect(siv.id)}
                    />
                </td>
                <td>
                    <button
                        className="btn btn-error btn-sm"
                        onClick={() => deleteHandle(siv.id)}
                    >
                        Supprimer
                    </button>
                </td>
            </tr>
        );
    };

    const MobileSivCard = ({ siv }) => {
        const owner = findPropById(siv.prop_id);
        const ownerLabel = owner
            ? owner.prenom !== "" && owner.nom_famille !== ""
                ? `${formatName(owner.prenom)} ${
                      owner.nom_famille?.[0]?.toUpperCase() || ""
                  }.`
                : "Propriétaire inconnu"
            : "Aucun propriétaire";
        const fmt = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));

        return (
            <div
                key={siv.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(siv.id)}
                className={clsx(
                    "card card-compact bg-base-100 shadow-md rounded-box border border-base-content/5 cursor-pointer",
                    { "border-primary": selectedId === siv.id },
                )}
            >
                <div className="card-body">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="card-title text-base-content">
                                {fmt(siv.ci_numero_immatriculation).toUpperCase()}
                            </h3>
                            <p className="text-sm text-base-content/70">
                                ID: <span className="font-mono">{fmt(siv.id)}</span>
                            </p>
                        </div>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                className="radio radio-primary pointer-events-none"
                                name="edit-mobile"
                                value={siv.id}
                                readOnly
                                checked={selectedId === siv.id}
                            />
                        </label>
                    </div>

                    <div className="divider my-2" />

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="opacity-70">Propriétaire</div>
                        <div className="font-medium">{ownerLabel}</div>

                        <div className="opacity-70">Marque</div>
                        <div className="font-medium">{fmt(siv.vl_marque)}</div>

                        <div className="opacity-70">Couleur</div>
                        <div className="font-medium">{fmt(siv.vl_couleur_dominante)}</div>

                        <div className="opacity-70">Puiss. fiscale</div>
                        <div className="font-medium">
                            {fmt(siv.tech_puissance_fiscale)}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const sortedSivList = [...sivList].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        control,
        formState: { isSubmitting, errors },
    } = useForm({
        defaultValues: {
            id: "",
            // Proprietaires
            prop_id: "",
            co_prop_id: "",
            // Certificat d'immatriculation
            ci_etat_administratif: "",
            ci_numero_immatriculation: "",
            ci_date_premiere_circulation: "", // sera fixé à todayStr lors de la création
            ci_date_certificat: "", // sera fixé à todayStr lors de la création
            // Véhicule
            vl_etat_administratif: "",
            vl_marque: "",
            vl_denomination_commerciale: "",
            vl_version: "",
            vl_couleur_dominante: "",
            // Tech
            tech_puissance_kw: "",
            tech_puissance_ch: "",
            tech_puissance_fiscale: "",
            tech_cylindree: "",
            tech_carburant: "",
            tech_emissions_co2: "",
            tech_poids_vide: "",
            tech_poids_ptac: "",
            tech_places_assises: "",
            tech_places_debout: "",
            // CT
            ct_date_echeance: "", // sera éventuellement fixé en création
            // Assurance
            as_assureur: "",
            as_date_contrat: "",
        },
    });

    // Helpers dates
    const addYears = (dateStr, years) => {
        if (!dateStr) return "";
        const [y, m, d] = String(dateStr)
            .split("-")
            .map((v) => Number(v));
        if (!y || !m || !d) return "";
        const dt = new Date(Date.UTC(y, m - 1, d));
        dt.setUTCFullYear(dt.getUTCFullYear() + Number(years || 0));
        const yyyy = dt.getUTCFullYear();
        const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(dt.getUTCDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };

    const diffYearsFromToday = (dateStr) => {
        if (!dateStr) return null;
        const [y, m, d] = String(dateStr)
            .split("-")
            .map((v) => Number(v));
        if (!y || !m || !d) return null;
        const now = new Date();
        const ny = now.getUTCFullYear();
        const nm = now.getUTCMonth() + 1;
        const nd = now.getUTCDate();
        let years = ny - y;
        if (nm < m || (nm === m && nd < d)) years -= 1;
        return years;
    };

    // Flag pour savoir si date CT a été modifiée manuellement (création uniquement)
    const ctManuallyEditedRef = useRef(false);

    // Pré-remplir le formulaire quand la sélection change
    useEffect(() => {
        if (!selectedSiv) {
            // Mode création: pré-remplir PTC (première mise en circulation) et certificat à aujourd'hui
            // et initialiser CT à +4 ans (sera ajusté par l'effet ci-dessous si besoin)
            ctManuallyEditedRef.current = false;
            reset({
                id: "",
                prop_id: "",
                co_prop_id: "",
                ci_etat_administratif: "",
                ci_numero_immatriculation: "",
                ci_date_premiere_circulation: todayStr,
                ci_date_certificat: todayStr,
                vl_etat_administratif: "",
                vl_marque: "",
                vl_denomination_commerciale: "",
                vl_version: "",
                vl_couleur_dominante: "",
                tech_puissance_kw: "",
                tech_puissance_ch: "",
                tech_puissance_fiscale: "",
                tech_cylindree: "",
                tech_carburant: "",
                tech_emissions_co2: "",
                tech_poids_vide: "",
                tech_poids_ptac: "",
                tech_places_assises: "",
                tech_places_debout: "",
                ct_date_echeance: addYears(todayStr, 4),
                as_assureur: "",
                as_date_contrat: "",
            });
            return;
        }
        reset({
            id: selectedSiv.id ?? "",
            prop_id: selectedSiv.prop_id ?? "",
            co_prop_id: selectedSiv.co_prop_id ?? "",
            ci_etat_administratif: selectedSiv.ci_etat_administratif ?? "",
            ci_numero_immatriculation: selectedSiv.ci_numero_immatriculation ?? "",
            ci_date_premiere_circulation: selectedSiv.ci_date_premiere_circulation ?? "",
            ci_date_certificat: selectedSiv.ci_date_certificat ?? "",
            vl_etat_administratif: selectedSiv.vl_etat_administratif ?? "",
            vl_marque: selectedSiv.vl_marque ?? "",
            vl_denomination_commerciale: selectedSiv.vl_denomination_commerciale ?? "",
            vl_version: selectedSiv.vl_version ?? "",
            vl_couleur_dominante: selectedSiv.vl_couleur_dominante ?? "",
            tech_puissance_kw: selectedSiv.tech_puissance_kw ?? "",
            tech_puissance_ch: selectedSiv.tech_puissance_ch ?? "",
            tech_puissance_fiscale: selectedSiv.tech_puissance_fiscale ?? "",
            tech_cylindree: selectedSiv.tech_cylindree ?? "",
            tech_carburant: selectedSiv.tech_carburant ?? "",
            tech_emissions_co2: selectedSiv.tech_emissions_co2 ?? "",
            tech_poids_vide: selectedSiv.tech_poids_vide ?? "",
            tech_poids_ptac: selectedSiv.tech_poids_ptac ?? "",
            tech_places_assises: selectedSiv.tech_places_assises ?? "",
            tech_places_debout: selectedSiv.tech_places_debout ?? "",
            ct_date_echeance: selectedSiv.ct_date_echeance ?? "",
            as_assureur: selectedSiv.as_assureur ?? "",
            as_date_contrat: selectedSiv.as_date_contrat ?? "",
        });
    }, [selectedSiv, reset, todayStr]);

    // Synchronise automatiquement le CT en création si le véhicule a < 4 ans
    useEffect(() => {
        if (selectedId != null) return; // uniquement en création
        const base = watch("ci_date_premiere_circulation");
        if (!base) return;
        if (ctManuallyEditedRef.current) return;
        const age = diffYearsFromToday(base);
        if (age !== null && age < 4) {
            const next = addYears(base, 4);
            if (next)
                setValue("ct_date_echeance", next, {
                    shouldValidate: true,
                    shouldDirty: true,
                });
        } else {
            // Age >= 4 ans: ne pas imposer; on efface si pas modifié manuellement
            setValue("ct_date_echeance", "", { shouldValidate: true, shouldDirty: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watch("ci_date_premiere_circulation"), selectedId]);

    // Construit un payload typé
    const buildSivPayload = (raw) => {
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
            return String(v);
        };

        const out = {
            prop_id: n(raw.prop_id),
            co_prop_id: raw.co_prop_id ? n(raw.co_prop_id) : null,

            ci_etat_administratif: s(raw.ci_etat_administratif),
            ci_numero_immatriculation: s(raw.ci_numero_immatriculation),
            ci_date_premiere_circulation: d(raw.ci_date_premiere_circulation),
            ci_date_certificat: d(raw.ci_date_certificat),

            vl_etat_administratif: s(raw.vl_etat_administratif),
            vl_marque: s(raw.vl_marque),
            vl_denomination_commerciale: s(raw.vl_denomination_commerciale),
            vl_version: s(raw.vl_version),
            vl_couleur_dominante: s(raw.vl_couleur_dominante),

            tech_puissance_kw: n(raw.tech_puissance_kw),
            tech_puissance_ch: n(raw.tech_puissance_ch),
            tech_puissance_fiscale: n(raw.tech_puissance_fiscale),
            tech_cylindree: n(raw.tech_cylindree),
            tech_carburant: s(raw.tech_carburant),
            tech_emissions_co2: n(raw.tech_emissions_co2),
            tech_poids_vide: n(raw.tech_poids_vide),
            tech_poids_ptac: n(raw.tech_poids_ptac),
            tech_places_assises: n(raw.tech_places_assises),
            tech_places_debout: n(raw.tech_places_debout),

            ct_date_echeance: d(raw.ct_date_echeance),

            as_assureur: s(raw.as_assureur),
            as_date_contrat: d(raw.as_date_contrat),
        };
        return out;
    };

    const editSubmit = async (data) => {
        try {
            const baseId = selectedSiv?.id ?? null;
            const payload = buildSivPayload(data);
            if (baseId != null) {
                const res = await axios.put(`${API}/siv/update/${baseId}/`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const updated = res?.data || payload;
                setSivList((prev) => {
                    const idx = prev.findIndex((p) => p.id === baseId);
                    if (idx === -1) return prev;
                    const next = [...prev];
                    next[idx] = { ...prev[idx], ...updated, id: baseId };
                    return next;
                });
                setSelectedId(null);
            } else {
                const res = await axios.post(`${API}/siv/create/`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const created = res?.data;
                if (created && created.id != null) {
                    setSivList((prev) => [...prev, created]);
                    reset();
                }
            }
        } catch (e) {
            console.error("Échec de l'enregistrement SIV", e);
        }
    };

    const deleteHandle = async (id) => {
        if (!id) return;
        try {
            await axios.delete(`${API}/siv/delete/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSivList((prev) => prev.filter((p) => p.id !== id));
            if (selectedId === id) setSelectedId(null);
        } catch (e) {
            console.error("Suppression SIV échouée", e);
        }
    };

    return (
        <AdminAuthCheck>
            <Renamer pageTitle="SIV - NEOGEND" />
            <div className="">
                <DefaultHeader />
                <div className="flex flex-col md:flex-row md:items-start items-center justify-center gap-8 p-6">
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-center">SIV</h2>
                        <p className="text-center italic text-sm mb-4">
                            L'ensemble des données n'est pas affiché; sélectionnez un
                            enregistrement pour voir les détails.
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
                                                <th>Immatriculation</th>
                                                <th>Propriétaire</th>
                                                <th>Marque</th>
                                                <th>Couleur</th>
                                                <th>Puiss. fiscale</th>
                                                <th>CT Échéance</th>
                                                <th>Assureur</th>
                                                <th>Sélectionner</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedSivList.map((siv) => (
                                                <TableRow key={siv.id} siv={siv} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="block md:hidden space-y-4 w-full">
                                    {sortedSivList.map((siv) => (
                                        <MobileSivCard key={siv.id} siv={siv} />
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
                        {selectedSiv && (
                            <div className="flex items-center justify-center mb-4 gap-2 bg-warning/10 p-2 rounded-lg w-fit mx-auto border border-warning/50">
                                <p>Édition de l'enregistrement :</p>
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
                                {/* Propriétaires */}
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
                                            Co-propriétaire
                                        </span>
                                    </label>
                                    <select
                                        className="select select-bordered"
                                        {...register("co_prop_id")}
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
                                {/* Certificat d'immatriculation */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            État administratif (CI)
                                        </span>
                                    </label>
                                    <select
                                        className={clsx("select select-bordered", {
                                            "select-error": errors.ci_etat_administratif,
                                        })}
                                        aria-invalid={!!errors.ci_etat_administratif}
                                        {...register("ci_etat_administratif", {
                                            required: true,
                                        })}
                                    >
                                        <option value="">Sélectionner</option>
                                        <option value="valide">Valide</option>
                                        <option value="vole">Volé</option>
                                        <option value="perdu">Perdu</option>
                                        <option value="detruit">Détruit</option>
                                        <option value="annule">Annulé</option>
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Immatriculation
                                        </span>
                                    </label>
                                    <input
                                        className={clsx("input input-bordered", {
                                            "input-error":
                                                errors.ci_numero_immatriculation,
                                        })}
                                        aria-invalid={!!errors.ci_numero_immatriculation}
                                        {...register("ci_numero_immatriculation", {
                                            required: true,
                                        })}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Première mise en circulation
                                        </span>
                                    </label>
                                    <RHFDateText
                                        control={control}
                                        name="ci_date_premiere_circulation"
                                        rules={{ required: true }}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Date du certificat
                                        </span>
                                    </label>
                                    <RHFDateText
                                        control={control}
                                        name="ci_date_certificat"
                                        rules={{ required: true }}
                                    />
                                </div>
                                {/* Véhicule */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            État administratif (VL)
                                        </span>
                                    </label>
                                    <select
                                        className={clsx("select select-bordered", {
                                            "select-error": errors.vl_etat_administratif,
                                        })}
                                        aria-invalid={!!errors.vl_etat_administratif}
                                        {...register("vl_etat_administratif", {
                                            required: true,
                                        })}
                                    >
                                        <option value="">Sélectionner</option>
                                        <option value="valide">Valide</option>
                                        <option value="saisi">Saisi</option>
                                        <option value="fourriere">
                                            Mis en fourrière
                                        </option>
                                        <option value="immobilise">Immobilisé</option>
                                        <option value="epave">Épave</option>
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Marque</span>
                                    </label>
                                    <input
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.vl_marque,
                                        })}
                                        aria-invalid={!!errors.vl_marque}
                                        {...register("vl_marque", { required: true })}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Dénomination commerciale
                                        </span>
                                    </label>
                                    <input
                                        className={clsx("input input-bordered", {
                                            "input-error":
                                                errors.vl_denomination_commerciale,
                                        })}
                                        aria-invalid={
                                            !!errors.vl_denomination_commerciale
                                        }
                                        {...register("vl_denomination_commerciale", {
                                            required: true,
                                        })}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Version</span>
                                    </label>
                                    <input
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.vl_version,
                                        })}
                                        aria-invalid={!!errors.vl_version}
                                        {...register("vl_version", { required: true })}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Couleur dominante
                                        </span>
                                    </label>
                                    <input
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.vl_couleur_dominante,
                                        })}
                                        aria-invalid={!!errors.vl_couleur_dominante}
                                        {...register("vl_couleur_dominante", {
                                            required: true,
                                        })}
                                    />
                                </div>
                                {/* Caractéristiques techniques */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Puissance (kW)</span>
                                    </label>
                                    <input
                                        type="number"
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.tech_puissance_kw,
                                        })}
                                        aria-invalid={!!errors.tech_puissance_kw}
                                        {...register("tech_puissance_kw", {
                                            required: true,
                                        })}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Puissance (ch)</span>
                                    </label>
                                    <input
                                        type="number"
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.tech_puissance_ch,
                                        })}
                                        aria-invalid={!!errors.tech_puissance_ch}
                                        {...register("tech_puissance_ch", {
                                            required: true,
                                        })}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Puissance fiscale
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.tech_puissance_fiscale,
                                        })}
                                        aria-invalid={!!errors.tech_puissance_fiscale}
                                        {...register("tech_puissance_fiscale", {
                                            required: true,
                                        })}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Cylindrée (cm³)
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.tech_cylindree,
                                        })}
                                        aria-invalid={!!errors.tech_cylindree}
                                        {...register("tech_cylindree", {
                                            required: true,
                                        })}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Carburant</span>
                                    </label>
                                    <select
                                        className={clsx("select select-bordered", {
                                            "select-error": errors.tech_carburant,
                                        })}
                                        aria-invalid={!!errors.tech_carburant}
                                        {...register("tech_carburant", {
                                            required: true,
                                        })}
                                    >
                                        <option value="">Sélectionner</option>
                                        <option value="ac">AC — Air comprimé</option>
                                        <option value="ee">
                                            EE — Essence+élec (hyb. rechargeable)
                                        </option>
                                        <option value="eg">EG — Essence+GPL</option>
                                        <option value="eh">
                                            EH — Essence+élec (hyb. non rechargeable)
                                        </option>
                                        <option value="el">EL — Électricité</option>
                                        <option value="em">
                                            EM — Essence+GNV+élec (hyb. rechargeable)
                                        </option>
                                        <option value="en">EN — Essence+GNV</option>
                                        <option value="ep">
                                            EP — Essence+GNV+élec (hyb. non rechargeable)
                                        </option>
                                        <option value="eq">
                                            EQ — Essence+GPL+élec (hyb. non rechargeable)
                                        </option>
                                        <option value="er">
                                            ER — Essence+GPL+élec (hyb. rechargeable)
                                        </option>
                                        <option value="es">ES — Essence</option>
                                        <option value="et">ET — Éthanol</option>
                                        <option value="fe">FE — Superéthanol</option>
                                        <option value="fg">FG — Superéthanol+GPL</option>
                                        <option value="fl">
                                            FL — Superéthanol+élec (hyb. rechargeable)
                                        </option>
                                        <option value="fn">FN — Superéthanol+GNV</option>
                                        <option value="ga">GA — Gazogène (*)</option>
                                        <option value="ge">
                                            GE — Gazogène+essence (*)
                                        </option>
                                        <option value="gf">
                                            GF — Gasoil+GNV (dual fuel)
                                        </option>
                                        <option value="gg">
                                            GG — Gazogène+gazole (*)
                                        </option>
                                        <option value="gh">
                                            GH — Gazole+élec (hyb. non rechargeable)
                                        </option>
                                        <option value="gl">
                                            GL — Gazole+élec (hyb. rechargeable)
                                        </option>
                                        <option value="gm">
                                            GM — Gazole+GNV+élec (hyb. rechargeable)
                                        </option>
                                        <option value="gn">GN — Gaz naturel</option>
                                        <option value="go">GO — Gazole / Diesel</option>
                                        <option value="gp">
                                            GP — GPL (Gaz de pétrole liquéfié)
                                        </option>
                                        <option value="gq">
                                            GQ — Gazole+GNV+élec (hyb. non rechargeable)
                                        </option>
                                        <option value="gz">
                                            GZ — Autres hydrocarbures gazeux
                                        </option>
                                        <option value="h2">H2 — Hydrogène</option>
                                        <option value="ne">
                                            NE — GNV+élec (hyb. rechargeable)
                                        </option>
                                        <option value="nh">
                                            NH — GNV+élec (hyb. non rechargeable)
                                        </option>
                                        <option value="pe">
                                            PE — GPL+élec (hyb. rechargeable)
                                        </option>
                                        <option value="ph">
                                            PH — GPL+élec (hyb. non rechargeable)
                                        </option>
                                        <option value="pl">PL — Pétrole lampant</option>
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Émissions CO₂ (g/km)
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.tech_emissions_co2,
                                        })}
                                        aria-invalid={!!errors.tech_emissions_co2}
                                        {...register("tech_emissions_co2", {
                                            required: true,
                                        })}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Poids à vide (kg)
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.tech_poids_vide,
                                        })}
                                        aria-invalid={!!errors.tech_poids_vide}
                                        {...register("tech_poids_vide", {
                                            required: true,
                                        })}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">PTAC (kg)</span>
                                    </label>
                                    <input
                                        type="number"
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.tech_poids_ptac,
                                        })}
                                        aria-invalid={!!errors.tech_poids_ptac}
                                        {...register("tech_poids_ptac", {
                                            required: true,
                                        })}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Places assises</span>
                                    </label>
                                    <input
                                        type="number"
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.tech_places_assises,
                                        })}
                                        aria-invalid={!!errors.tech_places_assises}
                                        {...register("tech_places_assises", {
                                            required: true,
                                        })}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Places debout</span>
                                    </label>
                                    <input
                                        type="number"
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.tech_places_debout,
                                        })}
                                        aria-invalid={!!errors.tech_places_debout}
                                        {...register("tech_places_debout", {
                                            required: true,
                                        })}
                                    />
                                </div>
                                {/* Contrôle technique */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            CT - Date d'échéance
                                        </span>
                                    </label>
                                    <RHFDateText
                                        control={control}
                                        name="ct_date_echeance"
                                        rules={{ required: true }}
                                        onUserChange={() => {
                                            if (selectedId == null) {
                                                ctManuallyEditedRef.current = true;
                                            }
                                        }}
                                    />
                                </div>
                                {/* Assurance */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Assureur</span>
                                    </label>
                                    <input
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.as_assureur,
                                        })}
                                        aria-invalid={!!errors.as_assureur}
                                        {...register("as_assureur")}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Date du contrat
                                        </span>
                                    </label>
                                    <RHFDateText
                                        control={control}
                                        name="as_date_contrat"
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
                                                findPropById(selectedSiv?.prop_id)
                                                    ?.prenom,
                                            )}{" "}
                                            {findPropById(
                                                selectedSiv?.prop_id,
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

export default AdminSivPage;
