import React, { useState } from "react";
import { Controller } from "react-hook-form";
import {
    isValidYMD,
    formatMaskDDMMYYYY,
    isValidFRDate,
    toYMDFromFR,
    toFRFromYMD,
} from "./dateUtils";

export default function RHFDateText({
    control,
    name,
    className = "input input-bordered w-full",
    disabled = false,
    placeholder = "JJ/MM/AAAA",
    rules = {},
    onUserChange,
    inputProps = {},
}) {
    return (
        <Controller
            control={control}
            name={name}
            rules={{
                ...rules,
                validate: (v, formValues) => {
                    // v est la valeur RHF (YYYY-MM-DD)
                    if (!v) return rules?.required ? "Champ requis" : true;
                    if (!isValidYMD(v)) return "Date invalide";
                    if (rules?.validate && typeof rules.validate === "function") {
                        const res = rules.validate(v, formValues);
                        return res;
                    }
                    return true;
                },
            }}
            render={({ field, fieldState }) => {
                function DateInnerInput({ initialText }) {
                    const [text, setText] = useState(initialText);

                    const handleChange = (e) => {
                        const maskedFR = formatMaskDDMMYYYY(e.target.value);
                        setText(maskedFR);
                        if (onUserChange) onUserChange();
                        if (isValidFRDate(maskedFR)) {
                            const ymd = toYMDFromFR(maskedFR);
                            field.onChange(ymd);
                        }
                    };

                    const handleBlur = () => {
                        field.onBlur();
                        // If invalid FR on blur, set RHF value to empty to trigger validation
                        if (!isValidFRDate(text)) {
                            field.onChange("");
                        }
                    };

                    return (
                        <>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder={placeholder}
                                className={`${className} ${
                                    fieldState.error ? "input-error" : ""
                                }`}
                                value={text}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                disabled={disabled}
                                {...inputProps}
                            />
                            {fieldState.error && (
                                <span className="text-error text-xs mt-1">
                                    {fieldState.error.message}
                                </span>
                            )}
                        </>
                    );
                }

                const initialText = toFRFromYMD(field.value || "");
                return (
                    <DateInnerInput key={field.value || ""} initialText={initialText} />
                );
            }}
        />
    );
}
