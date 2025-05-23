import React from "react";
import './BottomNavbar.css';

const BottomNavbar = () => {
    return (
        <div className="bottom-navbar">
            <button className="navbar-button">Home</button>
            <button className="navbar-button">Search</button>
            <button className="navbar-button">Profile</button>
        </div>
    );
};

export default BottomNavbar;