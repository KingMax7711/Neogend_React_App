export const gradesToFront = (grade) => {
    switch (grade) {
        case "gar":
            return "Général des Armées";
        case "gca":
            return "Général de Corps d'Armée";
        case "gdi":
            return "Général de Division";
        case "gbr":
            return "Général de Brigade";
        case "col":
            return "Colonel";
        case "lcl":
            return "Lieutenant-Colonel";
        case "cen":
            return "Chef D'escadron";
        case "cne":
            return "Capitaine";
        case "ltn":
            return "Lieutenant";
        case "slt":
            return "Sous-Lieutenant";
        case "eogn":
            return "Élève-Officier";
        case "mjr":
            return "Major";
        case "adc":
            return "Adjudant-Chef";
        case "adj":
            return "Adjudant";
        case "mdc":
            return "Maréchal des Logis-Chef";
        case "gnd":
            return "Gendarme";
        case "gsc":
            return "Gendarme Sous Contrat";

        case "brc":
            return "Brigadier-Chef";
        case "brg":
            return "Brigadier";
        case "ga1":
            return "Première Classe";
        case "ga2":
            return "Seconde Classe";
    }
};

export const frontToGrades = (grade) => {
    switch (grade) {
        case "Général des Armées":
            return "gar";
        case "Général de Corps d'Armée":
            return "gca";
        case "Général de Division":
            return "gdi";
        case "Général de Brigade":
            return "gbr";
        case "Colonel":
            return "col";
        case "Lieutenant-Colonel":
            return "lcl";
        case "Chef D'escadron":
            return "cen";
        case "Capitaine":
            return "cne";
        case "Lieutenant":
            return "ltn";
        case "Sous-Lieutenant":
            return "slt";
        case "Élève-Officier":
            return "eogn";
        case "Major":
            return "mjr";
        case "Adjudant-Chef":
            return "adc";
        case "Adjudant":
            return "adj";
        case "Maréchal des Logis-Chef":
            return "mdc";
        case "Gendarme":
            return "gnd";
        case "Gendarme Sous Contrat":
            return "gsc";
        case "Brigadier-Chef":
            return "brc";
        case "Brigadier":
            return "brg";
        case "Première Classe":
            return "ga1";
        case "Seconde Classe":
            return "ga2";
        default:
            return "Aucun";
    }
};
