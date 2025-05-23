import React, { useEffect, useState } from "react";
import Home from "./componentes/home";
import SearchBar from "./componentes/SearchBar";
import BottomNavbar from "./componentes/BottomNavbar";

const App = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkIfMobile();
        window.addEventListener("resize", checkIfMobile);
        return () => window.removeEventListener("resize", checkIfMobile);
    }, []);

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {isMobile ? (
                <>
                    <SearchBar />
                    <div style={{ flex: 1, overflowY: "auto" }}>
                        <Home isMobile={isMobile} />
                    </div>
                    <BottomNavbar />
                </>
            ) : (
                <>
                    <div style={{ flex: 1, overflowY: "auto" }}>
                        <Home isMobile={isMobile} />
                    </div>
                </>
            )}
        </div>
    );
};

export default App;