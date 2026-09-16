export const affectationToFront = (affectation) => {
    switch (affectation) {
        case "74130_CO":
            return "Compagnie Bonneville";
        case "74130_PS":
            return "PSIG Bonneville";
        case "74130_PM":
            return "PMO Bonneville";
        default:
            return "Aucune";
    }
};
export const frontToAffectation = (affectation) => {
    switch (affectation) {
        case "Compagnie Bonneville":
            return "74130_CO";
        case "PSIG Bonneville":
            return "74130_PS";
        case "PMO Bonneville":
            return "74130_PM";
        default:
            return "Aucun";
    }
};
