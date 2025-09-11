export const affectationToFront = (affectation) => {
    switch (affectation) {
        case "29120":
            return "COB Pont l'Abbé";
        default:
            return "Aucune";
    }
};
export const frontToAffectation = (affectation) => {
    switch (affectation) {
        case "COB Pont l'Abbé":
            return "29120";
        default:
            return "Aucun";
    }
};
