import * as React from "react";
import {useEffect} from "react";
import {Button} from "primereact/button";
import {TradingStrategyResult} from "../../../../../common/data/history/TradingStrategyResult";
import {TradeSystemType} from "../../../../../common/data/trading/TradeSystemType";
import {switchBotStatus} from "../../../../../app/strategies/botControlRestApi";
import {TradingStrategyStatus} from "../../../../../common/data/trading/TradingStrategyStatus";
import moment = require("moment");
import "./StrategyInfo.css"
import {StrategyStat} from "./StrategyStat";
import {SecurityInfo} from "../../../../../common/data/security/SecurityInfo";

type Props = {
    tradingStrategyResult: TradingStrategyResult
}

export const StrategyInfo: React.FC<Props> = ({tradingStrategyResult}) => {

    if (!tradingStrategyResult) return null

    useEffect(() => {
        // Specify how to clean up after this effect:
        return function cleanup() {
        }
    }, [])

    const momentStartDate = moment(tradingStrategyResult.tradingStrategyData.start)
    const momentEndDate = moment(tradingStrategyResult.tradingStrategyData.end || new Date())

    const security: SecurityInfo = tradingStrategyResult.tradingStrategyData.security

    return (
        <div className="p-grid strategy-info">
            <div className="p-col-6 strategy-info-short-info" style={{paddingBottom: "0"}}>
                <div>{tradingStrategyResult.tradingStrategyData.name}-{tradingStrategyResult.tradingStrategyData.id}</div>
                <div><strong>{security.shortName}</strong>({security.secCode})</div>
                <div>D: {tradingStrategyResult.tradingStrategyData.deposit}</div>
            </div>
            <div className="p-col-6">
                <strong>{tradingStrategyResult.tradingStrategyData.status}</strong>
                <Button label="Start" className="p-button-success bot-control-button"
                        onClick={(e) => switchBotStatus(tradingStrategyResult.tradingStrategyData.id, TradingStrategyStatus.RUNNING)}
                        disabled={TradingStrategyStatus.FINISHED === tradingStrategyResult.tradingStrategyData.status || TradingStrategyStatus.RUNNING === tradingStrategyResult.tradingStrategyData.status}/>
                {/*
                <Button label="Stop" className="p-button-warning bot-control-button"
                        onClick={(e) => switchBotStatus(tradingStrategyResult.tradingStrategyData.id, TradingStrategyStatus.STOPPED)}
                        disabled={TradingStrategyStatus.FINISHED === tradingStrategyResult.tradingStrategyData.status || TradingStrategyStatus.STOPPED === tradingStrategyResult.tradingStrategyData.status}/>
                */}
                <Button label="Finish" className="p-button-danger bot-control-button"
                        onClick={(e) => switchBotStatus(tradingStrategyResult.tradingStrategyData.id, TradingStrategyStatus.FINISHED)}
                        disabled={TradingStrategyStatus.FINISHED === tradingStrategyResult.tradingStrategyData.status}/>
            </div>

            <StrategyStat stat={tradingStrategyResult.stat}/>

            <div className="p-col-12" style={{display: "flex", justifyContent: "space-around", paddingBottom: "0"}}>
                <div>Start: {momentStartDate.format("HH:mm/DD MMM YY")}</div>
                <div>End: {tradingStrategyResult.tradingStrategyData.end ? momentEndDate.format("HH:mm/DD MMM YY") : "-"}</div>
                <div>{moment.duration(momentStartDate.diff(momentEndDate)).humanize()}</div>
            </div>
            <div className="p-col-12" style={{display: "flex"}}>
                <div>{tradingStrategyResult.tradingStrategyData.broker.id}-{tradingStrategyResult.tradingStrategyData.tradingPlatform}</div>
            </div>
            <div className="p-col-12 bot-state-deposit">
                <div>Deposit: {tradingStrategyResult.tradingStrategyData.deposit}</div>
                <div>MaxRiskPerTrade: {tradingStrategyResult.tradingStrategyData.maxRiskPerTradeInPercent}%</div>
                <div>MaxRiskPerSession: {tradingStrategyResult.tradingStrategyData.maxRiskPerSessionInPercent}%</div>
                <div>T1
                    factor:{tradingStrategyResult.tradingStrategyData.firstTakeProfitPerTradeFactor}</div>
                <div>T2
                    factor:{tradingStrategyResult.tradingStrategyData.secondTakeProfitPerTradeFactor}</div>
            </div>
            <div
                className="p-col-12">{tradingStrategyResult.tradingStrategyData.systemType}-{tradingStrategyResult.tradingStrategyData.interval} {
                TradeSystemType.HISTORY === tradingStrategyResult.tradingStrategyData.systemType ?
                    <span>Min TF: {tradingStrategyResult.tradingStrategyData.intervalHistoryMin}</span> : null
            }</div>
        </div>
    )
}