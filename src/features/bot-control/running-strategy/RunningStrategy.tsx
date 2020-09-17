import * as React from "react";
import {useEffect, useState} from "react";
import "./RunningStrategy.css";
import {TradingStrategyResult} from "../../../common/data/history/TradingStrategyResult";
import {BotState} from "./bot-state/BotState";
import {TradingStrategyTrade} from "../../../common/data/history/TradingStrategyTrade";
import {WebsocketService, WSEvent} from "../../../common/api/WebsocketService";
import {adjustTradingStrategyResultArray} from "../../../common/utils/DataUtils";

type Props = {
    tradingStrategyResult: TradingStrategyResult
}

export const RunningStrategy: React.FC<Props> = ({tradingStrategyResult}) => {

    const [tsTrade, setTsTrade] = useState<TradingStrategyTrade>(null);
    const [tsResult, setTsResult] = useState<TradingStrategyResult>(null);

    useEffect(() => {

        if (tradingStrategyResult) {
            const trades = tradingStrategyResult.tradingStrategyData.trades
            setTsTrade(trades.length > 0 ? trades[0] : null)
            setTsResult(tradingStrategyResult)
        }

        const wsStatusSub = WebsocketService.getInstance()
            .connectionStatus()
            .subscribe(isConnected => {
                if (isConnected) {
                    // informServerAboutRequiredData();
                }
            })

        const tradingStrategiesStatesSubscription = WebsocketService.getInstance()
            .on<TradingStrategyResult[]>(WSEvent.TRADING_STRATEGIES_RESULTS)
            .subscribe(data => {
                const newResults: TradingStrategyResult[] = adjustTradingStrategyResultArray(data)
                for (const result of newResults) {
                    if (tradingStrategyResult.tradingStrategyData.id === result.tradingStrategyData.id) {
                        const trades = result.tradingStrategyData.trades
                        setTsTrade(trades.length > 0 ? trades[0] : null)
                        setTsResult(result)
                    }
                }
            })

        // Specify how to clean up after this effect:
        return function cleanup() {
            if (wsStatusSub) wsStatusSub.unsubscribe()
            if (tradingStrategiesStatesSubscription) tradingStrategiesStatesSubscription.unsubscribe()
        }
    }, [tradingStrategyResult])

    return (
        <>
            <BotState tsTrade={tsTrade}
                      tradingStrategyResult={tsResult}/>
        </>
    )
}