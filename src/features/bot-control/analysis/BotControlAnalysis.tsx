import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {Interval} from "../../../common/data/Interval";
import {TrendsView} from "../../../common/components/trend/TrendsView";
import {CHART_MIN_WIDTH, ChartWrapper} from "../../../common/components/chart/ChartWrapper";
import {Dropdown} from "primereact/dropdown";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {PrimeDropdownItem} from "../../../common/utils/utils";
import MarketState from "../../../common/components/market-state/MarketState";
import SwingStateList from "../../../common/components/swing-state/SwingStateList";
import {TradingStrategyResult} from "../../../common/data/history/TradingStrategyResult";
import {SwingStateDto} from "../../../common/components/swing-state/data/SwingStateDto";
import {MarketStateDto} from "../../../common/components/market-state/data/MarketStateDto";
import {TradingStrategyTrade} from "../../../common/data/history/TradingStrategyTrade";
import "./BotControlAnalysis.css";
import {WebsocketService, WSEvent} from "../../../common/api/WebsocketService";
import {SecurityLastInfo} from "../../../common/data/security/SecurityLastInfo";
import {Trade} from "../../../common/data/Trade";
import {getTradePremise} from "../../../common/api/rest/analysisRestApi";
import {BrokerId} from "../../../common/data/BrokerId";
import {TradingPlatform} from "../../../common/data/trading/TradingPlatform";
import moment = require("moment");
import {getTimeFrameHigh, getTimeFrameLow} from "../../../common/utils/TimeFrameChooser";

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
    }

    const [start, setStart] = useState(moment().subtract(1, 'days').hours(9).minutes(0).seconds(0).toDate())
    const [tfHigh, setTFHigh] = useState<Interval>(null)
    const [timeFrameTrading, setTimeFrameTrading] = useState<Interval>(null)
    const [timeFrameMin, setTimeFrameMin] = useState<Interval>(null)
    const [premise, setPremise] = useState(null)
    const [orders, setOrders] = useState(null)
    const [activeTrade, setActiveTrade] = useState(null)

    const chartNumbers: PrimeDropdownItem<number>[] = [1, 2].map(val => ({label: "" + val, value: val}))
    const [chartNumber, setChartNumber] = useState<number>(2)

    const [securityLastInfo, setSecurityLastInfo] = useState(null)
    const [chart1Width, setChart1Width] = useState(CHART_MIN_WIDTH)
    const [chart2Width, setChart2Width] = useState(CHART_MIN_WIDTH)
    const [chartAlertsWidth, setChartAlertsWidth] = useState(CHART_MIN_WIDTH)
    const chart1Ref = useRef(null)
    const chart2Ref = useRef(null)
    const chartAlertsRef = useRef(null)
    const [filterDto, setFilterDto] = useState(null)
    const [alert, setAlert] = useState(null)
    const [marketStateDto, setMarketStateDto] = useState<MarketStateDto>(null)
    const [swingStates, setSwingStates] = useState<SwingStateDto[]>([])
    const [hasData, setHasData] = useState(false)
    const [tsTrade, setTsTrade] = useState<TradingStrategyTrade>(null)
    const [trades, setTrades] = useState<Trade[]>([])
    const [premiseBefore, setPremiseBefore] = useState<Date>(null)

    const updateSize = () => {
        setChart1Width(chart1Ref.current ? chart1Ref.current.clientWidth : CHART_MIN_WIDTH)
        setChart2Width(chart2Ref.current ? chart2Ref.current.clientWidth : CHART_MIN_WIDTH)
        setChartAlertsWidth(chartAlertsRef.current ? chartAlertsRef.current.clientWidth : CHART_MIN_WIDTH)
    }

    useEffect(() => {
        if (security && tradingStrategyResult && (tradingStrategyResult.tradePremise || tradingStrategyResult.tradeSetup)) {

            const premise = tradingStrategyResult.tradeSetup && tradingStrategyResult.tradeSetup.premise ?
                tradingStrategyResult.tradeSetup.premise : tradingStrategyResult.tradePremise

            setPremise(premise)

            const tfTrading = premise.analysis.tradingStrategyConfig.timeFrameTrading
            setTimeFrameTrading(tfTrading)
            setTFHigh(getTimeFrameHigh(tfTrading))
            setTimeFrameMin(getTimeFrameLow(tfTrading))

            setMarketStateDto(premise.marketState)
            setSwingStates([premise.swingStateTradingInterval, premise.swingStateMinInterval])
            setHasData(true)
            const trades = tradingStrategyResult.tradingStrategyData.trades
            setTsTrade(trades.length > 0 ? trades[0] : null)
        } else {
            setHasData(false)
        }

        if (tradingStrategyResult && tradingStrategyResult.tradingStrategyData) {
            const trades = []
            for (const tsTrade of tradingStrategyResult.tradingStrategyData.trades) {
                if (tsTrade.trades && tsTrade.trades.length > 0) {
                    trades.push(...tsTrade.trades)
                }
            }
            setTrades(trades)
        }

        const lastSecuritiesSubscription = WebsocketService.getInstance()
            .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
            .subscribe(securities => {
                if (security) {
                    const newSecurityLastInfo = securities.find(o => o.secCode === security.secCode)
                    if (newSecurityLastInfo) {
                        newSecurityLastInfo.lastTradeTime = new Date(newSecurityLastInfo.lastTradeTime)
                        setSecurityLastInfo(newSecurityLastInfo)
                    }
                }
            })

        setTimeout(updateSize, 1000)
        window.addEventListener('resize', updateSize)

        // Specify how to clean up after this effect:
        return function cleanup() {
            window.removeEventListener('resize', updateSize)
            lastSecuritiesSubscription.unsubscribe()
        }
    }, [security, tradingStrategyResult])

    const onChartNumberChanged = (num: number) => {
        setChartNumber(num)
        setTimeout(updateSize, 1000)
    }

    const getAdjustedStart = (): Date => {
        if (tradingStrategyResult?.tradingStrategyData) {
            let mDate = moment(tradingStrategyResult.tradingStrategyData.start).subtract(1, 'days')
            while (mDate.day() === 0 || mDate.day() === 6) mDate.subtract(1, 'days')
            return mDate.toDate()
        }
    }

    const fetchPremise = (timeFrameTrading: Interval, before?: Date) => {
        getTradePremise({
            brokerId: BrokerId.ALFA_DIRECT,
            tradingPlatform: TradingPlatform.QUIK,
            secId: security.id,
            timeFrameTrading,
            timeFrameMin,
            timestamp: before
        }).then(setPremise).catch(reason => {
            fetchPremise(timeFrameTrading, before)
        })
    }

    const onPremiseBeforeChanged = (before: Date) => {
        setPremiseBefore(before)
        fetchPremise(timeFrameTrading, before)
    }

    if (!hasData) return (<div>Select Trading Strategy to see analysis.</div>)

    return (
        <>
            <div className="p-grid analysis-head">
                <div className="p-col-12">
                    <div className="analysis-head-chart-number">
                        <Dropdown value={chartNumber} options={chartNumbers}
                                  onChange={(e) => onChartNumberChanged(e.value)}/>
                    </div>
                </div>
                <div className="p-col-12">
                    <DataTable value={[securityLastInfo]}>
                        <Column field="totalDemand" header="Общ спрос"/>
                        <Column field="totalSupply" header="Общ предл"/>
                        <Column field="futureSellDepoPerContract" header="ГО прод"/>
                        <Column field="futureBuyDepoPerContract" header="ГО покуп"/>
                        <Column field="lastTradePrice" header="Цена"/>
                        <Column field="numTradesToday" header="Кол-во сделок"/>
                    </DataTable>
                </div>
            </div>
            <TrendsView trends={premise ? premise.analysis.trends : []}/>
            <div className="p-grid" style={{margin: '0'}}>
                <div className="p-col-12" ref={chart1Ref} style={{padding: '0'}}>
                    <ChartWrapper interval={timeFrameTrading}
                                  initialNumberOfCandles={1000}
                                  start={getAdjustedStart()}
                                  onPremiseBeforeChanged={onPremiseBeforeChanged}
                                  onIntervalChanged={interval => {
                                  }}
                                  onStartChanged={start => {
                                  }}
                                  width={chart1Width}
                                  security={security}
                                  premise={premise}
                                  orders={orders}
                                  trades={trades}
                                  activeTrade={activeTrade}
                                  showGrid={true}/>
                </div>
                {
                    chartNumber === 2 ? (
                        <div className="p-col-12" ref={chart2Ref} style={{padding: '0'}}>
                            <ChartWrapper interval={tfHigh}
                                          initialNumberOfCandles={200}
                                          onIntervalChanged={interval => {
                                          }}
                                          onStartChanged={start => {
                                          }}
                                          width={chart2Width}
                                          security={security}
                                          premise={premise}
                                          trades={trades}
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
}