import * as React from "react";
import {useEffect, useState} from "react";
import {TradingStrategyTrade} from "../../../../../common/data/history/TradingStrategyTrade";
import {OperationType} from "../../../../../common/data/OperationType";
import "./TradeResult.css"
import {round100} from "../../../../../common/utils/utils";

type Props = {
    tsTrade: TradingStrategyTrade
}

export const TradeResult: React.FC<Props> = ({tsTrade}) => {

    const [result, setResult] = useState<number>(0)

    useEffect(() => {
        if (tsTrade) {
            setResult(getResult(tsTrade))
        }

        // Specify how to clean up after this effect:
        return function cleanup() {
        }
    }, [tsTrade])

    const getResult = (tsTrade: TradingStrategyTrade) => {
        let buyVal = 0
        let selVal = 0
        for (const t of tsTrade.trades) {
            if (t.operation === OperationType.BUY) {
                buyVal += t.value
            } else {
                selVal += t.value
            }
        }

        return round100(selVal - buyVal)
    }

    let className = "p-grid trade-result"
    if (result > 0) className += " win"
    if (result < 0) className += " loss"

    return (
        <div className={className} style={{border: "solid 1px"}}>
            <div className="p-col-12 trade-result-short-info">
                <div>{tsTrade.id}</div>
                <div>{tsTrade.state}</div>
                <div>{result}</div>
            </div>
            <div className="p-col-12" title={"Order Num:" + tsTrade.enterOrderNumber}>
                <div>
                    Entry: {OperationType.BUY === tsTrade.operation ? 'BUY' : 'SELL'} {tsTrade.entryQuantity} by {tsTrade.entryPrice} (LWP: {tsTrade.enterLastWholesalePrice} -
                    LRP: {tsTrade.enterLastRewardRiskRatioPrice})
                </div>
                <div>
                    Real: {OperationType.BUY === tsTrade.operation ? 'BUY' : 'SELL'} {tsTrade.entryRealQuantity} by {tsTrade.entryRealPrice}
                </div>
            </div>
            <div className="p-col-12" title={"Stop Order TransId:" + tsTrade.stopOrderTransId}>
                Stop: {OperationType.BUY === tsTrade.operation ? 'SELL' : 'BUY'} {tsTrade.entryQuantity} by {tsTrade.stopPrice}
            </div>
            <div className="p-col-12" title={"Order Num:" + tsTrade.firstTargetOrderNumber}>
                <div>
                    T1: {OperationType.BUY === tsTrade.operation ? 'SELL' : 'BUY'} {tsTrade.firstTargetQuantity} by {tsTrade.firstTargetPrice}
                </div>
                <div>
                    Real
                    T1: {OperationType.BUY === tsTrade.operation ? 'SELL' : 'BUY'} {tsTrade.firstTargetRealQuantity} by {tsTrade.firstTargetRealPrice}
                </div>
            </div>
            <div className="p-col-12" title={"Order Num:" + tsTrade.secondTargetOrderNumber}>
                <div>
                    T2: {OperationType.BUY === tsTrade.operation ? 'SELL' : 'BUY'} {tsTrade.secondTargetQuantity} by {tsTrade.secondTargetPrice}
                </div>
                <div>
                    Real
                    T2: {OperationType.BUY === tsTrade.operation ? 'SELL' : 'BUY'} {tsTrade.secondTargetRealQuantity} by {tsTrade.secondTargetRealPrice}
                </div>
            </div>
            <div className="p-col-12">
                <div title={"Order Num:" + tsTrade.killOrderNumber}>
                    Real
                    Kill: {OperationType.BUY === tsTrade.operation ? 'SELL' : 'BUY'} {tsTrade.killRealQuantity} by {tsTrade.killRealPrice}
                </div>
                <div title={"Order Num:" + tsTrade.killExceptionOrderNumber}>
                    Real Kill
                    Exception: {OperationType.BUY === tsTrade.operation ? 'SELL' : 'BUY'} {tsTrade.killExceptionRealQuantity} by {tsTrade.killExceptionRealPrice}
                </div>
            </div>
        </div>
    )
}