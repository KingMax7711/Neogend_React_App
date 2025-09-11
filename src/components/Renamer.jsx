import React from "react";

function Renamer({ pageTitle }) {
    React.useEffect(() => {
        document.title = pageTitle;
    }, [pageTitle]);

    return null;
}

export default Renamer;
