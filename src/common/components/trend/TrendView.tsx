import * as React from "react";
import {useEffect} from "react";
import {Trend} from "../../data/strategy/Trend";
import {TrendDirection} from "../../data/strategy/TrendDirection";
import "./TrendView.css";
import {TrendDirectionColor} from "../../utils/utils";
import {SRLevel} from "../../data/strategy/SRLevel";
import TrendViewChart from "./TrendViewChart";

type Props = {
    trend: Trend
    srLevels?: SRLevel[]
    position?: number,
    width: number,
    height: number
}

const TrendView: React.FC<Props> = ({trend, srLevels, position, width, height}) => {
    const intervalShortName = {
        MONTH: 'MN',
        WEEK: 'W',
        DAY: 'D'
    }

    useEffect(() => {
    }, [])

    const getColor = (direction: TrendDirection) => {
        return TrendDirectionColor[direction] || '#3f51b5'
    }

    if (!trend) return <div>Select security for trend analysis</div>

    const interval = intervalShortName[trend.interval] || trend.interval

    if (position === 3) {
        return (
            <div className="p-col-12 trend-position-3" style={{backgroundColor: getColor(trend.direction)}}>
                {`${interval} - ${trend.direction}`}
            </div>
        )
    } else if (position === 2) {
        return (
            <div className="p-col-1 trend-position-2" style={{backgroundColor: getColor(trend.direction)}}>
                {`${interval} - ${trend.direction}`}
            </div>
        )
    } else {
        return (
            <div className="p-col-4">
                <TrendViewChart trend={trend} srLevels={srLevels} width={width} height={height}/>
            </div>
        )
    }
}

export default TrendView