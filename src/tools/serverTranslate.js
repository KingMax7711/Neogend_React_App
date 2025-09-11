export const serverToFront = (server) => {
    switch (server) {
        case "frp":
            return "France Rôleplay";
        case "brz":
            return "Breizh Rôleplay";
        default:
            return "Aucun";
    }
};
export const frontToServer = (server) => {
    switch (server) {
        case "France Rôleplay":
            return "frp";
        case "Breizh Rôleplay":
            return "brz";
        default:
            return "Aucun";
    }
};
