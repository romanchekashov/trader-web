import * as React from "react";
import {useEffect} from "react";
import {TradingStrategyResult} from "../../../../common/data/history/TradingStrategyResult";
import "./BotState.css"
import {StrategyInfo} from "./strategy-info/StrategyInfo";
import {CurrentTrade} from "./current-trade/CurrentTrade";
import {TradingStrategyStatus} from "../../../../common/data/trading/TradingStrategyStatus";
import {TradeResultTable} from "./trade-result/TradeResultTable";

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
        <div>
            <StrategyInfo tradingStrategyResult={tradingStrategyResult}/>
            {/*{
                TradingStrategyStatus.FINISHED === tradingStrategyResult?.tradingStrategyData?.status
                    ? null : <CurrentTrade tsTrade={tsTrade}/>
            }*/}
            <TradeResultTable tsTrades={tradingStrategyResult?.tradingStrategyData?.trades}/>
        </div>
    )
}