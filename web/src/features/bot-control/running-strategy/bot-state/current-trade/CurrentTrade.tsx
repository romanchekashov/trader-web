import * as React from "react";
import {useEffect} from "react";
import {TradingStrategyTrade} from "../../../../../common/data/history/TradingStrategyTrade";
import {OperationType} from "../../../../../common/data/OperationType";

type Props = {
    tsTrade: TradingStrategyTrade
}

export const CurrentTrade: React.FC<Props> = ({tsTrade}) => {

    useEffect(() => {
        // Specify how to clean up after this effect:
        return function cleanup() {
        }
    }, [])

    return (
        <>
            {
                tsTrade ?
                    <div className="p-grid bot-control-analysis-info" style={{border: "solid 1px", marginBottom: "5px"}}>
                        <div className="p-col-12">{tsTrade.id}-{tsTrade.state}</div>
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
                    : null
            }
        </>
    )
}