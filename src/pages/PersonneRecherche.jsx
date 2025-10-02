/* eslint-disable no-unused-vars */
import React from "react";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import API from "../global/API.js";

import DefaultHeader from "../components/Header.jsx";
import AuthCheck from "../components/AuthCheck.jsx";
import Renamer from "../components/Renamer.jsx";
import formatName from "../tools/formatName.js";

import { useAuthStore } from "../stores/authStore.js";
import { Check, Lock, FileText, ShieldAlert, FileSearch, Siren } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import RHFDateText from "../components/RHFDateText";
import clsx from "clsx";

function PersonneRecherche() {
    const { user, token } = useAuthStore();
    const [fnpcList, setFnpcList] = useState([]);
    const [fprList, setFprList] = useState([]);
    const [propList, setPropList] = useState([]);
    const [infracList, setInfracList] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [resultList, setResultList] = useState({
        nom: "",
        prenom: "",
        fnpc: [],
        fpr: [],
        taj: [],
        fijait: [],
    });
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fileErrorMsg, setFileErrorMsg] = useState("");
    const firstFnpcLoadRef = useRef(true);
    const prevFnpcHashRef = useRef("");
    const firstPropLoadRef = useRef(true);
    const prevPropHashRef = useRef("");
    const firstInfracLoadRef = useRef(true);
    const prevInfracHashRef = useRef("");
    const firstFprLoadRef = useRef(true);
    const prevFprHashRef = useRef("");

    // Liste des enregistrements FNPC
    useEffect(() => {
        // Ne lance rien tant que le token n'est pas prêt ou que l'utilisateur n'est pas admin
        const accesGranted = ["opj", "apj", "apja"];
        const isGranted = accesGranted.includes(user?.rp_qualif);
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
                if (firstFnpcLoadRef.current) setLoading(true);
                setError("");
                const response = await axios.get(`${API}/public/fnpc/read/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!cancelled) {
                    const next = response.data || [];
                    const nextHash = stableHash(next);
                    if (nextHash !== prevFnpcHashRef.current) {
                        setFnpcList(next);
                        prevFnpcHashRef.current = nextHash;
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
                    firstFnpcLoadRef.current = false;
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

    // Liste des propriétaires
    useEffect(() => {
        // Ne lance rien tant que le token n'est pas prêt ou que l'utilisateur n'est pas admin
        const accesGranted = ["opj", "apj", "apja"];
        const isGranted = accesGranted.includes(user?.rp_qualif);
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
                const response = await axios.get(`${API}/public/proprietaires/read/`, {
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

    // Liste des infractions
    useEffect(() => {
        // Ne lance rien tant que le token n'est pas prêt ou que l'utilisateur n'est pas admin
        const accesGranted = ["opj", "apj", "apja"];
        const isGranted = accesGranted.includes(user?.rp_qualif);
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
                const response = await axios.get(`${API}/public/infractions/read/`, {
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

    // Liste des enregistrements FPR
    useEffect(() => {
        // Ne lance rien tant que le token n'est pas prêt ou que l'utilisateur n'est pas admin
        const accesGranted = ["opj", "apj", "apja"];
        const isGranted = accesGranted.includes(user?.rp_qualif);
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

    const findPropLinkToFnpc = (fnpc) => {
        const prop = propList.find((p) => p.id === fnpc.prop_id);
        return prop ? prop : null;
    };

    const findInfracLinkToFnpc = (fnpc) => {
        const infrac = infracList.filter((i) => i.neph === fnpc.neph);
        return infrac.length > 0 ? infrac : null;
    };

    const findPropLinkToFpr = (fpr) => {
        const prop = propList.find((p) => p.id === fpr.prop_id);
        return prop ? prop : null;
    };

    const translateMotifDBtoUser = (motif) => {
        const mapping = {
            al: "Aliéné",
            e: "Police Générale des Étrangers",
            it: "Interdiction de Territoire",
            m: "Mineur Fugueur",
            pj: "Recherche de Police Judiciaire",
            s: "Sûreté de l'État",
            v: "Évadé",
            x: "Personne Disparue",
            cj: "Contrôle Judiciaire",
            g: "Permis de Conduire",
        };

        return mapping[motif] || motif || "—";
    };

    // Normalisation helper: minuscules + suppression des accents + trim
    const norm = (str) =>
        (str || "")
            .toString()
            .trim()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase();

    const listeFichierConsultable = [
        { id: 1, nom: "FNPC", consultable: true },
        { id: 2, nom: "FPR", consultable: true },
        { id: 3, nom: "TAJ", consultable: false },
        { id: 4, nom: "FIJAIT", consultable: false },
    ];

    const metaByName = {
        FNPC: {
            icon: <FileText size={20} />,
            subtitle: "Permis et points",
            desc: "Données FNPC (permis, points, statut)",
        },
        FPR: {
            icon: <Siren size={20} />,
            subtitle: "Personnes recherchées",
            desc: "Signalements et mesures associées",
        },
        TAJ: {
            icon: <FileSearch size={20} />,
            subtitle: "Antécédents judiciaires",
            desc: "Faits et mentions judiciaires",
        },
        FIJAIT: {
            icon: <ShieldAlert size={20} />,
            subtitle: "Infractions terroristes",
            desc: "Consultation FIJAIT (OPJ Seulement)",
        },
    };

    const toggleFile = (fichier) => {
        if (!fichier?.consultable) {
            if (fichier.nom === "FIJAIT" && user?.rp_qualif !== "opj") {
                setFileErrorMsg(
                    "Vous n'êtes pas autorisé à consulter le FIJAIT. Référez-vous à votre supérieur.",
                );
            } else {
                setFileErrorMsg("Ce fichier n'est pas consultable.");
            }
            return;
        }
        setFileErrorMsg("");
        setHasSearched(false);
        setSelectedFiles((prev) =>
            prev.includes(fichier.nom)
                ? prev.filter((id) => id !== fichier.nom)
                : [...prev, fichier.nom],
        );
    };

    const FileCard = ({ fichier }) => {
        const isSelected = selectedFiles.includes(fichier.nom);
        const consultable = !!fichier.consultable;
        //Vérification que l'accès au fichier est autorisé pour le user
        if (fichier.nom === "FIJAIT") {
            const accesGranted = ["opj"];
            const isGranted = accesGranted.includes(user?.rp_qualif);
            if (!isGranted) {
                fichier.consultable = false;
            }
        } else {
            const accesGranted = ["opj", "apj", "apja"];
            const isGranted = accesGranted.includes(user?.rp_qualif);
            if (!isGranted) {
                fichier.consultable = false;
            }
        }
        const meta = metaByName[fichier.nom] || {
            icon: <FileText size={20} />,
            subtitle: "",
            desc: "",
        };

        return (
            <button
                type="button"
                onClick={() => toggleFile(fichier)}
                className={[
                    "card bg-base-100 border rounded-xl transition overflow-hidden text-left",
                    consultable
                        ? isSelected
                            ? "border-primary shadow-md ring-1 ring-primary/30 cursor-pointer"
                            : "border-base-content/10 hover:border-primary/40 hover:shadow-md cursor-pointer"
                        : "border-base-content/10 opacity-60 cursor-not-allowed",
                ].join(" ")}
            >
                <div className="card-body">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <span className="rounded-lg bg-primary/10 text-primary p-2">
                                {meta.icon}
                            </span>
                            <div>
                                <h3 className="card-title text-base leading-tight">
                                    {fichier.nom}
                                </h3>
                                {meta.subtitle && (
                                    <p className="text-xs text-base-content/60">
                                        {meta.subtitle}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="h-6">
                            {consultable ? (
                                isSelected ? (
                                    <span className="badge badge-primary gap-1">
                                        <Check size={14} /> Sélectionné
                                    </span>
                                ) : (
                                    <span className="badge">Disponible</span>
                                )
                            ) : (
                                <span className="badge badge-ghost gap-1">
                                    <Lock size={14} /> Indispo
                                </span>
                            )}
                        </div>
                    </div>
                    {meta.desc && (
                        <p className="text-sm text-base-content/70 mt-2">{meta.desc}</p>
                    )}
                </div>
            </button>
        );
    };

    const resultFnpcCard = (fnpc) => {
        const prop = findPropLinkToFnpc(fnpc);
        const infrac = findInfracLinkToFnpc(fnpc);

        const fmt = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));
        const fmtDate = (d) => {
            if (!d) return "—";
            try {
                // Affichage local FR, fallback brut si invalide
                const dt = new Date(d);
                return isNaN(dt.getTime()) ? fmt(d) : dt.toLocaleDateString("fr-FR");
            } catch {
                return fmt(d);
            }
        };

        const catDefs = [
            { key: "cat_am", dateKey: "cat_am_delivrance", label: "AM" },
            { key: "cat_a1", dateKey: "cat_a1_delivrance", label: "A1" },
            { key: "cat_a2", dateKey: "cat_a2_delivrance", label: "A2" },
            { key: "cat_a", dateKey: "cat_a_delivrance", label: "A" },
            { key: "cat_b1", dateKey: "cat_b1_delivrance", label: "B1" },
            { key: "cat_b", dateKey: "cat_b_delivrance", label: "B" },
            { key: "cat_c1", dateKey: "cat_c1_delivrance", label: "C1" },
            { key: "cat_c", dateKey: "cat_c_delivrance", label: "C" },
            { key: "cat_d1", dateKey: "cat_d1_delivrance", label: "D1" },
            { key: "cat_d", dateKey: "cat_d_delivrance", label: "D" },
            { key: "cat_be", dateKey: "cat_be_delivrance", label: "BE" },
            { key: "cat_c1e", dateKey: "cat_c1e_delivrance", label: "C1E" },
            { key: "cat_ce", dateKey: "cat_ce_delivrance", label: "CE" },
            { key: "cat_d1e", dateKey: "cat_d1e_delivrance", label: "D1E" },
            { key: "cat_de", dateKey: "cat_de_delivrance", label: "DE" },
        ];

        return (
            <div
                className={clsx(
                    "card bg-base-100 border border-base-content/10 rounded-2xl shadow-sm",
                )}
            >
                <div className="card-body">
                    {/* En-tête */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="rounded-lg bg-primary/10 text-primary p-2">
                                <FileText size={20} />
                            </span>
                            <div>
                                <h3 className="card-title text-lg leading-tight">
                                    Permis de conduire
                                </h3>
                                <p className="text-xs text-base-content/60">
                                    Enregistrement FNPC #{fmt(fnpc?.id)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center flex-wrap gap-2">
                            <span className="badge badge-outline">
                                NEPH:{" "}
                                {fmt(fnpc?.neph)
                                    ? fmt(fnpc?.neph).slice(0, 6) +
                                      " " +
                                      fmt(fnpc?.neph).slice(6)
                                    : "—"}
                            </span>
                            <span className="badge">Solde: {fmt(fnpc?.points)}</span>
                            <span
                                className={clsx("badge", {
                                    "badge-info": fmt(fnpc?.statut) == "ras",
                                    "badge-warning": fmt(fnpc?.statut) != "ras",
                                })}
                            >
                                Statut:{" "}
                                {fmt(fnpc?.statut) == "ras"
                                    ? "R.A.S"
                                    : fmt(fnpc?.statut) == "perdu"
                                    ? "Perdu"
                                    : fmt(fnpc?.statut) == "vole"
                                    ? "Volé"
                                    : fmt(fnpc?.statut) == "detruit"
                                    ? "Détruit"
                                    : fmt(fnpc?.statut) == "autre"
                                    ? "Autre"
                                    : fmt(fnpc?.statut) == "annulation"
                                    ? "Annulation"
                                    : fmt(fnpc?.statut) == "invalidation"
                                    ? "Invalidation"
                                    : fmt(fnpc?.statut) == "suspension"
                                    ? "Suspension"
                                    : fmt(fnpc?.statut) == "retention"
                                    ? "Retention"
                                    : "—"}
                            </span>
                        </div>
                    </div>

                    {/* Propriétaire */}
                    <div className="mt-3 border border-base-content/10 rounded-xl p-3">
                        <h4 className="font-semibold mb-2">Titulaire</h4>
                        {prop ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                                <div>
                                    <span className="text-base-content/60">Nom</span>
                                    <div className="font-medium">
                                        {formatName(prop.prenom)}{" "}
                                        {prop.nom_famille?.toUpperCase()}
                                        {prop.nom_usage ? (
                                            <span className="text-base-content/60">
                                                {" "}
                                                (usage {prop.nom_usage?.toUpperCase()})
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-base-content/60">
                                        Deuxième prénom
                                    </span>
                                    <div className="font-medium">
                                        {fmt(formatName(prop.second_prenom))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-base-content/60">Sexe</span>
                                    <div className="font-medium">
                                        {fmt(prop.sexe) == "male"
                                            ? "Masculin"
                                            : "Féminin"}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-base-content/60">
                                        Date de naissance
                                    </span>
                                    <div className="font-medium">
                                        {fmtDate(prop.date_naissance)}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-base-content/60">
                                        Lieu de naissance
                                    </span>
                                    <div className="font-medium">
                                        {fmt(formatName(prop.lieu_naissance))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-base-content/60">
                                        Département de naissance
                                    </span>
                                    <div className="font-medium">
                                        {fmt(prop.departement_naissance_numero)}
                                    </div>
                                </div>
                                <div className="sm:col-span-2 lg:col-span-3">
                                    <span className="text-base-content/60">Domicile</span>
                                    <div className="font-medium">
                                        {[
                                            prop.adresse_numero,
                                            formatName(prop.adresse_type_voie),
                                            formatName(prop.adresse_nom_voie),
                                        ]
                                            .filter(Boolean)
                                            .join(" ") || "—"}
                                        {", "}
                                        {prop.adresse_code_postal || ""}
                                        {prop.adresse_code_postal && prop.adresse_commune
                                            ? " "
                                            : ""}
                                        {prop.adresse_commune.toUpperCase() || ""}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-base-content/60 italic">
                                Aucun propriétaire lié (prop_id: {fmt(fnpc?.prop_id)})
                            </div>
                        )}
                    </div>

                    {/* Informations du titre */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="border border-base-content/10 rounded-xl p-3">
                            <div className="text-base-content/60">Numéro de titre</div>
                            <div className="font-medium">{fmt(fnpc?.numero_titre)}</div>
                        </div>
                        <div className="border border-base-content/10 rounded-xl p-3">
                            <div className="text-base-content/60">
                                Préfecture de délivrance
                            </div>
                            <div className="font-medium">
                                {fmt(fnpc?.prefecture_delivrance)}
                            </div>
                        </div>
                        <div className="border border-base-content/10 rounded-xl p-3">
                            <div className="text-base-content/60">Date de délivrance</div>
                            <div className="font-medium">
                                {fmtDate(fnpc?.date_delivrance)}
                            </div>
                        </div>
                        <div className="border border-base-content/10 rounded-xl p-3">
                            <div className="text-base-content/60">Date d'expiration</div>
                            <div className="font-medium">
                                {fmtDate(fnpc?.date_expiration)}
                            </div>
                        </div>
                    </div>

                    {/* Probatoire / Code de restriction */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="border border-base-content/10 rounded-xl p-3">
                            <div className="text-base-content/60 mb-1">Probatoire</div>
                            {fnpc?.probatoire ? (
                                <div className="flex items-center gap-2">
                                    <span className="badge badge-warning gap-1">
                                        <Check size={14} /> Oui
                                    </span>
                                    <span className="text-base-content/60">jusqu'au</span>
                                    <span className="font-medium">
                                        {fmtDate(fnpc?.date_probatoire)}
                                    </span>
                                </div>
                            ) : (
                                <span className="badge badge-ghost">Non</span>
                            )}
                        </div>
                        <div className="border border-base-content/10 rounded-xl p-3">
                            <div className="text-base-content/60">
                                Code de restriction
                            </div>
                            <div className="font-medium">
                                {fmt(fnpc?.code_restriction)}
                            </div>
                        </div>
                    </div>
                    {/* Catégories */}
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Catégories</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                            {catDefs.map((c) => {
                                const enabled = !!fnpc?.[c.key];
                                const date = fnpc?.[c.dateKey];
                                return (
                                    <div
                                        key={c.key}
                                        className={[
                                            "border rounded-lg p-2 text-sm",
                                            enabled
                                                ? "border-primary/40 bg-primary/5"
                                                : "hidden",
                                        ].join(" ")}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">
                                                {c.label}
                                            </span>
                                            {enabled ? (
                                                <span className="badge badge-primary badge-sm gap-1">
                                                    <Check size={12} /> OK
                                                </span>
                                            ) : (
                                                <span className="badge badge-ghost badge-sm">
                                                    —
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-1 text-xs text-base-content/70">
                                            {enabled ? (
                                                <span>Délivrance: {fmtDate(date)}</span>
                                            ) : (
                                                <span>Non détenue</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* Infractions */}
                    {infrac && infrac.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-semibold mb-2">Infractions liées</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                {(infrac || []).map((inf) => {
                                    const statut = (inf?.statut || "")
                                        .toString()
                                        .toLowerCase();
                                    const statutBadge =
                                        statut === "en_cours"
                                            ? "badge-info"
                                            : statut === "paye" || statut === "classe"
                                            ? "badge-success"
                                            : statut === "sans_suite" ||
                                              statut === "annulee"
                                            ? "badge-neutral"
                                            : statut === "non_classe" ||
                                              statut === "a_traiter"
                                            ? "badge-warning"
                                            : "badge-ghost";

                                    const pts = inf?.points ?? null;

                                    return (
                                        <div
                                            key={inf.id}
                                            className={clsx(
                                                "card bg-base-100 border border-primary/20 rounded-xl shadow-sm hover:shadow-md transition",
                                            )}
                                        >
                                            <div className="card-body p-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="rounded-lg bg-primary/10 text-primary p-2 shrink-0">
                                                            <ShieldAlert size={18} />
                                                        </span>
                                                        <div className="min-w-0">
                                                            <div className="font-semibold leading-tight truncate">
                                                                NATINF {fmt(inf?.natinf)}
                                                            </div>
                                                            <div className="text-xs text-base-content/60 truncate">
                                                                Article{" "}
                                                                {fmt(inf?.article)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="flex flex-wrap justify-end gap-1">
                                                            <span className="badge badge-outline">
                                                                Classe {fmt(inf?.classe)}
                                                            </span>
                                                            <span className="badge badge-warning">
                                                                {fmt(pts)} pt
                                                                {pts === 1 ? "" : "s"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-2 text-xs text-base-content/60">
                                                    Agent Numéro:{" "}
                                                    <span className="font-medium text-base-content">
                                                        {fmt(inf?.nipol)}
                                                    </span>
                                                    <br />
                                                    Date:{" "}
                                                    <span className="font-medium text-base-content">
                                                        {fmtDate(inf?.date_infraction)}
                                                    </span>
                                                </div>

                                                <div className="mt-1 text-sm line-clamp-2 italic">
                                                    {inf.details
                                                        ? inf.details
                                                        : "Aucun Détails supplémentaire"}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const resultFprCard = (fpr) => {
        // Note: inversion back prop_id/id_prop côté FPR
        const prop = findPropLinkToFpr(fpr);

        const fmt = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));
        const fmtName = (v) =>
            v === null || v === undefined || v === "" ? "—" : formatName(v);
        const fmtDate = (d) => {
            if (!d) return "—";
            try {
                const dt = new Date(d);
                return isNaN(dt.getTime()) ? fmt(d) : dt.toLocaleDateString("fr-FR");
            } catch {
                return fmt(d);
            }
        };
        const fmtDangerosite = (d) => {
            if (!d) return "—";
            switch (d.toString().toLowerCase()) {
                case "faible":
                    return "Individu ne représentant aucun risque";
                case "moyenne":
                    return "Individu pouvant représenter un risque";
                case "forte":
                    return "Individu représentant un risque élevé";
                case "vulnerable":
                    return "Individu vulnérable, pouvant représenter un risque pour lui même";
                default:
                    return d;
            }
        };

        const fmtExactitude = (d) => {
            if (!d) return "—";
            switch (d.toString().toLowerCase()) {
                case "confirmer":
                    return "Confirmé";
                case "non_confirmer":
                    return "Non Confirmée";
                case "usurper":
                    return "Usurpée";
                case "surnom":
                    return "Surnom";
                default:
                    return d;
            }
        };

        return (
            <div className="card bg-base-100 border border-base-content/10 rounded-2xl shadow-sm">
                <div className="card-body">
                    {/* En-tête */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="rounded-lg bg-primary/10 text-primary p-2">
                                <Siren size={20} />
                            </span>
                            <div>
                                <h3 className="card-title text-lg leading-tight">
                                    FPR - Personne recherchée
                                </h3>
                                <p className="text-xs text-base-content/60">
                                    Enregistrement FPR #{fmt(fpr?.id)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center flex-wrap gap-2">
                            <span className="badge badge-outline">
                                Identité: {fmtExactitude(fpr?.exactitude)}{" "}
                                {/*TODO Reformuler */}
                            </span>
                            <span className="badge badge-ghost">
                                NEPH:{" "}
                                {fmt(fpr?.neph).slice(0, 6) +
                                    " " +
                                    fmt(fpr?.neph).slice(6)}
                            </span>
                            <span className="badge">
                                N° FIJAIT: {fmt(fpr?.num_fijait)}
                            </span>
                        </div>
                    </div>

                    {/* Propriétaire */}
                    <div className="mt-3 border border-base-content/10 rounded-xl p-3">
                        <h4 className="font-semibold mb-2">Identité</h4>
                        {prop ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                                <div>
                                    <span className="text-base-content/60">Nom</span>
                                    <div className="font-medium">
                                        {formatName(prop.prenom)}{" "}
                                        {prop.nom_famille?.toUpperCase()}
                                        {prop.nom_usage ? (
                                            <span className="text-base-content/60">
                                                {" "}
                                                (usage {prop.nom_usage?.toUpperCase()})
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-base-content/60">
                                        Deuxième prénom
                                    </span>
                                    <div className="font-medium">
                                        {formatName(prop.second_prenom) || "—"}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-base-content/60">
                                        Date de naissance
                                    </span>
                                    <div className="font-medium">
                                        {fmtDate(prop.date_naissance)}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-base-content/60">Sexe</span>
                                    <div className="font-medium">
                                        {prop.sexe === "male"
                                            ? "Masculin"
                                            : prop.sexe
                                            ? "Féminin"
                                            : "—"}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-base-content/60">
                                        Lieu de naissance
                                    </span>
                                    <div className="font-medium">
                                        {formatName(prop.lieu_naissance) || "—"}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-base-content/60">
                                        Département naissance
                                    </span>
                                    <div className="font-medium">
                                        {fmt(prop.departement_naissance_numero)}
                                    </div>
                                </div>
                                <div className="sm:col-span-2 lg:col-span-3">
                                    <span className="text-base-content/60">Adresse</span>
                                    <div className="font-medium">
                                        {[
                                            prop.adresse_numero,
                                            formatName(prop.adresse_type_voie),
                                            formatName(prop.adresse_nom_voie),
                                        ]
                                            .filter(Boolean)
                                            .join(" ") || "—"}
                                        {", "}
                                        {prop.adresse_code_postal || ""}
                                        {prop.adresse_code_postal && prop.adresse_commune
                                            ? " "
                                            : ""}
                                        {prop.adresse_commune.toUpperCase() || ""}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-base-content/60 italic">
                                Aucun propriétaire lié (id_prop: {fmt(fpr?.id_prop)})
                            </div>
                        )}
                    </div>

                    {/* Informations d'enregistrement */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="border border-base-content/10 rounded-xl p-3">
                            <div className="text-base-content/60">
                                Date d'enregistrement
                            </div>
                            <div className="font-medium">
                                {fmtDate(fpr?.date_enregistrement)}
                            </div>
                        </div>
                        <div className="border border-base-content/10 rounded-xl p-3">
                            <div className="text-base-content/60">Motif</div>
                            <div className="font-medium">
                                {fmt(fpr?.motif_enregistrement).toUpperCase()}
                                {" / ("}
                                {translateMotifDBtoUser(fpr?.motif_enregistrement)}
                                {")"}
                            </div>
                        </div>
                        <div className="border border-base-content/10 rounded-xl p-3">
                            <div className="text-base-content/60">Autorité</div>
                            <div className="font-medium">
                                {fmt(fpr?.autorite_enregistrement).toUpperCase()}
                            </div>
                        </div>
                        <div className="border border-base-content/10 rounded-xl p-3">
                            <div className="text-base-content/60">Lieu des faits</div>
                            <div className="font-medium">
                                {fmt(fpr?.lieu_faits).toUpperCase()}
                            </div>
                        </div>
                        <div className="border border-base-content/10 rounded-xl p-3 lg:col-span-2">
                            <div className="text-base-content/60 ">Dangerosité</div>
                            <div className="font-medium">
                                {fmtDangerosite(fpr?.dangerosite)}
                            </div>
                        </div>
                        <div className="border border-base-content/10 rounded-xl p-3 lg:col-span-2">
                            <div className="text-base-content/60">Conduite</div>
                            <div className="font-medium">{fmt(fpr?.conduite)}</div>
                        </div>
                    </div>

                    {/* Détails / Signes */}
                    {(fpr?.signes_distinctifs || fpr?.details) && (
                        <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm">
                            {fpr?.signes_distinctifs && (
                                <div className="border border-base-content/10 rounded-xl p-3">
                                    <div className="text-base-content/60">
                                        Signes distinctifs
                                    </div>
                                    <div className="mt-1 whitespace-pre-wrap italic">
                                        {fpr.signes_distinctifs}
                                    </div>
                                </div>
                            )}
                            {fpr?.details && (
                                <div className="border border-base-content/10 rounded-xl p-3">
                                    <div className="text-base-content/60">
                                        Information Diverses
                                    </div>
                                    <div className="mt-1 whitespace-pre-wrap italic">
                                        {fpr.details}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const {
        register,
        handleSubmit,
        watch,
        reset,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: { prenom: "", nom: "", date_naissance: "" },
        mode: "onTouched",
    });

    const todayStr = new Date().toISOString().split("T")[0];

    const handleResetSearch = () => {
        reset();
        setResultList(null);
        setHasSearched(false);
    };

    const handleSearch = async (values) => {
        const payload = {
            prenom: norm(values.prenom),
            nom: norm(values.nom),
            date_naissance: values.date_naissance || null,
            sources: [...selectedFiles],
        };
        if (selectedFiles.length === 0) {
            setError("Veuillez sélectionner au moins un fichier.");
            return;
        }
        setError("");
        setHasSearched(true);

        // Réinitialiser les résultats
        const nextResults = {
            fnpc: [],
            fpr: [],
            taj: [],
            fijait: [],
            nom: payload.nom,
            prenom: payload.prenom,
        };

        if (payload.sources.includes("FNPC")) {
            const matchedFnpc = fnpcList.filter((fnpc) => {
                const prop = findPropLinkToFnpc(fnpc);
                return (
                    prop &&
                    norm(prop.prenom) === payload.prenom &&
                    (norm(prop.nom_famille) === payload.nom ||
                        norm(prop.nom_usage) === payload.nom) &&
                    (prop.date_naissance || null) === payload.date_naissance
                );
            });
            nextResults.fnpc = matchedFnpc;
        }
        if (payload.sources.includes("FPR")) {
            const matchedFpr = fprList.filter((fpr) => {
                const prop = findPropLinkToFpr(fpr);
                return (
                    prop &&
                    norm(prop.prenom) === payload.prenom &&
                    (norm(prop.nom_famille) === payload.nom ||
                        norm(prop.nom_usage) === payload.nom) &&
                    (prop.date_naissance || null) === payload.date_naissance
                );
            });
            nextResults.fpr = matchedFpr;
        }
        // TODO: ajouter les recherches TAJ/FIJAIT quand disponibles

        setResultList(nextResults);
    };

    return (
        <AuthCheck>
            <Renamer pageTitle="NEOFIC - Personnes" />
            <div>
                <DefaultHeader />

                <section className="bg-base-200 p-6 rounded-3xl shadow-lg max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
                    <header className="mb-4">
                        <h1 className="text-2xl sm:text-3xl font-semibold">
                            1. Sélection des fichiers
                        </h1>
                        <p className="text-base-content/60 text-sm mt-1">
                            Choisissez les fichiers parmis lesquels effectuer la recherche
                        </p>
                    </header>
                    {!["opj", "apj", "apja"].includes(user?.rp_qualif) && (
                        <div className="alert alert-error mb-3">
                            <span>
                                Vous ne semblez pas posséder les autorisations nécessaires
                                pour consulter les fichiers. Référez-vous à votre
                                supérieur.
                            </span>
                        </div>
                    )}

                    {fileErrorMsg && (
                        <div className="alert alert-warning mb-3">
                            <span>{fileErrorMsg}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        {listeFichierConsultable.map((f) => (
                            <FileCard key={f.id} fichier={f} />
                        ))}
                    </div>
                </section>
                <section className="bg-base-200 p-6 rounded-3xl shadow-lg max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
                    <header className="mb-4">
                        <h1 className="text-2xl sm:text-3xl font-semibold">
                            2. Informations de l'Individu
                        </h1>
                        <p className="text-base-content/60 text-sm mt-1">
                            Merci d'entrez les informations de l'individu, aucun champs ne
                            peux être laisser vide.
                        </p>
                    </header>
                    <form
                        onSubmit={handleSubmit(handleSearch)}
                        className="card bg-base-100 border border-base-content/10 rounded-2xl shadow-sm"
                    >
                        <div className="card-body">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Prénom */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Prénom</span>
                                    </label>
                                    <input
                                        className={`input input-bordered ${
                                            errors.prenom ? "input-error" : ""
                                        }`}
                                        aria-invalid={!!errors.prenom}
                                        placeholder="Ex: maxime"
                                        {...register("prenom", {
                                            required: "Le prénom est requis",
                                            minLength: {
                                                value: 2,
                                                message: "Au moins 2 caractères",
                                            },
                                            pattern: {
                                                value: /^[A-Za-zÀ-ÖØ-öø-ÿ'\-\s]+$/,
                                                message: "Caractères non valides",
                                            },
                                        })}
                                    />
                                    <br />
                                    {errors.prenom && (
                                        <span className="text-error text-xs mt-1">
                                            {errors.prenom.message}
                                        </span>
                                    )}
                                </div>

                                {/* Nom */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Nom</span>
                                    </label>
                                    <input
                                        className={`input input-bordered ${
                                            errors.nom ? "input-error" : ""
                                        }`}
                                        aria-invalid={!!errors.nom}
                                        placeholder="Ex: courtois"
                                        {...register("nom", {
                                            required: "Le nom est requis",
                                            minLength: {
                                                value: 2,
                                                message: "Au moins 2 caractères",
                                            },
                                            pattern: {
                                                value: /^[A-Za-zÀ-ÖØ-öø-ÿ'\-\s]+$/,
                                                message: "Caractères non valides",
                                            },
                                        })}
                                    />
                                    <br />
                                    {errors.nom && (
                                        <span className="text-error text-xs mt-1">
                                            {errors.nom.message}
                                        </span>
                                    )}
                                </div>

                                {/* Date de naissance (champ texte masqué) */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Date de naissance
                                        </span>
                                    </label>
                                    <RHFDateText
                                        control={control}
                                        name="date_naissance"
                                        rules={{
                                            required: "La date de naissance est requise",
                                            validate: (v) =>
                                                !v ||
                                                v <= todayStr ||
                                                "La date ne peut pas être dans le futur",
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                <div className="text-xs text-base-content/60">
                                    {selectedFiles.length > 0 ? (
                                        <span>
                                            {selectedFiles.length} fichier(s)
                                            sélectionné(s)
                                        </span>
                                    ) : (
                                        <span className="italic">
                                            Sélectionnez au moins un fichier au-dessus
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => handleResetSearch()}
                                    >
                                        Réinitialiser
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                            isSubmitting || selectedFiles.length === 0
                                        }
                                    >
                                        {isSubmitting ? "Recherche..." : "Rechercher"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </section>
                <section className="bg-base-200 p-6 rounded-3xl shadow-lg max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-6 mb-12">
                    <header className="mb-4">
                        <h1 className="text-2xl sm:text-3xl font-semibold">
                            3. Résultats de la recherche
                        </h1>
                        <p className="text-base-content/60 text-sm mt-1">
                            {hasSearched
                                ? "Voici les résultats de votre recherche"
                                : "Les résultats s'afficheront ici après une recherche"}
                        </p>
                    </header>
                    <div>
                        {hasSearched && (
                            <div className="flex flex-col gap-3">
                                {selectedFiles.includes("FNPC") && (
                                    <div
                                        className={clsx(
                                            "collapse bg-base-100 border border-base-300",
                                            {
                                                "border-error bg-error/10": (
                                                    resultList.fnpc || []
                                                ).some(
                                                    (fnpc) =>
                                                        fnpc?.validite === "invalide",
                                                ),
                                            },
                                        )}
                                    >
                                        <input type="radio" name="resultAccordion" />
                                        <div className="collapse-title font-semibold">
                                            {"FNPC - " +
                                                resultList.fnpc.length +
                                                " résultat(s) pour " +
                                                (formatName(resultList.prenom) || "") +
                                                " " +
                                                (formatName(
                                                    resultList.nom,
                                                ).toUpperCase() || "")}
                                        </div>
                                        <div className="collapse-content">
                                            <div className="flex flex-col gap-5 mt-2">
                                                {resultList.fnpc.length > 0 ? (
                                                    resultList.fnpc.map((fnpc) => (
                                                        <React.Fragment
                                                            key={`fnpc-${
                                                                fnpc?.neph ??
                                                                Math.random()
                                                            }`}
                                                        >
                                                            {resultFnpcCard(fnpc)}
                                                        </React.Fragment>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-base-content/70 italic">
                                                        Aucun résultat trouvé.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedFiles.includes("FPR") && (
                                    <div
                                        className={clsx(
                                            "collapse bg-base-100 border border-base-300",
                                            {
                                                "border-error bg-error/10":
                                                    resultList.fpr.length > 0,
                                            },
                                        )}
                                    >
                                        <input type="radio" name="resultAccordion" />
                                        <div className="collapse-title font-semibold">
                                            {"FPR - " +
                                                resultList.fpr.length +
                                                " résultat(s) pour " +
                                                (formatName(resultList.prenom) || "") +
                                                " " +
                                                (formatName(
                                                    resultList.nom,
                                                ).toUpperCase() || "")}
                                        </div>
                                        <div className="collapse-content">
                                            <div className="flex flex-col gap-5 mt-2">
                                                {resultList.fpr.length > 0 ? (
                                                    resultList.fpr.map((fpr) => (
                                                        <React.Fragment
                                                            key={`fpr-${
                                                                fpr?.id ?? Math.random()
                                                            }`}
                                                        >
                                                            {resultFprCard(fpr)}
                                                        </React.Fragment>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-base-content/70 italic">
                                                        Aucun résultat trouvé.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedFiles.includes("TAJ") && (
                                    <div className="collapse bg-base-100 border border-base-300">
                                        <input type="radio" name="resultAccordion" />
                                        <div className="collapse-title font-semibold">
                                            {"TAJ - " +
                                                resultList.taj.length +
                                                " résultat(s) pour " +
                                                (formatName(resultList.prenom) || "") +
                                                " " +
                                                (formatName(
                                                    resultList.nom,
                                                ).toUpperCase() || "")}
                                        </div>
                                        <div className="collapse-content text-sm">
                                            Go to "My Account" settings and select "Edit
                                            Profile" to make changes.
                                        </div>
                                    </div>
                                )}
                                {selectedFiles.includes("FIJAIT") && (
                                    <div className="collapse bg-base-100 border border-base-300">
                                        <input type="radio" name="resultAccordion" />
                                        <div className="collapse-title font-semibold">
                                            {"FIJAIT - " +
                                                resultList.fijait.length +
                                                " résultat(s) pour " +
                                                (formatName(resultList.prenom) || "") +
                                                " " +
                                                (formatName(
                                                    resultList.nom,
                                                ).toUpperCase() || "")}
                                        </div>
                                        <div className="collapse-content text-sm">
                                            Go to "My Account" settings and select "Edit
                                            Profile" to make changes.
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </AuthCheck>
    );
}

export default PersonneRecherche;
