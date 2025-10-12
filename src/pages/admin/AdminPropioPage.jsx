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

function AdminPropioPage() {
    const { user, token } = useAuthStore();
    const [propList, setPropList] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const firstLoadRef = useRef(true);
    const prevHashRef = useRef("");

    // eslint-disable-next-line no-unused-vars
    const scrollYRef = useRef(0);

    const handleSelect = (id) => {
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
                if (firstLoadRef.current) setLoading(true);
                setError("");
                const response = await axios.get(`${API}/proprietaires/read/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!cancelled) {
                    const next = response.data || [];
                    const nextHash = stableHash(next);
                    if (nextHash !== prevHashRef.current) {
                        setPropList(next);
                        prevHashRef.current = nextHash;
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
                    firstLoadRef.current = false;
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
        if (selectedId != null && !propList.some((p) => p.id === selectedId)) {
            setSelectedId(null);
        }
    }, [propList, selectedId]);

    const selectedProp = useMemo(
        () => propList.find((p) => p.id === selectedId) ?? null,
        [propList, selectedId],
    );

    // Helper pour éviter d’injecter "null" (string) ou valeurs nulles dans les inputs
    const normalize = (v) => {
        if (v == null) return "";
        if (typeof v === "string") {
            const s = v.trim();
            const low = s.toLowerCase();
            if (!s || low === "null" || low === "undefined") return "";
            return s;
        }
        return String(v);
    };
    // Met toutes les valeurs string en minuscules avant envoi API
    const toLowercasePayload = (obj) => {
        const out = {};
        for (const [k, v] of Object.entries(obj || {})) {
            out[k] = typeof v === "string" ? v.toLowerCase() : v;
        }
        return out;
    };

    const TableRow = ({ prop }) => {
        return (
            <tr key={prop.id} className="text-center">
                <td>{prop.id}</td>
                <td>{prop.nom_famille != "" ? formatName(prop.nom_famille) : "N/A"}</td>
                <td>{prop.nom_usage != "" ? formatName(prop.nom_usage) : "N/A"}</td>
                <td>{prop.prenom != "" ? formatName(prop.prenom) : "N/A"}</td>
                <td>
                    {prop.second_prenom != "" ? formatName(prop.second_prenom) : "N/A"}
                </td>
                <td>
                    {prop.date_naissance != ""
                        ? dbDateToFront(prop.date_naissance)
                        : "N/A"}
                </td>
                <td>{prop.sexe != "" ? (prop.sexe == "male" ? "H" : "F") : "N/A"}</td>
                <td>
                    {prop.lieu_naissance != "" && prop.departement_naissance_numero != ""
                        ? formatName(prop.lieu_naissance) +
                          " (" +
                          prop.departement_naissance_numero +
                          ")"
                        : "N/A"}
                </td>
                <td className="whitespace-pre-line">
                    {prop.adresse_numero +
                        " " +
                        formatName(prop.adresse_type_voie) +
                        " " +
                        formatName(prop.adresse_nom_voie) +
                        " \n" +
                        prop.adresse_code_postal +
                        ", " +
                        formatName(prop.adresse_commune)}
                </td>
                <td>
                    <input
                        type="radio"
                        className="radio radio-primary"
                        name="edit"
                        value={prop.id}
                        checked={selectedId === prop.id}
                        onMouseDown={(e) => e.preventDefault()} // évite le focus qui scroll
                        onChange={() => handleSelect(prop.id)}
                    />
                </td>
                <td>
                    <button
                        className="btn btn-error btn-sm"
                        onClick={() => deleteHandle(prop.id)}
                    >
                        Supprimer
                    </button>
                </td>
            </tr>
        );
    };

    const MobilePropCard = ({ prop }) => {
        const nomFamille =
            prop.nom_famille != "null" ? formatName(prop.nom_famille) : "N/A";
        const nomUsage = prop.nom_usage != "null" ? formatName(prop.nom_usage) : "N/A";
        const prenom = prop.prenom != "null" ? formatName(prop.prenom) : "N/A";
        const secondPrenom =
            prop.second_prenom != "null" ? formatName(prop.second_prenom) : "N/A";
        const dateNaissance = prop.date_naissance != "null" ? prop.date_naissance : "N/A";
        const sexe =
            prop.sexe != "null" ? (prop.sexe == "male" ? "Homme" : "Femme") : "N/A";
        const lieuNaissance =
            prop.lieu_naissance != "null" && prop.departement_naissance_numero != "null"
                ? formatName(prop.lieu_naissance) +
                  " (" +
                  prop.departement_naissance_numero +
                  ")"
                : "N/A";

        const adresse =
            (prop.adresse_numero || "") +
            " " +
            formatName(prop.adresse_type_voie) +
            " " +
            formatName(prop.adresse_nom_voie) +
            "\n" +
            (prop.adresse_code_postal || "") +
            ", " +
            formatName(prop.adresse_commune);

        return (
            <div
                key={prop.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(prop.id)}
                className={clsx(
                    "card card-compact bg-base-100 shadow-md rounded-box border border-base-content/5 cursor-pointer",
                    { "border-primary": selectedId === prop.id },
                )}
            >
                <div className="card-body">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="card-title text-base-content">
                                {prenom} {nomFamille}
                            </h3>
                            <p className="text-sm text-base-content/70">
                                ID: <span className="font-mono">{prop.id}</span>
                            </p>
                        </div>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                className="radio radio-primary pointer-events-none"
                                name="edit-mobile"
                                value={prop.id}
                                readOnly
                                checked={selectedId === prop.id}
                                // onMouseDown inutile ici: on ne focus pas l'input
                            />
                        </label>
                    </div>

                    <div className="divider my-2" />

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="opacity-70">Nom d'usage</div>
                        <div className="font-medium">{nomUsage}</div>

                        <div className="opacity-70">Second prénom</div>
                        <div className="font-medium">{secondPrenom}</div>

                        <div className="opacity-70">Date de naissance</div>
                        <div className="font-medium">{dateNaissance}</div>

                        <div className="opacity-70">Sexe</div>
                        <div className="font-medium">{sexe}</div>

                        <div className="opacity-70">Lieu de naissance</div>
                        <div className="font-medium">{lieuNaissance}</div>
                    </div>

                    <div className="mt-3">
                        <div className="opacity-70 text-sm mb-1">Adresse</div>
                        <div className="font-medium whitespace-pre-line text-sm">
                            {adresse}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const sortedPropList = [...propList].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { isSubmitting, errors },
    } = useForm({
        defaultValues: {
            nom_famille: "",
            nom_usage: "",
            prenom: "",
            second_prenom: "",
            date_naissance: "",
            sexe: "",
            lieu_naissance: "",
            departement_naissance_numero: "",
            adresse_numero: "",
            adresse_type_voie: "",
            adresse_nom_voie: "",
            adresse_code_postal: "",
            adresse_commune: "",
        },
    });

    // Pré-remplir le formulaire quand la sélection change
    useEffect(() => {
        if (!selectedProp) {
            reset({
                nom_famille: "",
                nom_usage: "",
                prenom: "",
                second_prenom: "",
                date_naissance: "",
                sexe: "",
                lieu_naissance: "",
                departement_naissance_numero: "",
                adresse_numero: "",
                adresse_type_voie: "",
                adresse_nom_voie: "",
                adresse_code_postal: "",
                adresse_commune: "",
            });
            return;
        }
        reset({
            nom_famille: normalize(selectedProp.nom_famille),
            nom_usage: normalize(selectedProp.nom_usage),
            prenom: normalize(selectedProp.prenom),
            second_prenom: normalize(selectedProp.second_prenom),
            date_naissance: normalize(selectedProp.date_naissance),
            sexe: normalize(selectedProp.sexe),
            lieu_naissance: normalize(selectedProp.lieu_naissance),
            departement_naissance_numero: normalize(
                selectedProp.departement_naissance_numero,
            ),
            adresse_numero: normalize(selectedProp.adresse_numero),
            adresse_type_voie: normalize(selectedProp.adresse_type_voie),
            adresse_nom_voie: normalize(selectedProp.adresse_nom_voie),
            adresse_code_postal: normalize(selectedProp.adresse_code_postal),
            adresse_commune: normalize(selectedProp.adresse_commune),
        });
    }, [selectedProp, reset]);

    const editSubmit = async (data) => {
        try {
            const base = selectedProp ? { id: selectedProp.id, ...data } : data;
            const payload = toLowercasePayload(base);
            if (base.id != null) {
                const res = await axios.put(
                    `${API}/proprietaires/update/${base.id}/`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } },
                );
                const updated = res?.data || payload;
                setPropList((prev) => {
                    const idx = prev.findIndex((p) => p.id === base.id);
                    if (idx === -1) return prev;
                    const next = [...prev];
                    next[idx] = { ...prev[idx], ...updated };
                    return next;
                });
            } else {
                const res = await axios.post(`${API}/proprietaires/create/`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const created = res?.data;
                if (created && created.id != null) {
                    setPropList((prev) => {
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
            await axios.delete(`${API}/proprietaires/delete/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPropList((prev) => prev.filter((p) => p.id !== id));
            if (selectedId === id) setSelectedId(null);
        } catch (e) {
            console.error("Suppression échouée", e);
        }
    };

    return (
        <AdminAuthCheck>
            <Renamer pageTitle="Proprio - NEOGEND" />
            <div className="">
                <DefaultHeader />
                <div className="flex flex-col md:flex-row md:items-start items-center justify-center gap-8 p-6">
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-center">
                            Propriétaires
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
                                                <th className="">Nom de famille</th>
                                                <th className="">Nom d'usage</th>
                                                <th className="">Prénom</th>
                                                <th className="">Second prénom</th>
                                                <th className="">Date de naissance</th>
                                                <th className="">Sexe</th>
                                                <th className="">Lieu de naissance</th>
                                                <th className="">Adresse</th>
                                                <th className="">Sélectionner</th>
                                                <th className="">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedPropList.map((prop) => (
                                                <TableRow key={prop.id} prop={prop} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="block md:hidden space-y-4 w-full">
                                    {sortedPropList.map((prop) => (
                                        <MobilePropCard key={prop.id} prop={prop} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="bg-base-200 p-6 rounded-3xl shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-center">Édition</h2>
                        <p className="text-center italic text-sm">
                            Sélectionnez un propriétaire pour l'éditer <br />
                            ou créez-en un nouveau
                        </p>
                        {selectedProp && (
                            <div className="flex items-center justify-center mb-4 gap-2 bg-warning/10 p-2 rounded-lg w-fit mx-auto border border-warning/50">
                                <p>Edition du propriétaire : </p>
                                <span className="badge badge-info">{selectedId}</span>
                                <button
                                    className="btn btn-error btn-sm btn-circle"
                                    onClick={() => setSelectedId(null)}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                        <form onSubmit={handleSubmit(editSubmit)} className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Prénom</span>
                                    </label>
                                    <input
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.prenom,
                                        })}
                                        aria-invalid={!!errors.prenom}
                                        {...register("prenom", {
                                            required: "Le prénom est requis",
                                        })}
                                    />
                                    {errors.prenom && (
                                        <span className="text-error text-xs mt-1">
                                            {errors.prenom.message}
                                        </span>
                                    )}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Second prénom</span>
                                    </label>
                                    <input
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.second_prenom,
                                        })}
                                        aria-invalid={!!errors.second_prenom}
                                        {...register("second_prenom")}
                                    />
                                    {errors.second_prenom && (
                                        <span className="text-error text-xs mt-1">
                                            {errors.second_prenom.message}
                                        </span>
                                    )}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Nom de famille</span>
                                    </label>
                                    <input
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.nom_famille,
                                        })}
                                        aria-invalid={!!errors.nom_famille}
                                        {...register("nom_famille", {
                                            required: "Le nom de famille est requis",
                                        })}
                                    />
                                    {errors.nom_famille && (
                                        <span className="text-error text-xs mt-1">
                                            {errors.nom_famille.message}
                                        </span>
                                    )}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Nom d'usage</span>
                                    </label>
                                    <input
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.nom_usage,
                                        })}
                                        aria-invalid={!!errors.nom_usage}
                                        {...register("nom_usage")}
                                    />
                                    {errors.nom_usage && (
                                        <span className="text-error text-xs mt-1">
                                            {errors.nom_usage.message}
                                        </span>
                                    )}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Date de naissance
                                        </span>
                                    </label>
                                    <RHFDateText
                                        control={control}
                                        name="date_naissance"
                                        className="input input-bordered w-full"
                                        rules={{
                                            required: "La date de naissance est requise",
                                        }}
                                    />
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Sexe</span>
                                    </label>
                                    <div className="flex gap-4 items-center">
                                        <label className="flex gap-2 items-center">
                                            <input
                                                type="radio"
                                                value="male"
                                                {...register("sexe", {
                                                    required: "Le sexe est requis",
                                                })}
                                                className={clsx("radio radio-primary", {
                                                    "radio-error": errors.sexe,
                                                })}
                                            />
                                            <span>Homme</span>
                                        </label>
                                        <label className="flex gap-2 items-center">
                                            <input
                                                type="radio"
                                                value="female"
                                                {...register("sexe", {
                                                    required: "Le sexe est requis",
                                                })}
                                                className={clsx("radio radio-primary", {
                                                    "radio-error": errors.sexe,
                                                })}
                                            />
                                            <span>Femme</span>
                                        </label>
                                    </div>
                                    {errors.sexe && (
                                        <span className="text-error text-xs mt-1">
                                            {errors.sexe.message}
                                        </span>
                                    )}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Lieu de naissance
                                        </span>
                                    </label>
                                    <input
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.lieu_naissance,
                                        })}
                                        aria-invalid={!!errors.lieu_naissance}
                                        {...register("lieu_naissance", {
                                            required: "Le lieu de naissance est requis",
                                        })}
                                    />
                                    {errors.lieu_naissance && (
                                        <span className="text-error text-xs mt-1">
                                            {errors.lieu_naissance.message}
                                        </span>
                                    )}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">
                                            Département naissance
                                        </span>
                                    </label>
                                    <input
                                        className={clsx("input input-bordered", {
                                            "input-error":
                                                errors.departement_naissance_numero,
                                        })}
                                        aria-invalid={
                                            !!errors.departement_naissance_numero
                                        }
                                        {...register("departement_naissance_numero", {
                                            required:
                                                "Le département de naissance est requis",
                                        })}
                                    />
                                    {errors.departement_naissance_numero && (
                                        <span className="text-error text-xs mt-1">
                                            {errors.departement_naissance_numero.message}
                                        </span>
                                    )}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">N° voie</span>
                                    </label>
                                    <input
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.adresse_numero,
                                        })}
                                        aria-invalid={!!errors.adresse_numero}
                                        {...register("adresse_numero", {
                                            required: "Le numéro de voie est requis",
                                        })}
                                    />

                                    {errors.adresse_numero && (
                                        <span className="text-error text-xs mt-1">
                                            {errors.adresse_numero.message}
                                        </span>
                                    )}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Type de voie</span>
                                    </label>
                                    <select
                                        className={clsx("select select-bordered", {
                                            "select-error": errors.adresse_type_voie,
                                        })}
                                        aria-invalid={!!errors.adresse_type_voie}
                                        {...register("adresse_type_voie", {
                                            required: "Le type de voie est requis",
                                        })}
                                    >
                                        <option value="">Sélectionner</option>
                                        <option value="allee">Allée</option>
                                        <option value="avenue">Avenue</option>
                                        <option value="boulevard">Boulevard</option>
                                        <option value="chemin">Chemin</option>
                                        <option value="cours">Cours</option>
                                        <option value="impasse">Impasse</option>
                                        <option value="lieu-dit">Lieu-Dit</option>
                                        <option value="place">Place</option>
                                        <option value="quai">Quai</option>
                                        <option value="route">Route</option>
                                        <option value="rue">Rue</option>
                                        <option value="ruelle">Ruelle</option>
                                    </select>
                                    {errors.adresse_type_voie && (
                                        <span className="text-error text-xs mt-1">
                                            {errors.adresse_type_voie.message}
                                        </span>
                                    )}
                                </div>
                                <div className="form-control md:col-span-2">
                                    <label className="label">
                                        <span className="label-text">Nom de voie</span>
                                    </label>
                                    <input
                                        className={clsx("input input-bordered w-full", {
                                            "input-error": errors.adresse_nom_voie,
                                        })}
                                        aria-invalid={!!errors.adresse_nom_voie}
                                        {...register("adresse_nom_voie", {
                                            required: "Le nom de voie est requis",
                                        })}
                                    />
                                    <br />
                                    {errors.adresse_nom_voie && (
                                        <span className="text-error text-xs mt-1">
                                            {errors.adresse_nom_voie.message}
                                        </span>
                                    )}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Code postal</span>
                                    </label>
                                    <input
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.adresse_code_postal,
                                        })}
                                        aria-invalid={!!errors.adresse_code_postal}
                                        {...register("adresse_code_postal", {
                                            required: "Le code postal est requis",
                                        })}
                                    />
                                    {errors.adresse_code_postal && (
                                        <span className="text-error text-xs mt-1">
                                            {errors.adresse_code_postal.message}
                                        </span>
                                    )}
                                </div>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Commune</span>
                                    </label>
                                    <input
                                        className={clsx("input input-bordered", {
                                            "input-error": errors.adresse_commune,
                                        })}
                                        aria-invalid={!!errors.adresse_commune}
                                        {...register("adresse_commune", {
                                            required: "La commune est requise",
                                        })}
                                    />
                                    {errors.adresse_commune && (
                                        <span className="text-error text-xs mt-1">
                                            {errors.adresse_commune.message}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                {selectedId == null ? (
                                    <span className="italic text-sm">
                                        Création d'un propriétaire
                                    </span>
                                ) : (
                                    <span className="italic text-sm">
                                        Modification d'un propriétaire
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
                        </form>
                    </div>
                </div>
            </div>
        </AdminAuthCheck>
    );
}

export default AdminPropioPage;
