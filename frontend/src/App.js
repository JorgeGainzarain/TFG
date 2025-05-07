import React, { useEffect, useState } from "react";
import Home from "./componentes/home";
import Search from "./componentes/search";

const App = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIfMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            if (/android|iPad|iPhone|iPod/i.test(userAgent.toLowerCase()) || window.innerWidth <= 768) {
                setIsMobile(true);
            } else {
                setIsMobile(false);
            }
        };

        checkIfMobile();
        window.addEventListener("resize", checkIfMobile);
        return () => window.removeEventListener("resize", checkIfMobile);
    }, []);

    return (
        <div>
            <Home isMobile={isMobile} />
        </div>
    );
};

export default App;