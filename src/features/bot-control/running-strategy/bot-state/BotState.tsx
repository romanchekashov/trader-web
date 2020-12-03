import * as React from "react";
import {useEffect} from "react";
import {TradingStrategyResult} from "../../../../common/data/history/TradingStrategyResult";
import "./BotState.css"
import {StrategyInfo} from "./strategy-info/StrategyInfo";
import {CurrentTrade} from "./current-trade/CurrentTrade";
import {TradeResult} from "./trade-result/TradeResult";
import {TradingStrategyStatus} from "../../../../common/data/trading/TradingStrategyStatus";

type Props = {
    tradingStrategyResult: TradingStrategyResult
}

export const BotState: React.FC<Props> = ({tradingStrategyResult}) => {

    useEffect(() => {
        // Specify how to clean up after this effect:
        return function cleanup() {
        }
    }, [])

    const tsTrade = tradingStrategyResult?.tradingStrategyData?.trades.length > 0
        ? tradingStrategyResult?.tradingStrategyData?.trades[0] : null

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