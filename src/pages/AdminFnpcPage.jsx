import React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useAuthStore } from "../stores/authStore";
import { useForm } from "react-hook-form";
import axios from "axios";
import clsx from "clsx";
import { X } from "lucide-react";

import API from "../global/API";
import AdminAuthCheck from "../components/AdminAuthCheck.jsx";
import Renamer from "../components/Renamer.jsx";
import DefaultHeader from "../components/Header.jsx";
import formatName from "../tools/formatName.js";

function AdminFnpcPage() {
    const { user, token } = useAuthStore();
    const [fnpcList, setFnpcList] = useState([]);
    const [propList, setPropList] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [createError, setCreateError] = useState("");
    const firstLoadRef = useRef(true);
    const prevHashRef = useRef("");
    const firstPropLoadRef = useRef(true);
    const prevPropHashRef = useRef("");

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

    // Si la liste change et que l'ID sélectionné n'existe plus, on nettoie
    useEffect(() => {
        if (selectedId != null && !fnpcList.some((p) => p.id === selectedId)) {
            setSelectedId(null);
        }
    }, [fnpcList, selectedId]);

    const selectedFnpc = useMemo(
        () => fnpcList.find((p) => p.id === selectedId) ?? null,
        [fnpcList, selectedId],
    );

    // normalize inutilisé dans cette page
    // toLowercasePayload remplacé par buildFnpcPayload plus bas

    const findPropLinkToFnpc = (fnpc) => {
        const prop = propList.find((p) => p.id === fnpc.prop_id);
        return prop ? prop : null;
    };

    const TableRow = ({ fnpc }) => {
        const linkedProp = findPropLinkToFnpc(fnpc);
        return (
            <tr key={fnpc.id} className="text-center">
                <td>{fnpc.id}</td>
                <td>{fnpc.neph}</td>
                <td>
                    {linkedProp
                        ? linkedProp.prenom !== "" && linkedProp.nom_famille !== ""
                            ? `${formatName(
                                  linkedProp.prenom,
                              )} ${linkedProp.nom_famille[0].toUpperCase()}.`
                            : "Propriétaire inconnu"
                        : "Aucun propriétaire"}
                </td>
                <td>{fnpc.numero_titre}</td>
                <td>{fnpc.points}</td>
                <td>
                    <input
                        type="radio"
                        className="radio radio-primary"
                        name="edit"
                        value={fnpc.id}
                        checked={selectedId === fnpc.id}
                        onMouseDown={(e) => e.preventDefault()} // évite le focus qui scroll
                        onChange={() => handleSelect(fnpc.id)}
                    />
                </td>
                <td>
                    <button
                        className="btn btn-error btn-sm"
                        onClick={() => deleteHandle(fnpc.id)}
                    >
                        Supprimer
                    </button>
                </td>
            </tr>
        );
    };

    const MobileFnpcCard = ({ fnpc }) => {
        const linkedProp = findPropLinkToFnpc(fnpc);
        const ownerLabel = linkedProp
            ? linkedProp.prenom !== "" && linkedProp.nom_famille !== ""
                ? `${formatName(linkedProp.prenom)} ${
                      linkedProp.nom_famille?.[0]?.toUpperCase() || ""
                  }.`
                : "Propriétaire inconnu"
            : "Aucun propriétaire";

        return (
            <div
                key={fnpc.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(fnpc.id)}
                className={clsx(
                    "card card-compact bg-base-100 shadow-md rounded-box border border-base-content/5 cursor-pointer",
                    { "border-primary": selectedId === fnpc.id },
                )}
            >
                <div className="card-body">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="card-title text-base-content">
                                NEPH: <span className="font-mono">{fnpc.neph}</span>
                            </h3>
                            <p className="text-sm text-base-content/70">
                                ID: <span className="font-mono">{fnpc.id}</span>
                            </p>
                        </div>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                className="radio radio-primary pointer-events-none"
                                name="edit-mobile"
                                value={fnpc.id}
                                readOnly
                                checked={selectedId === fnpc.id}
                            />
                        </label>
                    </div>

                    <div className="divider my-2" />

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="opacity-70">Propriétaire</div>
                        <div className="font-medium">{ownerLabel}</div>

                        <div className="opacity-70">Numéro titre</div>
                        <div className="font-medium">{fnpc.numero_titre}</div>

                        <div className="opacity-70">Points</div>
                        <div className="font-medium">{fnpc.points}</div>
                    </div>
                </div>
            </div>
        );
    };

    const sortedFnpcList = [...fnpcList].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        getValues,
        formState: { isSubmitting, errors },
    } = useForm({
        defaultValues: {
            id: "",
            neph: "",
            numero_titre: "",
            date_delivrance: "",
            date_expiration: "",
            statut: "",
            validite: "",
            cat_am: false,
            cat_am_delivrance: "",
            cat_a1: false,
            cat_a1_delivrance: "",
            cat_a2: false,
            cat_a2_delivrance: "",
            cat_a: false,
            cat_a_delivrance: "",
            cat_b1: false,
            cat_b1_delivrance: "",
            cat_b: false,
            cat_b_delivrance: "",
            cat_c1: false,
            cat_c1_delivrance: "",
            cat_c: false,
            cat_c_delivrance: "",
            cat_d1: false,
            cat_d1_delivrance: "",
            cat_d: false,
            cat_d_delivrance: "",
            cat_be: false,
            cat_be_delivrance: "",
            cat_c1e: false,
            cat_c1e_delivrance: "",
            cat_ce: false,
            cat_ce_delivrance: "",
            cat_d1e: false,
            cat_d1e_delivrance: "",
            cat_de: false,
            cat_de_delivrance: "",
            code_restriction: "",
            probatoire: false,
            date_probatoire: "",
            points: "",
            prop_id: "",
            prefecture_delivrance: "",
        },
    });

    // Auto: date_expiration = date_delivrance + 15 ans (création uniquement)
    const expirationManuallyEditedRef = useRef(false);
    // Auto: probatoire -> date_probatoire = date_delivrance + 3 ans (création uniquement)
    const probatoireManuallyEditedRef = useRef(false);
    // Auto (catégories): mémorise si la date de chaque catégorie a été modifiée manuellement
    const manualEditedCatDateRef = useRef({});
    // Liste des catégories de permis (utilisée dans effets)
    const CAT_KEYS = useMemo(
        () => [
            "am",
            "a1",
            "a2",
            "a",
            "b1",
            "b",
            "c1",
            "c",
            "d1",
            "d",
            "be",
            "c1e",
            "ce",
            "d1e",
            "de",
        ],
        [],
    );

    // Utilitaire: ajoute N années à une date YYYY-MM-DD
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

    // Quand on passe en création, on réactive l'auto-complétion; en édition, on la désactive
    useEffect(() => {
        if (selectedId == null) {
            expirationManuallyEditedRef.current = false;
            manualEditedCatDateRef.current = {};
            probatoireManuallyEditedRef.current = false;
        } else {
            expirationManuallyEditedRef.current = true;
        }
    }, [selectedId]);

    // Met à jour automatiquement la date d'expiration en création, si non modifiée manuellement
    useEffect(() => {
        if (selectedId != null) return; // uniquement en création
        const delivrance = watch("date_delivrance");
        if (!delivrance) return;
        if (expirationManuallyEditedRef.current) return;
        const exp = addYears(delivrance, 15);
        if (exp) {
            setValue("date_expiration", exp, { shouldValidate: true, shouldDirty: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watch("date_delivrance"), selectedId]);

    // Met à jour automatiquement la date de fin probatoire en création
    useEffect(() => {
        if (selectedId != null) return; // uniquement en création
        const isProbatoire = Boolean(watch("probatoire"));
        const delivrance = watch("date_delivrance");
        if (!isProbatoire) return;
        if (!delivrance) return;
        if (probatoireManuallyEditedRef.current) return;
        const end = addYears(delivrance, 3);
        if (end) {
            setValue("date_probatoire", end, { shouldValidate: true, shouldDirty: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watch("date_delivrance"), watch("probatoire"), selectedId]);

    // Si la date de délivrance change en création, synchronise les dates des catégories cochées non modifiées manuellement
    useEffect(() => {
        if (selectedId != null) return; // uniquement en création
        const base = watch("date_delivrance");
        if (!base) return;
        CAT_KEYS.forEach((k) => {
            const boolName = `cat_${k}`;
            const dateName = `cat_${k}_delivrance`;
            const isChecked = Boolean(getValues(boolName));
            if (isChecked && !manualEditedCatDateRef.current[k]) {
                setValue(dateName, base, { shouldValidate: true, shouldDirty: true });
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watch("date_delivrance"), selectedId]);

    // Pré-remplir le formulaire quand la sélection change
    useEffect(() => {
        if (!selectedFnpc) {
            reset({
                id: "",
                neph: "",
                numero_titre: "",
                date_delivrance: "",
                date_expiration: "",
                statut: "",
                validite: "",
                cat_am: false,
                cat_am_delivrance: "",
                cat_a1: false,
                cat_a1_delivrance: "",
                cat_a2: false,
                cat_a2_delivrance: "",
                cat_a: false,
                cat_a_delivrance: "",
                cat_b1: false,
                cat_b1_delivrance: "",
                cat_b: false,
                cat_b_delivrance: "",
                cat_c1: false,
                cat_c1_delivrance: "",
                cat_c: false,
                cat_c_delivrance: "",
                cat_d1: false,
                cat_d1_delivrance: "",
                cat_d: false,
                cat_d_delivrance: "",
                cat_be: false,
                cat_be_delivrance: "",
                cat_c1e: false,
                cat_c1e_delivrance: "",
                cat_ce: false,
                cat_ce_delivrance: "",
                cat_d1e: false,
                cat_d1e_delivrance: "",
                cat_de: false,
                cat_de_delivrance: "",
                code_restriction: "",
                probatoire: false,
                date_probatoire: "",
                points: "",
                prop_id: "",
                prefecture_delivrance: "",
            });
            return;
        }
        reset({
            //TODO: Normalize des valeurs
            id: selectedFnpc.id ?? "",
            neph: selectedFnpc.neph ?? "",
            numero_titre: selectedFnpc.numero_titre ?? "",
            date_delivrance: selectedFnpc.date_delivrance ?? "",
            date_expiration: selectedFnpc.date_expiration ?? "",
            statut: selectedFnpc.statut ?? "",
            validite: selectedFnpc.validite ?? "",
            cat_am: Boolean(selectedFnpc.cat_am),
            cat_am_delivrance: selectedFnpc.cat_am_delivrance ?? "",
            cat_a1: Boolean(selectedFnpc.cat_a1),
            cat_a1_delivrance: selectedFnpc.cat_a1_delivrance ?? "",
            cat_a2: Boolean(selectedFnpc.cat_a2),
            cat_a2_delivrance: selectedFnpc.cat_a2_delivrance ?? "",
            cat_a: Boolean(selectedFnpc.cat_a),
            cat_a_delivrance: selectedFnpc.cat_a_delivrance ?? "",
            cat_b1: Boolean(selectedFnpc.cat_b1),
            cat_b1_delivrance: selectedFnpc.cat_b1_delivrance ?? "",
            cat_b: Boolean(selectedFnpc.cat_b),
            cat_b_delivrance: selectedFnpc.cat_b_delivrance ?? "",
            cat_c1: Boolean(selectedFnpc.cat_c1),
            cat_c1_delivrance: selectedFnpc.cat_c1_delivrance ?? "",
            cat_c: Boolean(selectedFnpc.cat_c),
            cat_c_delivrance: selectedFnpc.cat_c_delivrance ?? "",
            cat_d1: Boolean(selectedFnpc.cat_d1),
            cat_d1_delivrance: selectedFnpc.cat_d1_delivrance ?? "",
            cat_d: Boolean(selectedFnpc.cat_d),
            cat_d_delivrance: selectedFnpc.cat_d_delivrance ?? "",
            cat_be: Boolean(selectedFnpc.cat_be),
            cat_be_delivrance: selectedFnpc.cat_be_delivrance ?? "",
            cat_c1e: Boolean(selectedFnpc.cat_c1e),
            cat_c1e_delivrance: selectedFnpc.cat_c1e_delivrance ?? "",
            cat_ce: Boolean(selectedFnpc.cat_ce),
            cat_ce_delivrance: selectedFnpc.cat_ce_delivrance ?? "",
            cat_d1e: Boolean(selectedFnpc.cat_d1e),
            cat_d1e_delivrance: selectedFnpc.cat_d1e_delivrance ?? "",
            cat_de: Boolean(selectedFnpc.cat_de),
            cat_de_delivrance: selectedFnpc.cat_de_delivrance ?? "",
            code_restriction: selectedFnpc.code_restriction ?? "",
            probatoire: Boolean(selectedFnpc.probatoire),
            date_probatoire: selectedFnpc.date_probatoire ?? "",
            points: selectedFnpc.points ?? "",
            prop_id: selectedFnpc.prop_id ?? "",
            prefecture_delivrance: selectedFnpc.prefecture_delivrance ?? "",
        });
    }, [selectedFnpc, reset]);

    // Construit un payload typé et met toutes les chaînes en minuscules
    const buildFnpcPayload = (raw) => {
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
        const b = (v) => v === true || v === "true" || v === 1 || v === "1";
        const d = (v) => {
            if (v === undefined || v === null || v === "") return null;
            // On suppose déjà au format YYYY-MM-DD depuis l'input date
            return String(v);
        };

        const out = {
            neph: n(raw.neph),
            numero_titre: n(raw.numero_titre),
            date_delivrance: d(raw.date_delivrance),
            prefecture_delivrance: s(raw.prefecture_delivrance),
            date_expiration: d(raw.date_expiration),
            statut: s(raw.statut),
            validite: s(raw.validite),

            cat_am: b(raw.cat_am),
            cat_am_delivrance: b(raw.cat_am) ? d(raw.cat_am_delivrance) : null,
            cat_a1: b(raw.cat_a1),
            cat_a1_delivrance: b(raw.cat_a1) ? d(raw.cat_a1_delivrance) : null,
            cat_a2: b(raw.cat_a2),
            cat_a2_delivrance: b(raw.cat_a2) ? d(raw.cat_a2_delivrance) : null,
            cat_a: b(raw.cat_a),
            cat_a_delivrance: b(raw.cat_a) ? d(raw.cat_a_delivrance) : null,
            cat_b1: b(raw.cat_b1),
            cat_b1_delivrance: b(raw.cat_b1) ? d(raw.cat_b1_delivrance) : null,
            cat_b: b(raw.cat_b),
            cat_b_delivrance: b(raw.cat_b) ? d(raw.cat_b_delivrance) : null,
            cat_c1: b(raw.cat_c1),
            cat_c1_delivrance: b(raw.cat_c1) ? d(raw.cat_c1_delivrance) : null,
            cat_c: b(raw.cat_c),
            cat_c_delivrance: b(raw.cat_c) ? d(raw.cat_c_delivrance) : null,
            cat_d1: b(raw.cat_d1),
            cat_d1_delivrance: b(raw.cat_d1) ? d(raw.cat_d1_delivrance) : null,
            cat_d: b(raw.cat_d),
            cat_d_delivrance: b(raw.cat_d) ? d(raw.cat_d_delivrance) : null,
            cat_be: b(raw.cat_be),
            cat_be_delivrance: b(raw.cat_be) ? d(raw.cat_be_delivrance) : null,
            cat_c1e: b(raw.cat_c1e),
            cat_c1e_delivrance: b(raw.cat_c1e) ? d(raw.cat_c1e_delivrance) : null,
            cat_ce: b(raw.cat_ce),
            cat_ce_delivrance: b(raw.cat_ce) ? d(raw.cat_ce_delivrance) : null,
            cat_d1e: b(raw.cat_d1e),
            cat_d1e_delivrance: b(raw.cat_d1e) ? d(raw.cat_d1e_delivrance) : null,
            cat_de: b(raw.cat_de),
            cat_de_delivrance: b(raw.cat_de) ? d(raw.cat_de_delivrance) : null,

            code_restriction: s(raw.code_restriction),
            probatoire: b(raw.probatoire),
            date_probatoire: b(raw.probatoire) ? d(raw.date_probatoire) : null,
            points: n(raw.points),
            prop_id: n(raw.prop_id),
        };
        return out;
    };

    const editSubmit = async (data) => {
        setCreateError("");
        try {
            const baseId = selectedFnpc?.id ?? null;
            const payload = buildFnpcPayload(data);
            console.log("Payload to submit:", payload, " (baseId:", baseId, ")");
            if (baseId != null) {
                const res = await axios.put(`${API}/fnpc/update/${baseId}/`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const updated = res?.data || payload;
                setFnpcList((prev) => {
                    const idx = prev.findIndex((p) => p.id === baseId);
                    if (idx === -1) return prev;
                    const next = [...prev];
                    next[idx] = { ...prev[idx], ...updated, id: baseId };
                    return next;
                });
                setSelectedId(null);
            } else {
                const res = await axios.post(`${API}/fnpc/create/`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const created = res?.data;
                if (created && created.id != null) {
                    setFnpcList((prev) => {
                        const next = [...prev, created];
                        return next;
                    });
                    reset();
                }
            }
        } catch (e) {
            console.error("Échec de l'enregistrement", e);
            setCreateError(e?.response?.data?.detail || "Échec de l'enregistrement.");
        }
    };

    const deleteHandle = async (id) => {
        if (!id) return;
        try {
            await axios.delete(`${API}/fnpc/delete/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFnpcList((prev) => prev.filter((p) => p.id !== id));
            if (selectedId === id) setSelectedId(null);
        } catch (e) {
            console.error("Suppression échouée", e);
        }
    };

    return (
        <AdminAuthCheck>
            <Renamer pageTitle="FNPC - NEOGEND" />
            <div className="">
                <DefaultHeader />
                <div className="flex flex-col md:flex-row md:items-start items-center justify-center gap-8 p-6">
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-center">FNPC</h2>
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
                                <div className="md:block hidden overflow-x-auto rounded-box border border-base-content/5 bg-base-100 w-fit">
                                    <table className="table">
                                        <thead>
                                            <tr className="text-center">
                                                <th className="">ID</th>
                                                <th className="">NEPH</th>
                                                <th className="">Propriétaires</th>
                                                <th className="">Numéro Titre</th>
                                                <th className="">Points</th>
                                                <th className="">Sélectionner</th>
                                                <th className="">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedFnpcList.map((fnpc) => (
                                                <TableRow key={fnpc.id} fnpc={fnpc} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="block md:hidden space-y-4 w-full">
                                    {sortedFnpcList.map((fnpc) => (
                                        <MobileFnpcCard key={fnpc.id} fnpc={fnpc} />
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
                        {selectedFnpc && (
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
                                        <span className="label-text">NEPH</span>
                                    </label>
                                    <input
                                        type="number"
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.neph,
                                        })}
                                        aria-invalid={!!errors.neph}
                                        {...register("neph", {
                                            required: "Le NEPH est requis",
                                        })}
                                    />
                                    {errors.neph && (
                                        <span className="text-error text-xs mt-1">
                                            {errors.neph.message}
                                        </span>
                                    )}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Numéro de titre
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.numero_titre,
                                        })}
                                        aria-invalid={!!errors.numero_titre}
                                        {...register("numero_titre", { required: true })}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Points</span>
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
                                            Date de délivrance
                                        </span>
                                    </label>
                                    <input
                                        type="date"
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.date_delivrance,
                                        })}
                                        aria-invalid={!!errors.date_delivrance}
                                        {...register("date_delivrance", {
                                            required: true,
                                        })}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Préfecture de délivrance
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.prefecture_delivrance,
                                        })}
                                        aria-invalid={!!errors.prefecture_delivrance}
                                        {...register("prefecture_delivrance", {
                                            min: 1,
                                            max: 999,
                                            required: true,
                                        })}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Date d'expiration
                                        </span>
                                    </label>
                                    <input
                                        type="date"
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.date_expiration,
                                        })}
                                        aria-invalid={!!errors.date_expiration}
                                        {...register("date_expiration", {
                                            required: true,
                                            onChange: () => {
                                                // Si l'utilisateur modifie manuellement, on arrête l'auto-ajustement
                                                if (selectedId == null) {
                                                    expirationManuallyEditedRef.current = true;
                                                }
                                            },
                                        })}
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
                                        <option value="ras">RAS</option>
                                        <option value="perdu">Perdu</option>
                                        <option value="vole">Volé</option>
                                        <option value="detruit">Détruit</option>
                                        <option value="retention">Rétention</option>
                                        <option value="annulation">Annulation</option>
                                        <option value="invalidation">Invalidation</option>
                                        <option value="suspension">Suspension</option>
                                        <option value="autre">Autre</option>
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Validité</span>
                                    </label>
                                    <select
                                        className={clsx("select select-bordered", {
                                            "select-error": errors.validite,
                                        })}
                                        aria-invalid={!!errors.validite}
                                        {...register("validite", { required: true })}
                                    >
                                        <option value="">Sélectionner la validité</option>
                                        <option value="valide">Valide</option>
                                        <option value="invalide">Invalide</option>
                                    </select>
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Code de restriction
                                        </span>
                                    </label>
                                    <input
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.code_restriction,
                                        })}
                                        aria-invalid={!!errors.code_restriction}
                                        {...register("code_restriction")}
                                    />
                                </div>
                                {/* Probatoire */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end border border-base-content/10 p-3 rounded-lg md:col-span-2">
                                    <label className="flex items-center gap-2 h-full">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-primary"
                                            {...register("probatoire", {
                                                onChange: (e) => {
                                                    if (selectedId != null) return; // seulement en création
                                                    const checked = e?.target?.checked;
                                                    if (checked) {
                                                        if (
                                                            !probatoireManuallyEditedRef.current
                                                        ) {
                                                            const base =
                                                                getValues(
                                                                    "date_delivrance",
                                                                );
                                                            if (base) {
                                                                const end = addYears(
                                                                    base,
                                                                    3,
                                                                );
                                                                if (end) {
                                                                    setValue(
                                                                        "date_probatoire",
                                                                        end,
                                                                        {
                                                                            shouldDirty: true,
                                                                            shouldValidate: true,
                                                                        },
                                                                    );
                                                                }
                                                            }
                                                        }
                                                    } else {
                                                        // décoché: on efface la date et on réinitialise l'état manuel
                                                        probatoireManuallyEditedRef.current = false;
                                                        setValue("date_probatoire", "", {
                                                            shouldDirty: true,
                                                            shouldValidate: true,
                                                        });
                                                    }
                                                },
                                            })}
                                        />
                                        <span>Probatoire</span>
                                    </label>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">
                                                Date fin probatoire
                                            </span>
                                        </label>
                                        <input
                                            type="date"
                                            className="input input-bordered"
                                            disabled={!watch("probatoire")}
                                            {...register("date_probatoire", {
                                                onChange: () => {
                                                    if (selectedId == null) {
                                                        probatoireManuallyEditedRef.current = true;
                                                    }
                                                },
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Catégories (compact) */}
                            <div className="space-y-2">
                                <h3 className="font-semibold">Catégories</h3>
                                {(() => {
                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                                            {CAT_KEYS.map((k) => {
                                                const boolName = `cat_${k}`;
                                                const dateName = `cat_${k}_delivrance`;
                                                const checked = watch(boolName);
                                                const label = k.toUpperCase();
                                                return (
                                                    <label
                                                        key={k}
                                                        className="flex items-center justify-between gap-2 p-2 border border-base-content/10 rounded-md bg-base-100"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox checkbox-primary checkbox-sm"
                                                                {...register(boolName, {
                                                                    onChange: (e) => {
                                                                        const isChecked =
                                                                            e?.target
                                                                                ?.checked;
                                                                        if (
                                                                            selectedId ==
                                                                            null
                                                                        ) {
                                                                            if (
                                                                                isChecked
                                                                            ) {
                                                                                if (
                                                                                    !manualEditedCatDateRef
                                                                                        .current[
                                                                                        k
                                                                                    ]
                                                                                ) {
                                                                                    const base =
                                                                                        getValues(
                                                                                            "date_delivrance",
                                                                                        );
                                                                                    if (
                                                                                        base
                                                                                    ) {
                                                                                        setValue(
                                                                                            dateName,
                                                                                            base,
                                                                                            {
                                                                                                shouldDirty: true,
                                                                                                shouldValidate: true,
                                                                                            },
                                                                                        );
                                                                                    }
                                                                                }
                                                                            } else {
                                                                                // décoché: on efface la date et on réinitialise l'état manuel pour ce permis
                                                                                manualEditedCatDateRef.current[
                                                                                    k
                                                                                ] = false;
                                                                                setValue(
                                                                                    dateName,
                                                                                    "",
                                                                                    {
                                                                                        shouldDirty: true,
                                                                                        shouldValidate: true,
                                                                                    },
                                                                                );
                                                                            }
                                                                        }
                                                                    },
                                                                })}
                                                            />
                                                            <span className="text-sm">
                                                                {label}
                                                            </span>
                                                        </span>
                                                        <input
                                                            type="date"
                                                            className="input input-bordered input-sm"
                                                            disabled={!checked}
                                                            {...register(dateName, {
                                                                onChange: () => {
                                                                    if (
                                                                        selectedId == null
                                                                    ) {
                                                                        manualEditedCatDateRef.current[
                                                                            k
                                                                        ] = true;
                                                                    }
                                                                },
                                                            })}
                                                        />
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
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
                                                findPropLinkToFnpc(selectedFnpc)?.prenom,
                                            )}{" "}
                                            {findPropLinkToFnpc(
                                                selectedFnpc,
                                            )?.nom_famille?.[0]?.toUpperCase()}
                                            .
                                        </span>
                                    </p>
                                </div>
                            )}
                            {createError && (
                                <div className="badge badge-error mt-2">
                                    {createError}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </AdminAuthCheck>
    );
}

export default AdminFnpcPage;
