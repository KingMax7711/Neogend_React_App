const formatName = (str) => {
    if (!str) return "";
    let strReturn = "";
    strReturn += str.charAt(0).toUpperCase();
    for (let i = 1; i < str.length; i++) {
        if (str.charAt(i - 1) === "-" || str.charAt(i - 1) === " ") {
            strReturn += str.charAt(i).toUpperCase();
        } else {
            strReturn += str.charAt(i).toLowerCase();
        }
    }
    return strReturn;
};

export default formatName;
