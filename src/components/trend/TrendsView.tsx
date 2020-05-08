import * as React from "react";
import {useEffect, useState} from "react";
import {Trend} from "../../common/data/strategy/Trend";
import TrendView from "./TrendView";
import "./TrendView.css";

type Props = {
    trends: Trend[]
};

export const TrendsView: React.FC<Props> = ({trends}) => {
    const [position, setPosition] = useState(2);

    useEffect(() => {
    }, []);

    if (trends.length > 0) {
        const className = "p-grid" + (position === 3 ? " trends-position-3" : "");
        const switcherClassName = (position === 2 ? "" : "p-col-12 ") + "trends-position-switcher";
        return (
            <div className={className}>
                <div className={switcherClassName} style={{display: "flex"}}>
                    <div className={position === 1 ? "active" : ""} onClick={(e) => {setPosition(1)}}>1</div>
                    <div className={position === 2 ? "active" : ""} onClick={(e) => {setPosition(2)}}>2</div>
                    <div className={position === 3 ? "active" : ""} onClick={(e) => {setPosition(3)}}>3</div>
                </div>
                {
                    trends.map(trend => {
                        return (<TrendView key={trend.interval}
                                           trend={trend}
                                           position={position}/>)
                    })
                }
            </div>
        )
    } else {
        return (
            <div>Select security for trends</div>
        )
    }
};
