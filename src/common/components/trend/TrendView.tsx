import * as React from "react";
import {useEffect, useState} from "react";
import {Chart} from "primereact/chart";
import {Trend} from "../../data/strategy/Trend";
import {TrendDirection} from "../../data/strategy/TrendDirection";
import "./TrendView.css";
import {TrendDirectionColor} from "../../utils/utils";
import moment = require("moment");

type Props = {
    trend: Trend
    levels: number[]
    position?: number
}

const TrendView: React.FC<Props> = ({trend, levels, position}) => {
    const [innerTrend, setInnerTrend] = useState(null)
    const [data, setData] = useState(null)
    const intervalShortName = {
        MONTH: 'MN',
        WEEK: 'W',
        DAY: 'D'
    }
    const intervalDateTimeFormat = {
        MONTH: "DD-MM-YYYY",
        WEEK: "DD-MM-YYYY",
        DAY: "DD-MM-YYYY"
    }

    useEffect(() => {
        if (trend) {
            if (innerTrend && trend.swingHighsLows.length === innerTrend.swingHighsLows.length) {
                for (let i = 0; i < trend.swingHighsLows.length; i++) {
                    if (trend.swingHighsLows[i].swingHL !== innerTrend.swingHighsLows[i].swingHL) {
                        updateData(trend, levels)
                        break
                    }
                }
            } else {
                updateData(trend, levels)
            }

            if (levels && levels.length > 0) updateData(trend, levels)
        }
    }, [trend, levels])

    const getColor = (direction: TrendDirection) => {
        return TrendDirectionColor[direction] || '#3f51b5'
    }

    const updateData = (trend: Trend, levels: number[]) => {
        setInnerTrend(trend)
        const color = getColor(trend.direction)
        const dateTimeFormat = intervalDateTimeFormat[trend.interval] || "HH:mm DD-MM"
        const datasets = []
        datasets.push({
            label: `${trend.interval} - Trend ${trend.direction} - ${trend.power}`,
            data: trend.swingHighsLows.map(value => value.swingHL),
            fill: false,
            backgroundColor: color,
            borderColor: color
        })
        for (let lvl of levels) {
            datasets.push({
                label: lvl,
                data: Array(trend.swingHighsLows.length).fill(lvl, 0, trend.swingHighsLows.length),
                fill: false,
                borderColor: '#FFA726'
            })
        }

        setData({
            labels: trend.swingHighsLows.map(value => moment(value.dateTime).format(dateTimeFormat)),
            datasets
        })
    }

    if (trend) {
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
                    <Chart type="line" data={data} width={'400px'} height={'300px'}/>
                </div>
            )
        }
    } else {
        return (
            <div>Select security for trend analysis</div>
        )
    }
}

export default TrendView