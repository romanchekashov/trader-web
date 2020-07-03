import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {Interval} from "../../../common/data/Interval";
import {TrendsView} from "../../../common/components/trend/TrendsView";
import {ChartWrapper} from "../../../common/components/chart/ChartWrapper";
import {Dropdown} from "primereact/dropdown";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {PrimeDropdownItem} from "../../../common/utils/utils";
import MarketState from "../../../common/components/market-state/MarketState";
import SwingStateList from "../../../common/components/swing-state/SwingStateList";
import {TradingStrategyResult} from "../../../common/data/history/TradingStrategyResult";
import {SwingStateDto} from "../../../common/components/swing-state/data/SwingStateDto";
import {MarketStateDto} from "../../../common/components/market-state/data/MarketStateDto";
import {TradeSystemType} from "../../../common/data/trading/TradeSystemType";
import {TradingStrategyTrade} from "../../../common/data/history/TradingStrategyTrade";
import {OperationType} from "../../../common/data/OperationType";
import "./BotControlAnalysis.css";
import {Button} from "primereact/button";
import {switchBotStatus} from "../../../common/api/rest/botControlRestApi";
import {TradingStrategyStatus} from "../../../common/data/trading/TradingStrategyStatus";
import moment = require("moment");

export interface AnalysisState {
    realDepo: boolean
}

type Props = {
    security: any
    tradingStrategyResult: TradingStrategyResult
}

export const BotControlAnalysis: React.FC<Props> = ({security, tradingStrategyResult}) => {
    const timeFrameTradingIntervals = {
        "M1": [Interval.M1],
        "M3": [Interval.M3, Interval.M1],
        "M5": [Interval.M5, Interval.M1],
        "M15": [Interval.M15, Interval.M3],
        "M30": [Interval.M30, Interval.M5],
        "M60": [Interval.M60, Interval.M15],
        "H2": [Interval.H2, Interval.M30],
        "H4": [Interval.H4, Interval.M60],
        "DAY": [Interval.DAY, Interval.H2],
        "WEEK": [Interval.WEEK, Interval.DAY],
        "MONTH": [Interval.MONTH, Interval.WEEK]
    };

    const [start, setStart] = useState(moment().subtract(1, 'days').hours(9).minutes(0).seconds(0).toDate());
    const [timeFrameTrading, setTimeFrameTrading] = useState(null);
    const [timeFrameMin, setTimeFrameMin] = useState(Interval.M1);
    const [premise, setPremise] = useState(null);
    const [orders, setOrders] = useState(null);
    const [activeTrade, setActiveTrade] = useState(null);

    const chartNumbers: PrimeDropdownItem<number>[] = [1, 2].map(val => ({label: "" + val, value: val}));
    const [chartNumber, setChartNumber] = useState(1);

    const [securityLastInfo, setSecurityLastInfo] = useState(null);
    const [chart1Width, setChart1Width] = useState(200);
    const [chart2Width, setChart2Width] = useState(200);
    const [chartAlertsWidth, setChartAlertsWidth] = useState(200);
    const chart1Ref = useRef(null);
    const chart2Ref = useRef(null);
    const chartAlertsRef = useRef(null);
    const [trendLowTF, setTrendLowTF] = useState(null);
    const [filterDto, setFilterDto] = useState(null);
    const [alert, setAlert] = useState(null);
    const [marketStateDto, setMarketStateDto] = useState<MarketStateDto>(null);
    const [swingStates, setSwingStates] = useState<SwingStateDto[]>([]);
    const [hasData, setHasData] = useState(false);
    const [tsTrade, setTsTrade] = useState<TradingStrategyTrade>(null);

    const updateSize = () => {
        setChart1Width(chart1Ref.current ? chart1Ref.current.clientWidth : 200);
        setChart2Width(chart2Ref.current ? chart2Ref.current.clientWidth : 200);
        setChartAlertsWidth(chartAlertsRef.current ? chartAlertsRef.current.clientWidth : 200);
    };

    useEffect(() => {
        if (security && tradingStrategyResult && (tradingStrategyResult.tradePremise || tradingStrategyResult.tradeSetup)) {

            const premise = tradingStrategyResult.tradeSetup ?
                tradingStrategyResult.tradeSetup.premise : tradingStrategyResult.tradePremise;

            setPremise(premise)
            setTimeFrameTrading(premise.analysis.tradingStrategyConfig.timeFrameTrading);
            setMarketStateDto(premise.marketState);
            setSwingStates([premise.swingStateTradingInterval, premise.swingStateMinInterval]);
            setHasData(true);
            setTsTrade(tradingStrategyResult.tradingStrategyData.trades[0]);
        } else {
            setHasData(false);
        }

        setTimeout(updateSize, 1000);
        window.addEventListener('resize', updateSize);

        // Specify how to clean up after this effect:
        return function cleanup() {
            window.removeEventListener('resize', updateSize);
        };
    }, [security, tradingStrategyResult]);

    const onChartNumberChanged = (num: number) => {
        setChartNumber(num);
        setTimeout(updateSize, 1000);
    };

    if (hasData) {

        return (
            <>
                <div className="p-grid bot-control-analysis-info">
                    <div className="p-col-2">
                        <div>{tradingStrategyResult.tradingStrategyData.name}-{tradingStrategyResult.tradingStrategyData.id}</div>
                        <div>{tradingStrategyResult.tradingStrategyData.broker.name}-{tradingStrategyResult.tradingStrategyData.tradingPlatform}</div>
                    </div>
                    <div className="p-col-1">{tradingStrategyResult.tradingStrategyData.security.classCode}-{tradingStrategyResult.tradingStrategyData.security.code}</div>
                    <div className="p-col-2">
                        <div>Deposit: {tradingStrategyResult.tradingStrategyData.deposit}</div>
                        <div>MaxRiskPerTrade: {tradingStrategyResult.tradingStrategyData.maxRiskPerTradeInPercent}%</div>
                        <div>MaxRiskPerSession: {tradingStrategyResult.tradingStrategyData.maxRiskPerSessionInPercent}%</div>
                        <div>T1 factor:{tradingStrategyResult.tradingStrategyData.firstTakeProfitPerTradeFactor}</div>
                        <div>T2 factor:{tradingStrategyResult.tradingStrategyData.secondTakeProfitPerTradeFactor}</div>
                    </div>
                    <div className="p-col-1">{tradingStrategyResult.tradingStrategyData.systemType}-{tradingStrategyResult.tradingStrategyData.interval} {
                        TradeSystemType.HISTORY === tradingStrategyResult.tradingStrategyData.systemType ?
                            <span>Min TF: {tradingStrategyResult.tradingStrategyData.intervalHistoryMin}</span> : null
                    }</div>
                    <div className="p-col-3">
                        {tradingStrategyResult.tradingStrategyData.status}
                        <Button label="Start" className="p-button-success bot-control-button"
                                onClick={(e) => switchBotStatus(tradingStrategyResult.tradingStrategyData.id, TradingStrategyStatus.RUNNING)}
                                disabled={TradingStrategyStatus.FINISHED === tradingStrategyResult.tradingStrategyData.status || TradingStrategyStatus.RUNNING === tradingStrategyResult.tradingStrategyData.status} />
                        <Button label="Stop" className="p-button-warning bot-control-button"
                                onClick={(e) => switchBotStatus(tradingStrategyResult.tradingStrategyData.id, TradingStrategyStatus.STOPPED)}
                                disabled={TradingStrategyStatus.FINISHED === tradingStrategyResult.tradingStrategyData.status || TradingStrategyStatus.STOPPED === tradingStrategyResult.tradingStrategyData.status} />
                        <Button label="Finish" className="p-button-danger bot-control-button"
                                onClick={(e) => switchBotStatus(tradingStrategyResult.tradingStrategyData.id, TradingStrategyStatus.FINISHED)}
                                disabled={TradingStrategyStatus.FINISHED === tradingStrategyResult.tradingStrategyData.status} />
                    </div>
                    <div className="p-col-2">
                        <div>Start: {moment(tradingStrategyResult.tradingStrategyData.start).format("HH:mm/DD MMM YY")}</div>
                        <div>End: {moment(tradingStrategyResult.tradingStrategyData.end).format("HH:mm/DD MMM YY")}</div>
                    </div>
                </div>
                <div className="p-grid bot-control-analysis-info">
                    <div className="p-col-1">{tsTrade.id}-{tsTrade.state}</div>
                    <div className="p-col-2" title={"Order Num:"+tsTrade.enterOrderNumber}>
                        <div>
                            Entry: {OperationType.BUY === tsTrade.operation ? 'BUY' : 'SELL'} {tsTrade.entryQuantity} by {tsTrade.entryPrice} (LWP: {tsTrade.lastWholesalePrice} - LRP: {tsTrade.lastRewardRiskRatioPrice})
                        </div>
                        <div>
                            Real: {OperationType.BUY === tsTrade.operation ? 'BUY' : 'SELL'} {tsTrade.realEntryQuantity} by {tsTrade.realEntryPrice}
                        </div>
                    </div>
                    <div className="p-col-2" title={"Stop Order TransId:"+tsTrade.stopOrderTransId}>
                        Stop: {OperationType.BUY === tsTrade.operation ? 'SELL' : 'BUY'} {tsTrade.entryQuantity} by {tsTrade.stopPrice}
                    </div>
                    <div className="p-col-2" title={"Order Num:"+tsTrade.firstTargetOrderNumber}>
                        <div>
                            T1: {OperationType.BUY === tsTrade.operation ? 'SELL' : 'BUY'} {tsTrade.firstTargetQuantity} by {tsTrade.firstTargetPrice}
                        </div>
                        <div>
                            Real T1: {OperationType.BUY === tsTrade.operation ? 'SELL' : 'BUY'} {tsTrade.realFirstTargetQuantity} by {tsTrade.realFirstTargetPrice}
                        </div>
                    </div>
                    <div className="p-col-2" title={"Order Num:"+tsTrade.secondTargetOrderNumber}>
                        <div>
                            T2: {OperationType.BUY === tsTrade.operation ? 'SELL' : 'BUY'} {tsTrade.secondTargetQuantity} by {tsTrade.secondTargetPrice}
                        </div>
                        <div>
                            Real T2: {OperationType.BUY === tsTrade.operation ? 'SELL' : 'BUY'} {tsTrade.realSecondTargetQuantity} by {tsTrade.realSecondTargetPrice}
                        </div>
                    </div>
                    <div className="p-col-3">
                        <div title={"Order Num:"+tsTrade.killOrderNumber}>
                            Real Kill: {OperationType.BUY === tsTrade.operation ? 'SELL' : 'BUY'} {tsTrade.realKillQuantity} by {tsTrade.realKillPrice}
                        </div>
                        <div title={"Order Num:"+tsTrade.killExceptionOrderNumber}>
                            Real Kill Exception: {OperationType.BUY === tsTrade.operation ? 'SELL' : 'BUY'} {tsTrade.realKillExceptionQuantity} by {tsTrade.realKillExceptionPrice}
                        </div>
                    </div>
                </div>
                <div className="p-grid analysis-head">
                    <div className="p-col-12">
                        <div className="analysis-head-chart-number">
                            <Dropdown value={chartNumber} options={chartNumbers}
                                      onChange={(e) => onChartNumberChanged(e.value)}/>
                        </div>
                    </div>
                    <div className="p-col-12">
                        <DataTable value={[securityLastInfo]}>
                            <Column field="futureTotalDemand" header="Общ спрос"/>
                            <Column field="futureTotalSupply" header="Общ предл"/>
                            <Column field="futureSellDepoPerContract" header="ГО прод"/>
                            <Column field="futureBuyDepoPerContract" header="ГО покуп"/>
                            <Column field="priceLastTrade" header="Цена"/>
                            <Column field="numTrades" header="Кол-во сделок"/>
                        </DataTable>
                    </div>
                </div>
                <TrendsView trends={premise ? premise.analysis.trends : []}/>
                <div className="p-grid" style={{margin: '0'}}>
                    <div className={chartNumber === 2 ? "p-col-7" : "p-col-12"} ref={chart1Ref} style={{padding: '0'}}>
                        <ChartWrapper interval={timeFrameTrading}
                                      initialNumberOfCandles={1000}
                                      onIntervalChanged={interval => {
                                      }}
                                      onStartChanged={start => {
                                      }}
                                      width={chart1Width}
                                      security={security}
                                      premise={premise}
                                      orders={orders}
                                      activeTrade={activeTrade}
                                      showGrid={true}/>
                    </div>
                    {
                        chartNumber === 2 ? (
                            <div className="p-col-5" ref={chart2Ref} style={{padding: '0'}}>
                                <ChartWrapper interval={timeFrameMin}
                                              start={start}
                                              initialNumberOfCandles={1000}
                                              onIntervalChanged={interval => {
                                              }}
                                              onStartChanged={start => {
                                              }}
                                              width={chart2Width}
                                              security={security}
                                              premise={premise}
                                              trend={trendLowTF}
                                              showGrid={true}/>
                            </div>
                        ) : null
                    }
                </div>
                <div className="p-grid">
                    <div className="p-col-12">
                        <MarketState filter={null}
                                     initMarketState={marketStateDto}/>
                    </div>
                    <div className="p-col-12">
                        <SwingStateList filter={null}
                                        initSwingStates={swingStates}/>
                    </div>
                </div>
            </>
        )
    } else {
        return (
            <div>Run bot to see analysis</div>
        )
    }
};