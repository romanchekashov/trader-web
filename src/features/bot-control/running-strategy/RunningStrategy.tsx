import * as React from "react";
import {useEffect, useState} from "react";
import "./RunningStrategy.css";
import {TradingStrategyResult} from "../../../common/data/history/TradingStrategyResult";
import {BotState} from "./bot-state/BotState";
import {TradingStrategyTrade} from "../../../common/data/history/TradingStrategyTrade";

type Props = {
    tradingStrategyResult: TradingStrategyResult
}

export const RunningStrategy: React.FC<Props> = ({tradingStrategyResult}) => {

    const [tsTrade, setTsTrade] = useState<TradingStrategyTrade>(null);

    useEffect(() => {

        if (tradingStrategyResult) {
            const trades = tradingStrategyResult.tradingStrategyData.trades
            setTsTrade(trades.length > 0 ? trades[0] : null)
        }

        // Specify how to clean up after this effect:
        return function cleanup() {
        }
    }, [tradingStrategyResult])

    return (
        <>
            <BotState tsTrade={tsTrade}
                      tradingStrategyResult={tradingStrategyResult}/>
        </>
    )
}