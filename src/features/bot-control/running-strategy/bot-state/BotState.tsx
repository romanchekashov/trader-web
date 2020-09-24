import * as React from "react";
import {useEffect} from "react";
import {TradingStrategyTrade} from "../../../../common/data/history/TradingStrategyTrade";
import {TradingStrategyResult} from "../../../../common/data/history/TradingStrategyResult";
import "./BotState.css"
import {StrategyInfo} from "./strategy-info/StrategyInfo";
import {CurrentTrade} from "./current-trade/CurrentTrade";
import {TradeResult} from "./trade-result/TradeResult";
import {TradingStrategyStatus} from "../../../../common/data/trading/TradingStrategyStatus";

type Props = {
    tsTrade: TradingStrategyTrade
    tradingStrategyResult: TradingStrategyResult
}

export const BotState: React.FC<Props> = ({tsTrade, tradingStrategyResult}) => {

    useEffect(() => {
        // Specify how to clean up after this effect:
        return function cleanup() {
        }
    }, [])

    return (
        <>
            <StrategyInfo tradingStrategyResult={tradingStrategyResult}/>
            {
                TradingStrategyStatus.FINISHED === tradingStrategyResult?.tradingStrategyData?.status
                    ? null : <CurrentTrade tsTrade={tsTrade}/>
            }
            {
                tradingStrategyResult && tradingStrategyResult.tradingStrategyData ?
                    tradingStrategyResult.tradingStrategyData.trades
                        .map(trade => <TradeResult tsTrade={trade}/>)
                    : null
            }
        </>
    )
}