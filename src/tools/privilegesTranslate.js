export const privilegesToFront = (privilege) => {
    switch (privilege) {
        case "player":
            return "Joueur";
        case "mod":
            return "Modérateur";
        case "admin":
            return "Administrateur";
        case "owner":
            return "Propriétaire";
        default:
            return "Inconnu";
    }
};

export const frontToPrivileges = (privilege) => {
    switch (privilege) {
        case "Utilisateur":
            return "player";
        case "Modérateur":
            return "mod";
        case "Administrateur":
            return "admin";
        case "Propriétaire":
            return "owner";
        default:
            return "unknown";
    }
};
