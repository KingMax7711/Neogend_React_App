export const dbDateToFront = (dbDate) => {
    if (!dbDate) return "Aucune";
    const [year, month, day] = dbDate.split("-");
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

export const frontDateToDB = (frontDate) => {
    if (!frontDate) return null;
    const d = new Date(frontDate);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${year}-${month}-${day}`;
};
