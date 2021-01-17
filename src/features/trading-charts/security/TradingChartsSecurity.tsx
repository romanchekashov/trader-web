import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {CHART_MIN_WIDTH, ChartWrapper} from "../../../common/components/chart/ChartWrapper";
import {TradePremise} from "../../../common/data/strategy/TradePremise";
import {SecurityLastInfo} from "../../../common/data/security/SecurityLastInfo";
import {Interval} from "../../../common/data/Interval";
import {TradingPlatform} from "../../../common/data/trading/TradingPlatform";
import {TrendsView} from "../../../common/components/trend/TrendsView";
import {BrokerId} from "../../../common/data/BrokerId";
import {getMoexOpenInterests, getTradePremise} from "../../../common/api/rest/analysisRestApi";
import {ClassCode} from "../../../common/data/ClassCode";
import {Trend} from "../../../common/data/strategy/Trend";
import Notifications from "../../../common/components/notifications/Notifications";
import {FilterDto} from "../../../common/data/FilterDto";
import {StockEventsBrief} from "../../../common/components/share-event/StockEventsBrief";
import {SecurityLastInfoView} from "./info/SecurityLastInfoView";
import TrendViewChart from "../../../common/components/trend/TrendViewChart";
import {MoexOpenInterest} from "../../../common/data/open-interest/MoexOpenInterest";
import {MoexOpenInterestChart} from "../../analysis/analysis/moex-open-interest/MoexOpenInterestChart";
import moment = require("moment");

type Props = {
    securityLastInfo: SecurityLastInfo
    start: Date,
    layout: number
}

export const TradingChartsSecurity: React.FC<Props> = ({securityLastInfo, start, layout}) => {
    const CHART_HEIGHT = 600
    const [premise, setPremise] = useState<TradePremise>(null);
    const [orders, setOrders] = useState(null);
    const [activeTrade, setActiveTrade] = useState(null);
    const [filterDto, setFilterDto] = useState<FilterDto>(null);

    const chart1Ref1 = useRef(null)
    const [chart1Width1, setChart1Width1] = useState<number>(CHART_MIN_WIDTH)
    const [timeFrame1, setTimeFrame1] = useState<Interval>(Interval.DAY)

    const infoRef = useRef(null)
    const [infoWidth, setInfoWidth] = useState<number>(200)

    const chart2Ref1 = useRef(null)
    const chart2Ref = useRef(null)
    const chart3Ref1 = useRef(null)
    const chart3Ref = useRef(null)
    const [chart2Width1, setChart2Width1] = useState<number>(CHART_MIN_WIDTH)
    const [chart2Width, setChart2Width] = useState<number>(CHART_MIN_WIDTH)
    const [chart3Width1, setChart3Width1] = useState<number>(CHART_MIN_WIDTH)
    const [chart3Width, setChart3Width] = useState<number>(CHART_MIN_WIDTH)
    const [timeFrame2, setTimeFrame2] = useState<Interval>(Interval.M30)
    const [timeFrame3, setTimeFrame3] = useState<Interval>(Interval.M3)
    const [start1, setStart1] = useState<Date>(start ? moment(start).subtract(30, 'days').hours(9).minutes(0).seconds(0).toDate() : null)
    const [start2, setStart2] = useState<Date>(start ? moment(start).subtract(15, 'days').hours(9).minutes(0).seconds(0).toDate() : null)
    const [start3, setStart3] = useState<Date>(start ? moment(start).subtract(1, 'days').hours(9).minutes(0).seconds(0).toDate() : null)
    const [start4, setStart4] = useState<Date>(start ? moment(start).subtract(1, 'hours').toDate() : null)

    const [moexOpenInterestsForDays, setMoexOpenInterestsForDays] = useState<MoexOpenInterest[]>([])

    useEffect(() => {
        if (securityLastInfo) onSecuritySelected(securityLastInfo)

        setTimeout(updateSize, 1000)
        window.addEventListener('resize', updateSize)

        // Specify how to clean up after this effect:
        return function cleanup() {
            window.removeEventListener('resize', updateSize)
        }
    }, [securityLastInfo])

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
        setInfoWidth(infoRef.current ? infoRef.current.clientWidth - offset : 200)

        setChart1Width1(chart1Ref1.current ? chart1Ref1.current.clientWidth - offset : CHART_MIN_WIDTH)
        setChart2Width1(chart2Ref1.current ? chart2Ref1.current.clientWidth - offset : CHART_MIN_WIDTH)
        setChart2Width(chart2Ref.current ? chart2Ref.current.clientWidth - offset : CHART_MIN_WIDTH)
        setChart3Width1(chart3Ref1.current ? chart3Ref1.current.clientWidth - offset : CHART_MIN_WIDTH)
        setChart3Width(chart3Ref.current ? chart3Ref.current.clientWidth - offset : CHART_MIN_WIDTH)
    }

    const onSecuritySelected = (secLastInfo: SecurityLastInfo): void => {
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

        updateSize()

        if (ClassCode.SPBFUT === secLastInfo.classCode) {
            const from = moment().subtract(20, 'days').format("YYYY-MM-DD")

            getMoexOpenInterests(secLastInfo.classCode, secLastInfo.secCode, from)
                .then(setMoexOpenInterestsForDays)
        }
    }

    const setTimeframe = (classCode: ClassCode): void => {
        if (ClassCode.SPBFUT === classCode) {
            setTimeFrame1(Interval.DAY)
            setTimeFrame2(Interval.M30)
            setTimeFrame3(Interval.M3)

            setStart1(moment(start).subtract(60, 'days').hours(9).minutes(0).seconds(0).toDate())
            setStart2(moment(start).subtract(15, 'days').hours(9).minutes(0).seconds(0).toDate())
            setStart3(moment(start).subtract(1, 'days').hours(9).minutes(0).seconds(0).toDate())
            setStart4(moment(start).subtract(1, 'hours').toDate())
        } else {
            setTimeFrame1(Interval.MONTH)
            setTimeFrame2(Interval.DAY)
            setTimeFrame3(Interval.M60)
        }
    }

    const getTrend = (interval: Interval): Trend => {
        return premise?.analysis?.trends.find(value => value.interval === interval)
    }

    if (!securityLastInfo) return (<div>No Data</div>)

    // console.log(chart2Width1, chart2Width, chart3Width1, chart3Width)
    let chartsClassName = 'p-col-10'
    if (layout === 2) {
        chartsClassName = 'p-col-8'
    }

    return (
        <div id={"trading-chart-security-" + securityLastInfo.id} className="p-grid sample-layout analysis">

            <div className={chartsClassName}>
                <div className="p-grid">
                    <div className="p-col-12">
                        <TrendsView trends={premise?.analysis?.trends || []}
                                    srLevels={premise?.analysis?.srLevels || []}/>
                    </div>
                    <div className="p-col-12">
                        <div className="p-grid">
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
                            <div className="p-col-4" ref={chart1Ref1} style={{padding: '0'}}>
                                <TrendViewChart key={timeFrame1}
                                                trend={premise?.analysis?.trends?.find(value => value.interval === timeFrame1)}
                                                srLevels={premise?.analysis?.srLevels}
                                                width={chart1Width1}
                                                height={600}/>
                            </div>
                            <div className="p-col-4" ref={chart2Ref1} style={{padding: '0'}}>
                                <TrendViewChart key={timeFrame2}
                                                trend={premise?.analysis?.trends?.find(value => value.interval === timeFrame2)}
                                                srLevels={premise?.analysis?.srLevels}
                                                width={chart2Width1}
                                                height={600}/>
                            </div>
                            <div className="p-col-4" ref={chart3Ref1} style={{padding: '0'}}>
                                <TrendViewChart key={timeFrame3}
                                                trend={premise?.analysis?.trends?.find(value => value.interval === timeFrame3)}
                                                srLevels={premise?.analysis?.srLevels}
                                                width={chart3Width1}
                                                height={600}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {
                layout === 2 ?
                    <div className="p-col-8">
                        <div className="p-grid">
                            {/* <div className="p-col-3">
                                <SecurityLastInfoView security={securityLastInfo} />
                            </div> */}
                            <div className="p-col-4">
                                <Notifications filter={filterDto}
                                               security={securityLastInfo}
                                               onNotificationSelected={(n) => {
                                                   console.log(n)
                                               }}
                                               viewHeight={400}
                                               itemSize={70}/>
                            </div>
                            <div className="p-col-4">
                                <StockEventsBrief secCode={securityLastInfo.secCode} height={400}/>
                            </div>
                        </div>
                    </div>
                    :
                    <div className="p-col-2" ref={infoRef}>
                        <SecurityLastInfoView security={securityLastInfo}/>
                        {
                            ClassCode.SPBFUT === securityLastInfo?.classCode ?
                                <MoexOpenInterestChart moexOpenInterests={moexOpenInterestsForDays}
                                                       title={"Open Interest history"}
                                                       dateTimeFormat={"DD MMM YY"}
                                                       width={infoWidth}
                                                       height={300}/>
                                : null
                        }
                        <div style={{marginBottom: '5px'}}></div>
                        <Notifications filter={filterDto}
                                       security={securityLastInfo}
                                       onNotificationSelected={(n) => {
                                           console.log(n)
                                       }}
                                       viewHeight={400}/>
                        <StockEventsBrief secCode={securityLastInfo.secCode} height={400}/>
                    </div>
            }
        </div>
    )
}
