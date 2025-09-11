export const qualificationToFront = (qualification) => {
    switch (qualification) {
        case "opj":
            return "Officier de Police Judiciaire";
        case "apj":
            return "Agent de Police Judiciaire";
        case "apja":
            return "Agent de Police Judiciaire Adjoint";
        default:
            return "Aucune";
    }
};
export const frontToQualification = (qualification) => {
    switch (qualification) {
        case "Officier de Police Judiciaire":
            return "opj";
        case "Agent de Police Judiciaire":
            return "apj";
        case "Agent de Police Judiciaire Adjoint":
            return "apja";
        default:
            return "Aucune";
    }
};
