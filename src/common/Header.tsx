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
            <NavLink to="/trade-strategy-analysis" activeStyle={activeStyle}>
                Trade Strategy Analysis
            </NavLink>
            {" / "}
            <NavLink to="/trade-strategy-bot-control" activeStyle={activeStyle}>
                Trade Strategy Bot Control
            </NavLink>
            {" / "}
            <NavLink to="/about" activeStyle={activeStyle}>
                About
            </NavLink>
        </nav>
    );
};
