// Validate strict yyyy-mm-dd and real calendar date
export function isValidYMD(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [y, m, d] = value.split("-").map(Number);
    const dt = new Date(`${value}T00:00:00Z`);
    return (
        dt.getUTCFullYear() === y && dt.getUTCMonth() + 1 === m && dt.getUTCDate() === d
    );
}

// Mask free typing into YYYY-MM-DD using only digits
export function formatMaskYYYYMMDD(raw) {
    const digits = (raw || "").replace(/\D/g, "").slice(0, 8);
    const y = digits.slice(0, 4);
    const m = digits.slice(4, 6);
    const d = digits.slice(6, 8);
    if (digits.length <= 4) return y;
    if (digits.length <= 6) return `${y}-${m}`;
    return `${y}-${m}-${d}`;
}

// Mask free typing into DD/MM/YYYY using only digits
export function formatMaskDDMMYYYY(raw) {
    const digits = (raw || "").replace(/\D/g, "").slice(0, 8);
    const d = digits.slice(0, 2);
    const m = digits.slice(2, 4);
    const y = digits.slice(4, 8);
    if (digits.length <= 2) return d;
    if (digits.length <= 4) return `${d}/${m}`;
    return `${d}/${m}/${y}`;
}

// Validate strict dd/mm/yyyy and real calendar date
export function isValidFRDate(value) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;
    const [d, m, y] = value.split("/").map(Number);
    const ymd = `${y.toString().padStart(4, "0")}-${m.toString().padStart(2, "0")}-${d
        .toString()
        .padStart(2, "0")}`;
    const dt = new Date(`${ymd}T00:00:00Z`);
    return (
        dt.getUTCFullYear() === y && dt.getUTCMonth() + 1 === m && dt.getUTCDate() === d
    );
}

// Convert dd/mm/yyyy -> yyyy-mm-dd (returns "" if invalid)
export function toYMDFromFR(value) {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return "";
    const [d, m, y] = value.split("/");
    return `${y}-${m}-${d}`;
}

// Convert yyyy-mm-dd -> dd/mm/yyyy (returns "" if invalid)
export function toFRFromYMD(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return "";
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
}
