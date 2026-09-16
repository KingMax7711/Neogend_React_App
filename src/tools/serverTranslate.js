export const serverToFront = (server) => {
    switch (server) {
        case "frp":
            return "France Rôleplay (Nostalgie)";
        case "hexa":
            return "Hexagone Life RP";
        default:
            return "Aucun";
    }
};
export const frontToServer = (server) => {
    switch (server) {
        case "France Rôleplay (Nostalgie)":
            return "frp";
        case "Hexagone Life RP":
            return "hexa";
        default:
            return "Aucun";
    }
};
