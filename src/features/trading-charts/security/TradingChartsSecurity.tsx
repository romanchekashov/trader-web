import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {MarketBotStartDto} from "../../../common/data/bot/MarketBotStartDto";
import {CHART_MIN_WIDTH, ChartWrapper} from "../../../common/components/chart/ChartWrapper";
import {TradePremise} from "../../../common/data/strategy/TradePremise";
import {SecurityLastInfo} from "../../../common/data/security/SecurityLastInfo";
import {Interval} from "../../../common/data/Interval";
import {TradingPlatform} from "../../../common/data/trading/TradingPlatform";
import {TrendsView} from "../../../common/components/trend/TrendsView";
import {BrokerId} from "../../../common/data/BrokerId";
import {RouteComponentProps} from "react-router-dom";
import {getLastSecurities, getTradePremise} from "../../../common/api/rest/analysisRestApi";
import {ClassCode} from "../../../common/data/ClassCode";
import {Trend} from "../../../common/data/strategy/Trend";
import Notifications from "../../../common/components/notifications/Notifications";
import {FilterDto} from "../../../common/data/FilterDto";
import {StockEventsBrief} from "../../../common/components/share-event/StockEventsBrief";
import {SecurityLastInfoView} from "./info/SecurityLastInfoView";
import TrendView from "../../../common/components/trend/TrendView";
import moment = require("moment");

type RouteParams = {
    secId: string
    premiseStart: string
}

export const TradingChartsSecurity: React.FC<RouteComponentProps<RouteParams>> = ({match}) => {
    const secId: number = parseInt(match.params.secId)
    const start = match.params.premiseStart ? moment(match.params.premiseStart, "DD-MM-YYYY_HH-mm").toDate() : null
    const CHART_HEIGHT = 600
    const [filter, setFilter] = useState<MarketBotStartDto>(null);
    const [securityLastInfo, setSecurityLastInfo] = useState<SecurityLastInfo>(null);
    const [securities, setSecurities] = useState<SecurityLastInfo[]>([]);
    const [premise, setPremise] = useState<TradePremise>(null);
    const [orders, setOrders] = useState(null);
    const [activeTrade, setActiveTrade] = useState(null);
    const [filterDto, setFilterDto] = useState<FilterDto>(null);

    const chart1Ref = useRef(null)
    const chart2Ref = useRef(null)
    const chart3Ref = useRef(null)
    const chart4Ref = useRef(null)
    const [chart2Width, setChart2Width] = useState(CHART_MIN_WIDTH)
    const [chart3Width, setChart3Width] = useState(CHART_MIN_WIDTH)
    const [timeFrame2, setTimeFrame2] = useState<Interval>(Interval.M30)
    const [timeFrame3, setTimeFrame3] = useState<Interval>(Interval.M3)
    const [start1, setStart1] = useState<Date>(start ? moment(start).subtract(30, 'days').hours(9).minutes(0).seconds(0).toDate() : null)
    const [start2, setStart2] = useState<Date>(start ? moment(start).subtract(15, 'days').hours(9).minutes(0).seconds(0).toDate() : null)
    const [start3, setStart3] = useState<Date>(start ? moment(start).subtract(1, 'days').hours(9).minutes(0).seconds(0).toDate() : null)
    const [start4, setStart4] = useState<Date>(start ? moment(start).subtract(1, 'hours').toDate() : null)

    useEffect(() => {
        document.getElementById("main-nav").style.display = "none";
        // document.getElementById("control-panel").style.display = "none";
        document.getElementById("stack").style.display = "none";

        getLastSecurities(secId).then(securities => {
            const security = securities.find(value => value.id === secId)
            if (security) {
                onSecuritySelected(security)
            }
        })

        setTimeout(updateSize, 1000)
        window.addEventListener('resize', updateSize)

        // Specify how to clean up after this effect:
        return function cleanup() {
            window.removeEventListener('resize', updateSize)
        }
    }, [])

    const fetchPremise = (security: SecurityLastInfo, timeFrameTrading: Interval, timeFrameMin: Interval, before?: Date) => {
        getTradePremise({
            brokerId: BrokerId.ALFA_DIRECT,
            tradingPlatform: TradingPlatform.QUIK,
            secId: security.id,
            timeFrameTrading,
            timeFrameMin,
            timestamp: before
        }).then(value => {
            setPremise(value)
        }).catch(reason => {
            console.error(reason)
            fetchPremise(security, timeFrameTrading, timeFrameMin, before)
        })
    }

    const updateSize = () => {
        const offset = 10
        setChart2Width(chart2Ref.current ? chart2Ref.current.clientWidth - offset : CHART_MIN_WIDTH)
        setChart3Width(chart3Ref.current ? chart3Ref.current.clientWidth - offset : CHART_MIN_WIDTH)
    }

    const onSecuritySelected = (secLastInfo: SecurityLastInfo): void => {
        setSecurityLastInfo(secLastInfo)
        setTimeframe(secLastInfo.classCode)
        if (ClassCode.SPBFUT === secLastInfo.classCode) {
            fetchPremise(secLastInfo, Interval.M3, Interval.M1, start)
        } else {
            fetchPremise(secLastInfo, Interval.H4, Interval.M60, start)
        }

        setFilterDto({
            brokerId: BrokerId.ALFA_DIRECT,
            tradingPlatform: TradingPlatform.QUIK,
            secId: secLastInfo.id,
            fetchByWS: false,
            history: true,
            all: false
        })
    }

    const setTimeframe = (classCode: ClassCode): void => {
        if (ClassCode.SPBFUT === classCode) {
            setTimeFrame2(Interval.M30)
            setTimeFrame3(Interval.M3)

            setStart1(moment(start).subtract(60, 'days').hours(9).minutes(0).seconds(0).toDate())
            setStart2(moment(start).subtract(15, 'days').hours(9).minutes(0).seconds(0).toDate())
            setStart3(moment(start).subtract(1, 'days').hours(9).minutes(0).seconds(0).toDate())
            setStart4(moment(start).subtract(1, 'hours').toDate())
        } else {
            setTimeFrame2(Interval.DAY)
            setTimeFrame3(Interval.M60)
        }
    }

    const getTrend = (interval: Interval): Trend => {
        return premise?.analysis?.trends.find(value => value.interval === interval)
    }

    if (!securityLastInfo) return (<div>No Data</div>)

    return (
        <div className="p-grid sample-layout analysis">
            <div className="p-col-2">
                <SecurityLastInfoView security={securityLastInfo}/>
                <Notifications filter={filterDto}
                               security={securityLastInfo}
                               onNotificationSelected={(n) => {
                                   console.log(n)
                               }}
                               viewHeight={800}/>
                <StockEventsBrief secCode={securityLastInfo.secCode}/>
            </div>
            <div className="p-col-10">
                <div className="p-grid">
                    <div className="p-col-12">
                        <TrendsView trends={premise?.analysis?.trends || []}
                                    srLevels={premise?.analysis?.srLevels || []}/>
                    </div>
                    <div className="p-col-12">
                        <div className="p-grid">
                            <div className="p-col-6" style={{padding: '0'}}>
                                <TrendView key={timeFrame2}
                                           trend={premise?.analysis?.trends?.find(value => value.interval === timeFrame2)}
                                           srLevels={premise?.analysis?.srLevels}
                                           position={1}
                                           width={600}
                                           height={600}/>
                            </div>
                            <div className="p-col-6" ref={chart2Ref} style={{padding: '0'}}>
                                <ChartWrapper interval={timeFrame2}
                                              initialNumberOfCandles={500}
                                              start={start2}
                                              onIntervalChanged={() => {
                                              }}
                                              onStartChanged={() => {
                                              }}
                                              width={chart2Width}
                                              chartHeight={CHART_HEIGHT}
                                              security={securityLastInfo}
                                              premise={premise}
                                              trend={getTrend(timeFrame2)}
                                              orders={orders}
                                              activeTrade={activeTrade}
                                              showGrid={true}/>
                            </div>
                            <div className="p-col-6" style={{padding: '0'}}>
                                <TrendView key={timeFrame3}
                                           trend={premise?.analysis?.trends?.find(value => value.interval === timeFrame3)}
                                           srLevels={premise?.analysis?.srLevels}
                                           position={1}
                                           width={600}
                                           height={600}/>
                            </div>
                            <div className="p-col-6" ref={chart3Ref} style={{padding: '0'}}>
                                <ChartWrapper interval={timeFrame3}
                                              initialNumberOfCandles={500}
                                              start={start3}
                                              onIntervalChanged={() => {
                                              }}
                                              onStartChanged={() => {
                                              }}
                                              width={chart3Width}
                                              chartHeight={CHART_HEIGHT}
                                              security={securityLastInfo}
                                              premise={premise}
                                              trend={getTrend(timeFrame3)}
                                              orders={orders}
                                              activeTrade={activeTrade}
                                              showGrid={true}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
