import * as React from "react";
import {Trade} from "../../../data/Trade";
import {OperationType} from "../../../data/OperationType";
import {Candle} from "../../../data/Candle";
import {Annotate, buyPath, sellPath, SvgPathAnnotation} from "react-financial-charts/lib/annotation";
import {LineSeries} from "react-financial-charts/lib/series";
import {round100} from "../../../utils/utils";

const _ = require("lodash");

type Props = {
    candles: Candle[]
    trades: Trade[]
};

export const ChartTrades: React.FC<Props> = ({candles, trades}) => {

    if (!trades || trades.length === 0) return null

    const DELS = {
        'M1': 1,
        'M3': 3,
        'M5': 5,
        'M10': 10,
        'M15': 15,
        'M30': 30
    }

    const red = '#FF0000'
    const green = '#00FF00'

    const defaultAnnotationProps = {
        onClick: console.log.bind(console),
    }

    const longAnnotationProps = {
        ...defaultAnnotationProps,
        y: ({yScale, datum}) => yScale(datum.low),
        fill: "#006517",
        path: buyPath,
        tooltip: "Go long",
    };

    const shortAnnotationProps = {
        ...defaultAnnotationProps,
        y: ({yScale, datum}) => yScale(datum.high),
        fill: "#FF0000",
        path: sellPath,
        tooltip: "Go short",
    }

    const getResult = (trades: Trade[]) => {
        let buyVal = 0
        let selVal = 0
        for (const t of trades) {
            if (t.operation === OperationType.BUY) {
                buyVal += t.value
            } else {
                selVal += t.value
            }
        }

        return round100(selVal - buyVal)
    }

    const calc = _.memoize((trades: Trade[]): any => {
        const buy = {}
        const sell = {}
        const del = DELS[candles[0].interval]
        const groups = {}

        for (const trade of trades) {
            const dateTime = new Date(trade.dateTime.getTime())
            let minutes = dateTime.getMinutes()
            while (minutes % del !== 0) minutes--

            dateTime.setMinutes(minutes)
            dateTime.setSeconds(0)

            if (OperationType.BUY === trade.operation) {
                buy[dateTime.getTime()] = trade.price
            } else {
                sell[dateTime.getTime()] = trade.price
            }

            if (!groups[trade.tradingStrategyTradeId]) {
                groups[trade.tradingStrategyTradeId] = {
                    id: trade.tradingStrategyTradeId,
                    points: {},
                    trades: []
                }
            }
            groups[trade.tradingStrategyTradeId].points[dateTime.getTime()] = trade.price
            groups[trade.tradingStrategyTradeId].trades.push(trade)
        }

        Object.values(groups).forEach(o => o["result"] = getResult(o["trades"]))

        return {buy, sell, groups}
    })

    const calcResult = calc(trades)

    return (
        <>
            <Annotate with={SvgPathAnnotation}
                      when={d => calcResult.buy[d.timestamp.getTime()]}
                      usingProps={longAnnotationProps}/>

            <Annotate with={SvgPathAnnotation}
                      when={d => calcResult.sell[d.timestamp.getTime()]}
                      usingProps={shortAnnotationProps}/>

            {
                Object.values(calcResult.groups).map(o => {
                    return <LineSeries key={o['id']}
                                       yAccessor={d => o['points'][d.timestamp.getTime()]}
                                       stroke={o["result"] > 0 ? green : red}
                                       strokeDasharray={"Dash"}
                                       strokeWidth={2}
                                       connectNulls={true}/>
                })
            }
        </>
    )
};
