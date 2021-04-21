import * as React from "react";
import {useEffect, useState} from "react";
import {NavLink} from "react-router-dom";
import MarketWorkTime from "../common/components/market-work-time/MarketWorkTime";
import "./Header.css"
import {SelectButton} from "primereact/components/selectbutton/SelectButton";

export const Header = () => {
    const activeStyle = {color: "#f15b2a"};
    const [windowSize, setWindowSize] = useState<string>('mid')
    const winSizes = ['small', 'mid', 'large'];

    useEffect(() => {
        switch (windowSize) {
            case 'small':
                window.resizeTo(500, 300);
                break
            case 'mid':
                window.resizeTo(800, 500);
                break
            case 'large':
                window.resizeTo(1300, 800);
                break
        }
    }, [windowSize])

    return (
        <div className="header draggable">
            <nav>
                <NavLink to="/" activeStyle={activeStyle} exact className="no-drag">
                    Real
                </NavLink>
                {" / "}
                <NavLink to="/history" activeStyle={activeStyle} className="no-drag">
                    History
                </NavLink>
                {" / "}
                <NavLink to="/signal" activeStyle={activeStyle} className="no-drag">
                    Signal
                </NavLink>
            </nav>
            <div className="no-drag" style={{marginTop: '-3px'}}>
                <SelectButton value={windowSize}
                              options={winSizes}
                              onChange={(e) => setWindowSize(e.value)}
                              style={{cursor: 'pointer'}}/>
            </div>
            <MarketWorkTime/>
        </div>
    );
};