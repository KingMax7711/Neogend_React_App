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
import { Check, Lock, FileText, ShieldAlert, Car, Siren, ArchiveX } from "lucide-react";
import { useForm } from "react-hook-form";
import clsx from "clsx";

function VehiculeRecherche() {
    const { user, token } = useAuthStore();
    const [propList, setPropList] = useState([]);
    const [sivList, setSivList] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [resultList, setResultList] = useState({
        immatriculation: "",
        siv: [],
        foves: [],
    });
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [fileErrorMsg, setFileErrorMsg] = useState("");
    const firstPropLoadRef = useRef(true);
    const prevPropHashRef = useRef("");
    const firstSivLoadRef = useRef(true);
    const prevSivHashRef = useRef("");

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

    // Fetch SIV
    useEffect(() => {
        const accesGranted = ["opj", "apj", "apja"];
        const isGranted = accesGranted.includes(user?.rp_qualif);
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
                if (firstSivLoadRef.current) setLoading(true);
                setError("");
                const response = await axios.get(`${API}/public/siv/read/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!cancelled) {
                    const next = response.data || [];
                    const nextHash = stableHash(next);
                    if (nextHash !== prevSivHashRef.current) {
                        setSivList(next);
                        prevSivHashRef.current = nextHash;
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
                    firstSivLoadRef.current = false;
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

    // Normalisation helper: minuscules + suppression des accents + trim
    const norm = (str) =>
        (str || "")
            .toString()
            .trim()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase();

    // Normalisation immat: minuscules + sans accents + trim + retirer espaces/traits
    const normImmat = (str) => norm(str).replace(/[^a-z0-9]/g, "");

    const findPropById = (pid) => propList.find((p) => p.id === pid) || null;

    const findCoPropForSiv = (siv) =>
        siv?.co_prop_id ? findPropById(siv.co_prop_id) : null;

    const energiDic = {
        ac: "Air comprimé",
        ee: "Essence+élec (hyb. rechargeable)",
        eg: "Essence+GPL",
        eh: "Essence+élec (hyb. non rechargeable)",
        el: "Électricité",
        em: "Essence+GNV+élec (hyb. rechargeable)",
        en: "Essence+GNV",
        ep: "Essence+GNV+élec (hyb. non rechargeable)",
        eq: "Essence+GPL+élec (hyb. non rechargeable)",
        er: "Essence+GPL+élec (hyb. rechargeable)",
        es: "Essence",
        et: "Éthanol",
        fe: "Superéthanol",
        fg: "Superéthanol+GPL",
        fl: "Superéthanol+élec (hyb. rechargeable)",
        fn: "Superéthanol+GNV",
        ga: "Gazogène (*)",
        ge: "Gazogène+essence (*)",
        gf: "Gasoil+GNV (dual fuel)",
        gg: "Gazogène+gazole (*)",
        gh: "Gazole+élec (hyb. non rechargeable)",
        gl: "Gazole+élec (hyb. rechargeable)",
        gm: "Gazole+GNV+élec (hyb. rechargeable)",
        gn: "Gaz naturel",
        go: "Gazole / Diesel",
        gp: "GPL (Gaz de pétrole liquéfié)",
        gq: "Gazole+GNV+élec (hyb. non rechargeable)",
        gz: "Autres hydrocarbures gazeux",
        h2: "Hydrogène",
        ne: "GNV+élec (hyb. rechargeable)",
        nh: "GNV+élec (hyb. non rechargeable)",
        pe: "GPL+élec (hyb. rechargeable)",
        ph: "GPL+élec (hyb. non rechargeable)",
        pl: "Pétrole lampant",
    };

    const listeFichierConsultable = [
        { id: 1, nom: "SIV", consultable: true },
        { id: 2, nom: "FOVeS", consultable: false },
    ];

    const metaByName = {
        SIV: {
            icon: <Car size={20} />,
            subtitle: "Système d’Immatriculation des Véhicules",
            desc: "Immatriculations, caractéristiques et propriétaires.",
        },
        FOVeS: {
            icon: <ArchiveX size={20} />,
            subtitle: "Fichiers des Véhicules et Objets Signalés",
            desc: "Véhicules volés, objets signalés, etc.",
        },
    };

    const toggleFile = (fichier) => {
        if (!fichier?.consultable) {
            setFileErrorMsg("Ce fichier n'est pas consultable.");
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
        const accesGranted = ["opj", "apj", "apja"];
        const isGranted = accesGranted.includes(user?.rp_qualif);
        if (!isGranted) {
            fichier.consultable = false;
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

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: { immatriculation: "" },
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
            immatriculation: norm(values.immatriculation),
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
            siv: [],
            foves: [],
            immatriculation: payload.immatriculation,
        };

        if (payload.sources.includes("SIV")) {
            const target = normImmat(payload.immatriculation);
            const matched = (sivList || []).filter((siv) => {
                const immat = normImmat(siv?.ci_numero_immatriculation);
                return immat && target && immat === target;
            });
            nextResults.siv = matched;
        }
        if (payload.sources.includes("FOVeS")) {
            console.log("FOVeS search not implemented yet");
        }
        setResultList(nextResults);
    };

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

    const d1IsBeforeD2 = (d1, d2) => {
        if (!d1 || !d2) return false;
        return new Date(d1) < new Date(d2);
    };

    const resultSivCard = (siv) => {
        const owner = findPropById(siv.prop_id);
        const copro = findCoPropForSiv(siv);

        const fmt = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));

        return (
            <div className="card bg-base-100 border border-base-content/10 shadow-sm rounded-2xl">
                <div className="card-body p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="rounded-lg bg-primary/10 text-primary p-2">
                                <Car size={18} />
                            </span>
                            <div>
                                <h3 className="card-title text-lg leading-tight">
                                    {String(
                                        siv.ci_numero_immatriculation || "—",
                                    ).toUpperCase()}
                                </h3>
                                <p className="text-xs text-base-content/60">
                                    Enregistrement SIV #{fmt(siv?.id)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Propriétaires */}
                    <div className="mt-3 border border-base-content/10 rounded-xl p-3">
                        <h4 className="font-semibold mb-2">Propriétaires</h4>
                        {owner ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                                    <div>
                                        <span className="text-base-content/60">Nom</span>
                                        <div className="font-medium">
                                            {formatName(owner.prenom)}{" "}
                                            {owner.nom_famille?.toUpperCase()}
                                            {owner.nom_usage ? (
                                                <span className="text-base-content/60">
                                                    {" "}
                                                    (usage{" "}
                                                    {owner.nom_usage?.toUpperCase()})
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-base-content/60">
                                            Deuxième prénom
                                        </span>
                                        <div className="font-medium">
                                            {fmt(formatName(owner.second_prenom))}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-base-content/60">Sexe</span>
                                        <div className="font-medium">
                                            {fmt(owner.sexe) == "male"
                                                ? "Masculin"
                                                : "Féminin"}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-base-content/60">
                                            Date de naissance
                                        </span>
                                        <div className="font-medium">
                                            {fmtDate(owner.date_naissance)}
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-base-content/60">
                                            Lieu de naissance
                                        </span>
                                        <div className="font-medium">
                                            {fmt(formatName(owner.lieu_naissance))}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-base-content/60">
                                            Département de naissance
                                        </span>
                                        <div className="font-medium">
                                            {fmt(owner.departement_naissance_numero)}
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2 lg:col-span-3">
                                        <span className="text-base-content/60">
                                            Domicile
                                        </span>
                                        <div className="font-medium">
                                            {[
                                                owner.adresse_numero,
                                                formatName(owner.adresse_type_voie),
                                                formatName(owner.adresse_nom_voie),
                                            ]
                                                .filter(Boolean)
                                                .join(" ") || "—"}
                                            {", "}
                                            {owner.adresse_code_postal || ""}
                                            {owner.adresse_code_postal &&
                                            owner.adresse_commune
                                                ? " "
                                                : ""}
                                            {owner.adresse_commune.toUpperCase() || ""}
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-base-content/60 italic">
                                Aucun propriétaire lié (prop_id: {fmt(siv?.prop_id)})
                            </div>
                        )}
                    </div>
                    {/* Co-Propriétaires */}
                    <div className="mt-3 border border-base-content/10 rounded-xl p-3">
                        <h4 className="font-semibold text-sm mb-2">Copropriétaires</h4>
                        {copro ? (
                            <>
                                <span className="text-base-content/60">Nom</span>
                                <div className="font-medium">
                                    {formatName(copro.prenom)}{" "}
                                    {formatName(copro.nom_famille).toUpperCase()}
                                    {copro.nom_usage ? (
                                        <span className="text-base-content/60">
                                            {" "}
                                            (usage{" "}
                                            {formatName(copro.nom_usage).toUpperCase()})
                                        </span>
                                    ) : null}
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-base-content/60 italic">
                                Aucun
                            </div>
                        )}
                    </div>

                    {/* Certificat d'immatriculation */}
                    <div className="mt-4">
                        <div className="flex gap-2 items-center mb-2">
                            <h4 className="font-semibold text-sm">
                                Certificat d'immatriculation
                            </h4>
                            <span>
                                {siv.ci_etat_administratif && (
                                    <span
                                        className={clsx("badge badge-sm", {
                                            "badge-success":
                                                siv.ci_etat_administratif === "valide",
                                            "badge-warning":
                                                siv.ci_etat_administratif === "vole" ||
                                                siv.ci_etat_administratif === "perdu",
                                            "badge-error":
                                                siv.ci_etat_administratif === "vole" ||
                                                siv.ci_etat_administratif === "annule",
                                        })}
                                    >
                                        {String(siv.ci_etat_administratif).toUpperCase()}
                                    </span>
                                )}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="p-3 rounded-lg border border-base-content/10">
                                <div className="opacity-70 text-xs">
                                    Première mise en circ.
                                </div>
                                <div className="font-medium">
                                    {fmtDate(siv.ci_date_premiere_circulation)}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg border border-base-content/10">
                                <div className="opacity-70 text-xs">Date certificat</div>
                                <div className="font-medium">
                                    {fmtDate(siv.ci_date_certificat)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Véhicule */}
                    <div className="mt-4">
                        <div className="flex gap-2 items-center mb-2">
                            <h4 className="font-semibold text-sm">Véhicule</h4>
                            <span>
                                {siv.ci_etat_administratif && (
                                    <span
                                        className={clsx("badge badge-sm", {
                                            "badge-success":
                                                siv.vl_etat_administratif === "valide",
                                            "badge-warning":
                                                siv.vl_etat_administratif === "epave",
                                            "badge-error":
                                                siv.vl_etat_administratif === "saisi" ||
                                                siv.vl_etat_administratif ===
                                                    "fourriere" ||
                                                siv.vl_etat_administratif ===
                                                    "immobilise",
                                        })}
                                    >
                                        {String(siv.ci_etat_administratif).toUpperCase()}
                                    </span>
                                )}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
                            <div className="p-3 rounded-lg border border-base-content/10">
                                <div className="opacity-70 text-xs">Marque</div>
                                <div className="font-medium">
                                    {formatName(siv.vl_marque)}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg border border-base-content/10">
                                <div className="opacity-70 text-xs">
                                    Dénomination commerciale
                                </div>
                                <div className="font-medium">
                                    {formatName(siv.vl_denomination_commerciale)}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg border border-base-content/10">
                                <div className="opacity-70 text-xs">Version</div>
                                <div className="font-medium">
                                    {fmt(siv.vl_version).toUpperCase()}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg border border-base-content/10">
                                <div className="opacity-70 text-xs">Couleur</div>
                                <div className="font-medium">
                                    {formatName(siv.vl_couleur_dominante)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Caractéristiques techniques */}
                    <div className="mt-4">
                        <h4 className="font-semibold text-sm mb-2">
                            Caractéristiques techniques
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
                            <div className="p-3 rounded-lg border border-base-content/10">
                                <div className="opacity-70 text-xs">
                                    Puissance kW (ch)
                                </div>
                                <div className="font-medium">
                                    {fmt(siv.tech_puissance_kw) +
                                        " kW / " +
                                        fmt(siv.tech_puissance_ch) +
                                        " ch"}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg border border-base-content/10">
                                <div className="opacity-70 text-xs">
                                    Puissance fiscale
                                </div>
                                <div className="font-medium">
                                    {fmt(siv.tech_puissance_fiscale)}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg border border-base-content/10">
                                <div className="opacity-70 text-xs">Cylindrée (cm³)</div>
                                <div className="font-medium">
                                    {fmt(siv.tech_cylindree)}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg border border-base-content/10">
                                <div className="opacity-70 text-xs">Carburant</div>
                                <div className="font-medium">
                                    {fmt(siv.tech_carburant).toUpperCase() +
                                        " " +
                                        (energiDic[siv.tech_carburant] || "-")}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg border border-base-content/10">
                                <div className="opacity-70 text-xs">CO₂ (g/km)</div>
                                <div className="font-medium">
                                    {fmt(siv.tech_emissions_co2)}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg border border-base-content/10">
                                <div className="opacity-70 text-xs">
                                    Poids à vide (kg)
                                </div>
                                <div className="font-medium">
                                    {fmt(siv.tech_poids_vide)}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg border border-base-content/10">
                                <div className="opacity-70 text-xs">PTAC (kg)</div>
                                <div className="font-medium">
                                    {fmt(siv.tech_poids_ptac)}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg border border-base-content/10">
                                <div className="opacity-70 text-xs">
                                    Places (assis/debout)
                                </div>
                                <div className="font-medium">{`${fmt(
                                    siv.tech_places_assises,
                                )} / ${fmt(siv.tech_places_debout)}`}</div>
                            </div>
                        </div>
                    </div>

                    {/* Contrôle Technique & Assurance */}
                    <div className="mt-4">
                        <h4 className="font-semibold text-sm mb-2">
                            Contrôle Technique & Assurance
                        </h4>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div
                                className={
                                    "p-3 rounded-lg border border-base-content/10" +
                                    (d1IsBeforeD2(siv.ct_date_echeance, todayStr)
                                        ? " border-error bg-error/10"
                                        : "")
                                }
                            >
                                <div className="opacity-70 text-xs">
                                    Contrôle Technique - Échéance
                                </div>
                                <div className="font-medium">
                                    {fmtDate(siv.ct_date_echeance)}
                                </div>
                            </div>
                            <div
                                className={
                                    "p-3 rounded-lg border border-base-content/10" +
                                    (siv?.as_assureur ? "" : " border-error bg-error/10")
                                }
                            >
                                <div className="opacity-70 text-xs">Assurance</div>
                                <div className="font-medium">
                                    {siv?.as_assureur
                                        ? formatName(siv?.as_assureur).toUpperCase()
                                        : "Aucune Garantie au FVA"}
                                    {siv?.as_assureur
                                        ? " - " + fmtDate(siv?.as_date_contrat)
                                        : ""}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AuthCheck>
            <Renamer pageTitle="NEOFIC - Véhicules" />
            <div>
                <DefaultHeader />

                <section className="bg-base-200 p-6 rounded-3xl shadow-lg max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
                    <header className="mb-4">
                        <h1 className="text-2xl sm:text-3xl font-semibold">
                            1. Sélection des fichiers
                        </h1>
                        <p className="text-base-content/60 text-sm mt-1">
                            Choisissez les fichiers parmi lesquels effectuer la recherche
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
                            2. Informations du Véhicule
                        </h1>
                        <p className="text-base-content/60 text-sm mt-1">
                            Merci d'entrez les informations du véhicule, aucun champs ne
                            peux être laisser vide.
                        </p>
                    </header>
                    <form
                        onSubmit={handleSubmit(handleSearch)}
                        className="card bg-base-100 border border-base-content/10 rounded-2xl shadow-sm"
                    >
                        <div className="card-body">
                            <div className="">
                                {/* Prénom */}
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Immatriculation
                                        </span>
                                    </label>
                                    <br />
                                    <input
                                        className={`input input-bordered ${
                                            errors.immatriculation ? "input-error" : ""
                                        }`}
                                        aria-invalid={!!errors.immatriculation}
                                        placeholder="Ex: AB-123-CD"
                                        {...register("immatriculation", {
                                            required: "L'immatriculation est requise",
                                            pattern: {
                                                value: /^[a-zA-Z0-9\- ]+$/i,
                                                message: "Caractères non valides",
                                            },
                                        })}
                                    />
                                    <br />
                                    {errors.immatriculation && (
                                        <span className="text-error text-xs mt-1">
                                            {errors.immatriculation.message}
                                        </span>
                                    )}
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
                                {selectedFiles.includes("SIV") && (
                                    <div
                                        className={clsx(
                                            "collapse bg-base-100 border border-base-300",
                                            {
                                                "border-error bg-error/10": (
                                                    resultList.siv || []
                                                ).some(
                                                    (siv) =>
                                                        (siv?.ci_etat_administratif &&
                                                            siv.ci_etat_administratif !==
                                                                "valide") ||
                                                        (siv?.vl_etat_administratif &&
                                                            siv.vl_etat_administratif !==
                                                                "valide"),
                                                ),
                                            },
                                        )}
                                    >
                                        <input type="radio" name="resultAccordion" />
                                        <div className="collapse-title font-semibold">
                                            {"SIV - " +
                                                resultList.siv.length +
                                                " résultat(s) pour " +
                                                resultList.immatriculation.toUpperCase()}
                                        </div>
                                        <div className="collapse-content">
                                            <div className="flex flex-col gap-5 mt-2">
                                                {resultList.siv.length > 0 ? (
                                                    resultList.siv.map((siv) => (
                                                        <React.Fragment
                                                            key={`siv-${
                                                                siv?.id ?? Math.random()
                                                            }`}
                                                        >
                                                            {resultSivCard(siv)}
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

                                {selectedFiles.includes("FOVeS") && (
                                    <div
                                        className={clsx(
                                            "collapse bg-base-100 border border-base-300",
                                            {
                                                "border-error bg-error/10":
                                                    resultList.foves.length > 0,
                                            },
                                        )}
                                    >
                                        <input type="radio" name="resultAccordion" />
                                        <div className="collapse-title font-semibold">
                                            {"FOVeS - " +
                                                resultList.foves.length +
                                                " résultat(s) pour " +
                                                resultList.immatriculation.toUpperCase()}
                                        </div>
                                        <div className="collapse-content">
                                            <div className="flex flex-col gap-5 mt-2">
                                                {resultList.foves.length > 0 ? (
                                                    resultList.foves.map(
                                                        (foves) => "A venir",
                                                    )
                                                ) : (
                                                    <p className="text-sm text-base-content/70 italic">
                                                        Aucun résultat trouvé.
                                                    </p>
                                                )}
                                            </div>
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

export default VehiculeRecherche;
