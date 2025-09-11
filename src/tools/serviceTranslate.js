export const serviceToFront = (service) => {
    switch (service) {
        case "pn":
            return "Police Nationale";
        case "gn":
            return "Gendarmerie Nationale";
        case "pm":
            return "Police Municipale";
        default:
            return "Inconnu";
    }
};

export const frontToService = (service) => {
    switch (service) {
        case "Police Nationale":
            return "pn";
        case "Gendarmerie Nationale":
            return "gn";
        case "Police Municipale":
            return "pm";
        default:
            return "Aucun";
    }
};
