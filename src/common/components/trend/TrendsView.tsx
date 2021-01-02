import * as React from "react";
import {useEffect, useState} from "react";
import {Trend} from "../../data/strategy/Trend";
import TrendView from "./TrendView";
import "./TrendView.css";
import {SRLevel} from "../../data/strategy/SRLevel";

type Props = {
    trends: Trend[]
    srLevels?: SRLevel[]
}

export const TrendsView: React.FC<Props> = ({trends, srLevels}) => {
    const [position, setPosition] = useState<number>(2)

    useEffect(() => {
    }, [])

    if (trends.length > 0) {
        const className = "p-grid" + (position === 3 ? " trends-position-3" : "");
        const switcherClassName = (position === 2 ? "" : "p-col-12 ") + "trends-position-switcher";
        return (
            <div className={className} style={{padding: 2}}>
                <div className={switcherClassName} style={{display: "flex"}}>
                    <div className={position === 1 ? "active" : ""} onClick={(e) => {
                        setPosition(1)
                    }}>1
                    </div>
                    <div className={position === 2 ? "active" : ""} onClick={(e) => {
                        setPosition(2)
                    }}>2
                    </div>
                    <div className={position === 3 ? "active" : ""} onClick={(e) => {
                        setPosition(3)
                    }}>3
                    </div>
                </div>
                {
                    trends.map(trend => {
                        return (<TrendView key={trend.interval}
                                           trend={trend}
                                           srLevels={srLevels}
                                           position={position}
                                           width={400}
                                           height={400}/>)
                    })
                }
            </div>
        )
    } else {
        return (
            <div>Select security for trends</div>
        )
    }
}
