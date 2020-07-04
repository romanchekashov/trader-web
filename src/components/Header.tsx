import * as React from "react";
import { NavLink } from "react-router-dom";

export const Header = () => {
    const activeStyle = { color: "#f15b2a" };

    return (
        <nav>
            <NavLink to="/" activeStyle={activeStyle} exact>
                Home
            </NavLink>
            {" / "}
            <NavLink to="/analysis" activeStyle={activeStyle}>
                Analysis
            </NavLink>
            {" / "}
            <NavLink to="/bot-control" activeStyle={activeStyle}>
                Bot Control
            </NavLink>
            {" / "}
            <NavLink to="/trade-journal" activeStyle={activeStyle}>
                Journal
            </NavLink>
            {" / "}
            <NavLink to="/economic-calendar" activeStyle={activeStyle}>
                Calendar
            </NavLink>
            {" / "}
            <NavLink to="/about" activeStyle={activeStyle}>
                About
            </NavLink>
        </nav>
    );
};
