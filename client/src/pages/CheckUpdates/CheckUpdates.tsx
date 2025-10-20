import { useEffect } from "react";


export function CheckUpdates() {

    useEffect(() => {
        navigator.serviceWorker.getRegistration().then(reg => reg?.update());
        window.history.back();
    }, []);

    return null;
}


