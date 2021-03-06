import * as React from "react";
import { NavLink } from "react-router-dom";
import MarketWorkTime from "../common/components/market-work-time/MarketWorkTime";
const styles = require("./Header.module.css");

export const Header = () => {
    const activeStyle = { color: "#f15b2a" };

    return (
        <div className={styles.header}>
            <nav id="main-nav">
                <NavLink to="/" activeStyle={activeStyle} exact>
                    Home
                </NavLink>
                {" / "}
                <NavLink to="/economic-calendar" activeStyle={activeStyle}>
                    Calendar
                </NavLink>
                {" / "}
                <NavLink to="/news" activeStyle={activeStyle}>
                    News
                </NavLink>
                {" / "}
                <NavLink to="/trading-charts" activeStyle={activeStyle}>
                    TCharts
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
                <NavLink to="/active-trades" activeStyle={activeStyle}>
                    ActiveTrades
                </NavLink>
                {" / "}
                <NavLink to="/trade-journal" activeStyle={activeStyle}>
                    Journal
                </NavLink>
                {" / "}
                <NavLink to="/about" activeStyle={activeStyle}>
                    About
                </NavLink>
            </nav>
            <MarketWorkTime />
        </div>
    )
}
