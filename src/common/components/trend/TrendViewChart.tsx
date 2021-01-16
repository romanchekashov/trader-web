import * as React from "react";
import {useEffect, useState} from "react";
import {Chart} from "primereact/chart";
import {Trend} from "../../data/strategy/Trend";
import {TrendDirection} from "../../data/strategy/TrendDirection";
import "./TrendView.css";
import {TrendDirectionColor} from "../../utils/utils";
import {SRLevel} from "../../data/strategy/SRLevel";
import {Interval} from "../../data/Interval";
import {SrLevelType} from "../../data/strategy/SrLevelType";
import intervalCompare from "../../utils/IntervalComporator";
import moment = require("moment");

type Props = {
    trend: Trend
    srLevels: SRLevel[]
    width: number,
    height: number
}

const TrendViewChart: React.FC<Props> = ({trend, srLevels, width, height}) => {
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
    const TODAY_COLOR = '#f44336'

    useEffect(() => {
        if (trend) {
            if (innerTrend && trend.swingHighsLows.length === innerTrend.swingHighsLows.length) {
                for (let i = 0; i < trend.swingHighsLows.length; i++) {
                    if (trend.swingHighsLows[i].swingHL !== innerTrend.swingHighsLows[i].swingHL) {
                        updateData(trend, [])
                        break
                    }
                }
            } else {
                updateData(trend, [])
            }

            if (srLevels && srLevels.length > 0) {
                const INTERVAL = intervalCompare(trend.interval, Interval.M60) < 0 ? Interval.DAY
                    : intervalCompare(trend.interval, Interval.H4) < 0 ? Interval.WEEK
                        : Interval.MONTH
                updateData(trend, srLevels
                    .filter(value => value.interval === INTERVAL))
            }
        }
    }, [trend, srLevels])

    const getColor = (direction: TrendDirection) => {
        return TrendDirectionColor[direction] || '#3f51b5'
    }

    const makeShort = (type: SrLevelType): string => {
        if (!type) return ""
        const arr = type.split('_')
        return arr[0][0] + arr[1][0]
    }

    const updateData = (trend: Trend, levels: SRLevel[]) => {
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
                label: `${makeShort(lvl.type)}(${intervalShortName[lvl.interval]}): ${lvl.swingHL}`,
                data: Array(trend.swingHighsLows.length).fill(lvl.swingHL, 0, trend.swingHighsLows.length),
                fill: false,
                borderColor: lvl.type === SrLevelType.TODAY_HIGH || lvl.type === SrLevelType.TODAY_LOW ? TODAY_COLOR : '#FFA726'
            })
        }

        setData({
            labels: trend.swingHighsLows.map(value => moment(value.dateTime).format(dateTimeFormat)),
            datasets
        })
    }

    if (!trend) return <div>Select security for trend analysis</div>

    // console.log(width, height)

    return (
        <Chart type="line"
               data={data}
               width={width + 'px'}
               height={height + 'px'}/>
    )
}

export default TrendViewChart