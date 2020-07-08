import * as React from "react";
import {Trade} from "../../../data/Trade";
import {ScatterSeries, Square} from "react-financial-charts/lib/series";
import {OperationType} from "../../../data/OperationType";
import {Candle} from "../../../data/Candle";

const _ = require("lodash");

type Props = {
    candles: Candle[]
    trades: Trade[]
};

export const ChartTrades: React.FC<Props> = ({candles, trades}) => {

    if (!trades || trades.length === 0) return null;

    const calc = _.memoize((trades: Trade[]): any => {
        const buy = {}
        const sell = {}

        let lastCandlesIndex = candles.length - 1

        for (const trade of trades) {
            const tradeTimestamp = trade.dateTime.getTime()
            const map = OperationType.BUY === trade.operation ? buy : sell

            for (; lastCandlesIndex >= 0; lastCandlesIndex--) {
                const candleTimestamp = candles[lastCandlesIndex].timestamp.getTime()
                if (tradeTimestamp > candleTimestamp) {
                    map[candleTimestamp] = trade.price
                    break
                }
            }
        }

        return {buy, sell}
    })

    const calcResult = calc(trades)

    return (
        <>
            {
                calcResult.buy ?
                    <ScatterSeries
                        yAccessor={d => {
                            return calcResult.buy[d.timestamp.getTime()];
                        }}
                        marker={Square}
                        markerProps={{width: 8, stroke: "#43a047", fill: "#43a047"}}/> : null
            }

            {
                calcResult.sell ?
                    <ScatterSeries
                        yAccessor={d => {
                            return calcResult.sell[d.timestamp.getTime()];
                        }}
                        marker={Square}
                        markerProps={{width: 8, stroke: "#e53935", fill: "#e53935"}}/> : null
            }
        </>
    )
};
