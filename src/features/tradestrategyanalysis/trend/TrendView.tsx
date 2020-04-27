import * as React from "react";
import {useEffect} from "react";
import {Chart} from "primereact/chart";
import {Trend} from "../../../data/strategy/Trend";
import {useState} from "react";
import moment = require("moment");
import {TrendDirection} from "../../../data/strategy/TrendDirection";
import "./TrendView.css";

type Props = {
    trend: Trend
    position?: number
};

const TrendView: React.FC<Props> = ({trend, position}) => {
    const [innerTrend, setInnerTrend] = useState(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (trend) {
            if (innerTrend && trend.swingHighsLows.length === innerTrend.swingHighsLows.length) {
                for (let i = 0; i < trend.swingHighsLows.length; i++) {
                    if (trend.swingHighsLows[i].swingHL !== innerTrend.swingHighsLows[i].swingHL) {
                        updateData(trend);
                        break;
                    }
                }
            } else {
                updateData(trend);
            }
        }
    }, [trend]);

    const getColor = (direction: TrendDirection) => {
        let color = '#42A5F5';
        switch (trend.direction) {
            case TrendDirection.DOWN:
                color = '#e74c3c';
                break;
            case TrendDirection.UP:
                color = '#27ae60';
                break;
        }
        return color;
    };

    const updateData = (trend: Trend) => {
        setInnerTrend(trend);
        const color = getColor(trend.direction);
        setData({
            labels: trend.swingHighsLows.map(value => moment(value.dateTime).format("HH:mm DD-MM")),
            datasets: [
                {
                    label: `${trend.interval} - Trend ${trend.direction}`,
                    data: trend.swingHighsLows.map(value => value.swingHL),
                    fill: false,
                    backgroundColor: color,
                    borderColor: color
                }
            ]
        });
    };

    if (trend) {
        if (position === 3) {
            return (
                <div className="p-col-12 trend-position-3" style={{backgroundColor: getColor(trend.direction)}}>
                    {`${trend.interval} - Trend ${trend.direction}`}
                </div>
            )
        } else if (position === 2) {
            return (
                <div className="p-col-1 trend-position-2" style={{backgroundColor: getColor(trend.direction)}}>
                    {`${trend.interval} - Trend ${trend.direction}`}
                </div>
            )
        } else {
            return (
                <div className="p-col-3">
                    <Chart type="line" data={data} width={'300px'} height={'300px'} />
                </div>
            )
        }
    } else {
        return (
            <div>Select security for trend analysis</div>
        )
    }
};

export default TrendView;