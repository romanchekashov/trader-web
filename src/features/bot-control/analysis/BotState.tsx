import * as React from "react";
import {useEffect} from "react";
import {TradingStrategyTrade} from "../../../common/data/history/TradingStrategyTrade";
import {TradeSystemType} from "../../../common/data/trading/TradeSystemType";
import {Button} from "primereact/button";
import {switchBotStatus} from "../../../common/api/rest/botControlRestApi";
import {TradingStrategyStatus} from "../../../common/data/trading/TradingStrategyStatus";
import {OperationType} from "../../../common/data/OperationType";
import {TradingStrategyResult} from "../../../common/data/history/TradingStrategyResult";
import moment = require("moment");

type Props = {
    tsTrade: TradingStrategyTrade
    tradingStrategyResult: TradingStrategyResult
}

export const BotState: React.FC<Props> = ({tsTrade, tradingStrategyResult}) => {

    useEffect(() => {
        // Specify how to clean up after this effect:
        return function cleanup() {
        };
    }, []);

    return (
        <>
            {
                tradingStrategyResult ?
                    <div className="p-grid bot-control-analysis-info">
                        <div className="p-col-2">
                            <div>{tradingStrategyResult.tradingStrategyData.name}-{tradingStrategyResult.tradingStrategyData.id}</div>
                            <div>{tradingStrategyResult.tradingStrategyData.broker.id}-{tradingStrategyResult.tradingStrategyData.tradingPlatform}</div>
                        </div>
                        <div
                            className="p-col-1">{tradingStrategyResult.tradingStrategyData.security.classCode}-{tradingStrategyResult.tradingStrategyData.security.code}</div>
                        <div className="p-col-2">
                            <div>Deposit: {tradingStrategyResult.tradingStrategyData.deposit}</div>
                            <div>MaxRiskPerTrade: {tradingStrategyResult.tradingStrategyData.maxRiskPerTradeInPercent}%</div>
                            <div>MaxRiskPerSession: {tradingStrategyResult.tradingStrategyData.maxRiskPerSessionInPercent}%</div>
                            <div>T1
                                factor:{tradingStrategyResult.tradingStrategyData.firstTakeProfitPerTradeFactor}</div>
                            <div>T2
                                factor:{tradingStrategyResult.tradingStrategyData.secondTakeProfitPerTradeFactor}</div>
                        </div>
                        <div
                            className="p-col-1">{tradingStrategyResult.tradingStrategyData.systemType}-{tradingStrategyResult.tradingStrategyData.interval} {
                            TradeSystemType.HISTORY === tradingStrategyResult.tradingStrategyData.systemType ?
                                <span>Min TF: {tradingStrategyResult.tradingStrategyData.intervalHistoryMin}</span> : null
                        }</div>
                        <div className="p-col-3">
                            {tradingStrategyResult.tradingStrategyData.status}
                            <Button label="Start" className="p-button-success bot-control-button"
                                    onClick={(e) => switchBotStatus(tradingStrategyResult.tradingStrategyData.id, TradingStrategyStatus.RUNNING)}
                                    disabled={TradingStrategyStatus.FINISHED === tradingStrategyResult.tradingStrategyData.status || TradingStrategyStatus.RUNNING === tradingStrategyResult.tradingStrategyData.status}/>
                            <Button label="Stop" className="p-button-warning bot-control-button"
                                    onClick={(e) => switchBotStatus(tradingStrategyResult.tradingStrategyData.id, TradingStrategyStatus.STOPPED)}
                                    disabled={TradingStrategyStatus.FINISHED === tradingStrategyResult.tradingStrategyData.status || TradingStrategyStatus.STOPPED === tradingStrategyResult.tradingStrategyData.status}/>
                            <Button label="Finish" className="p-button-danger bot-control-button"
                                    onClick={(e) => switchBotStatus(tradingStrategyResult.tradingStrategyData.id, TradingStrategyStatus.FINISHED)}
                                    disabled={TradingStrategyStatus.FINISHED === tradingStrategyResult.tradingStrategyData.status}/>
                        </div>
                        <div className="p-col-2">
                            <div>Start: {moment(tradingStrategyResult.tradingStrategyData.start).format("HH:mm/DD MMM YY")}</div>
                            <div>End: {moment(tradingStrategyResult.tradingStrategyData.end).format("HH:mm/DD MMM YY")}</div>
                        </div>
                    </div>
                    : null
            }

            {
                tsTrade ?
                    <div className="p-grid bot-control-analysis-info">
                        <div className="p-col-1">{tsTrade.id}-{tsTrade.state}</div>
                        <div className="p-col-2" title={"Order Num:" + tsTrade.enterOrderNumber}>
                            <div>
                                Entry: {OperationType.BUY === tsTrade.operation ? 'BUY' : 'SELL'} {tsTrade.entryQuantity} by {tsTrade.entryPrice} (LWP: {tsTrade.enterLastWholesalePrice} -
                                LRP: {tsTrade.enterLastRewardRiskRatioPrice})
                            </div>
                            <div>
                                Real: {OperationType.BUY === tsTrade.operation ? 'BUY' : 'SELL'} {tsTrade.entryRealQuantity} by {tsTrade.entryRealPrice}
                            </div>
                        </div>
                        <div className="p-col-2" title={"Stop Order TransId:" + tsTrade.stopOrderTransId}>
                            Stop: {OperationType.BUY === tsTrade.operation ? 'SELL' : 'BUY'} {tsTrade.entryQuantity} by {tsTrade.stopPrice}
                        </div>
                        <div className="p-col-2" title={"Order Num:" + tsTrade.firstTargetOrderNumber}>
                            <div>
                                T1: {OperationType.BUY === tsTrade.operation ? 'SELL' : 'BUY'} {tsTrade.firstTargetQuantity} by {tsTrade.firstTargetPrice}
                            </div>
                            <div>
                                Real
                                T1: {OperationType.BUY === tsTrade.operation ? 'SELL' : 'BUY'} {tsTrade.firstTargetRealQuantity} by {tsTrade.firstTargetRealPrice}
                            </div>
                        </div>
                        <div className="p-col-2" title={"Order Num:" + tsTrade.secondTargetOrderNumber}>
                            <div>
                                T2: {OperationType.BUY === tsTrade.operation ? 'SELL' : 'BUY'} {tsTrade.secondTargetQuantity} by {tsTrade.secondTargetPrice}
                            </div>
                            <div>
                                Real
                                T2: {OperationType.BUY === tsTrade.operation ? 'SELL' : 'BUY'} {tsTrade.secondTargetRealQuantity} by {tsTrade.secondTargetRealPrice}
                            </div>
                        </div>
                        <div className="p-col-3">
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
};