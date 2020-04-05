import * as React from "react";
import {useEffect} from "react";
import {Chart} from "primereact/chart";
import {Trend} from "../../../api/dto/strategy/Trend";
import {useState} from "react";
import moment = require("moment");
import {TrendDirection} from "../../../api/dto/strategy/TrendDirection";

type Props = {
    trend: Trend
};
let data = null;
let prevTrend = null;

const TrendView: React.FC<Props> = ({trend}) => {
    const [innerTrend, setInnerTrend] = useState(null);

    useEffect(() => {
    });

    const setData = (trend: Trend) => {
        prevTrend = trend;
        let color = '#42A5F5';
        switch (trend.direction) {
            case TrendDirection.DOWN:
                color = '#e74c3c';
                break;
            case TrendDirection.UP:
                color = '#27ae60';
                break;
        }
        data = {
            labels: trend.swingHighsLows.map(value => moment(value.dateTime).format("HH:mm DD-MM")),
            datasets: [
                {
                    label: 'Trend direction: ' + trend.direction,
                    data: trend.swingHighsLows.map(value => value.swingHL),
                    fill: false,
                    backgroundColor: color,
                    borderColor: color
                }
            ]
        };
    };

    if (trend) {
        if (prevTrend && trend.swingHighsLows.length === prevTrend.swingHighsLows.length) {
            for (let i = 0; i < trend.swingHighsLows.length; i++) {
                if (trend.swingHighsLows[i].swingHL !== prevTrend.swingHighsLows[i].swingHL) {
                    setData(trend);
                    break;
                }
            }
        } else {
            setData(trend);
        }

        return (
            <>
                <Chart type="line" data={data} width={'300px'} height={'300px'} />
            </>
        )
    } else {
        return (
            <div>Select security for trend analysis</div>
        )
    }
};

export default TrendView;