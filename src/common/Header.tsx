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
            <NavLink to="/courses" activeStyle={activeStyle}>
                Courses
            </NavLink>
            {" / "}
            <NavLink to="/about" activeStyle={activeStyle}>
                About
            </NavLink>
        </nav>
    );
};
