import { Button } from "primereact/button";
import * as React from "react";
import strategiesApi from "../../../../../app/strategies/strategiesApi";
import { TradingStrategyResult } from "../../../../../common/data/history/TradingStrategyResult";
import { TradeSystemType } from "../../../../../common/data/trading/TradeSystemType";
import { TradingStrategyStatus } from "../../../../../common/data/trading/TradingStrategyStatus";
import "./StrategyInfo.css";
import { StrategyStat } from "./StrategyStat";
import moment = require("moment");

type Props = {
    tradingStrategyResult: TradingStrategyResult
}

export const StrategyInfo: React.FC<Props> = ({ tradingStrategyResult }) => {

    if (!tradingStrategyResult?.tradingStrategyData) return null

    const {
        id,
        name,
        start,
        end,
        security,
        deposit,
        status,
        broker,
        tradingPlatform,
        maxRiskPerTradeInPercent,
        maxRiskPerSessionInPercent,
        firstTakeProfitPerTradeFactor,
        secondTakeProfitPerTradeFactor,
        systemType,
        interval,
        intervalHistoryMin
    } = tradingStrategyResult?.tradingStrategyData;

    const momentStartDate = moment(start || new Date())
    const momentEndDate = moment(end || new Date())

    return (
        <div className="p-grid strategy-info">
            <div className="p-col-6 strategy-info-short-info" style={{ paddingBottom: "0" }}>
                <div>{name}-{id}</div>
                <div><strong>{security.shortName}</strong>({security.secCode})</div>
                <div>D: {deposit}</div>
            </div>
            <div className="p-col-6">
                <strong>{status}</strong>
                <Button label="Start" className="p-button-success bot-control-button"
                    onClick={(e) => strategiesApi.switchBotStatus(id, TradingStrategyStatus.RUNNING)}
                    disabled={TradingStrategyStatus.FINISHED === status || TradingStrategyStatus.RUNNING === status} />
                {/*
                <Button label="Stop" className="p-button-warning bot-control-button"
                        onClick={(e) => strategiesApi.switchBotStatus(tradingStrategyResult.tradingStrategyData.id, TradingStrategyStatus.STOPPED)}
                        disabled={TradingStrategyStatus.FINISHED === tradingStrategyResult.tradingStrategyData.status || TradingStrategyStatus.STOPPED === tradingStrategyResult.tradingStrategyData.status}/>
                */}
                <Button label="Finish" className="p-button-danger bot-control-button"
                    onClick={(e) => strategiesApi.switchBotStatus(id, TradingStrategyStatus.FINISHED)}
                    disabled={TradingStrategyStatus.FINISHED === status} />
            </div>

            <StrategyStat stat={tradingStrategyResult.stat} />

            <div className="p-col-12" style={{ display: "flex", justifyContent: "space-around", paddingBottom: "0" }}>
                <div>Start: {momentStartDate.format("HH:mm/DD MMM YY")}</div>
                <div>End: {end ? momentEndDate.format("HH:mm/DD MMM YY") : "-"}</div>
                <div>{moment.duration(momentStartDate.diff(momentEndDate)).humanize()}</div>
            </div>
            <div className="p-col-12" style={{ display: "flex" }}>
                <div>{broker.id}-{tradingPlatform}</div>
            </div>
            <div className="p-col-12 bot-state-deposit">
                <div>Deposit: {deposit}</div>
                <div>MaxRiskPerTrade: {maxRiskPerTradeInPercent}%</div>
                <div>MaxRiskPerSession: {maxRiskPerSessionInPercent}%</div>
                <div>T1
                    factor:{firstTakeProfitPerTradeFactor}</div>
                <div>T2
                    factor:{secondTakeProfitPerTradeFactor}</div>
            </div>
            <div
                className="p-col-12">{systemType}-{interval} {
                    TradeSystemType.HISTORY === systemType ?
                        <span>Min TF: {intervalHistoryMin}</span> : null
                }</div>
        </div>
    )
}