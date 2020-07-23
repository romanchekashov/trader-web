import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {getFilterData} from "../../common/api/rest/botControlRestApi";
import {MarketBotFilterDataDto} from "../../common/data/bot/MarketBotFilterDataDto";
import Filter from "../analysis/filter/Filter";
import {MarketBotStartDto} from "../../common/data/bot/MarketBotStartDto";
import {ClassCode} from "../../common/data/ClassCode";
import {ChartWrapper} from "../../common/components/chart/ChartWrapper";
import {Security} from "../../common/data/Security";
import {TradePremise} from "../../common/data/strategy/TradePremise";
import {SecurityLastInfo} from "../../common/data/SecurityLastInfo";
import {Interval} from "../../common/data/Interval";
import {WebsocketService, WSEvent} from "../../common/api/WebsocketService";
import {adjustTradePremise} from "../../common/utils/DataUtils";
import {Order} from "../../common/data/Order";
import {ActiveTrade} from "../../common/data/ActiveTrade";
import {TradingChartsSecurities} from "./TradingChartsSecurities";
import {TradingPlatform} from "../../common/data/TradingPlatform";

export const TradingChartsPage: React.FC = () => {
    const [filterData, setFilterData] = useState<MarketBotFilterDataDto>(null);
    const [filter, setFilter] = useState<MarketBotStartDto>(null);
    const [securityLastInfo, setSecurityLastInfo] = useState<SecurityLastInfo>(null);
    const [securities, setSecurities] = useState<SecurityLastInfo[]>([]);
    const [premise, setPremise] = useState<TradePremise>(null);
    const [orders, setOrders] = useState(null);
    const [activeTrade, setActiveTrade] = useState(null);

    const chart1Ref = useRef(null);
    const chart2Ref = useRef(null);
    const chart3Ref = useRef(null);
    const chart4Ref = useRef(null);
    const [chart1Width, setChart1Width] = useState(200);
    const [chart2Width, setChart2Width] = useState(200);
    const [chart3Width, setChart3Width] = useState(200);
    const [chart4Width, setChart4Width] = useState(200);
    const [timeFrame1, setTimeFrame1] = useState<Interval>(Interval.M3);
    const [timeFrame2, setTimeFrame2] = useState<Interval>(Interval.DAY);
    const [timeFrame3, setTimeFrame3] = useState<Interval>(Interval.M30);
    const [timeFrame4, setTimeFrame4] = useState<Interval>(Interval.M1);

    useEffect(() => {
        getFilterData(false).then(setFilterData);

        const wsStatusSub = WebsocketService.getInstance()
            .connectionStatus()
            .subscribe(isConnected => {
                if (isConnected && securityLastInfo) {
                    informServerAboutRequiredData(securityLastInfo);
                }
            });

        const lastSecuritiesSubscription = WebsocketService.getInstance()
            .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
            .subscribe(securities => {
                for (const sec of securities) {
                    sec.lastTradeTime = new Date(sec.lastTradeTime);
                }
                setSecurities(securities)
            });

        const tradePremiseSubscription = WebsocketService.getInstance()
            .on<TradePremise>(WSEvent.TRADE_PREMISE)
            .subscribe(newPremise => {
                adjustTradePremise(newPremise);
                setPremise(newPremise);
            });

        const ordersSetupSubscription = WebsocketService.getInstance()
            .on<Order[]>(WSEvent.ORDERS)
            .subscribe(setOrders);

        const activeTradeSubscription = WebsocketService.getInstance()
            .on<ActiveTrade[]>(WSEvent.ACTIVE_TRADES)
            .subscribe(activeTrades => {
                if (securityLastInfo) {
                    const activeTrade = activeTrades
                        .find(at => at && at.classCode === securityLastInfo.classCode && at.secCode === securityLastInfo.secCode);
                    setActiveTrade(activeTrade);
                }
            });


        setTimeout(updateSize, 1000);
        window.addEventListener('resize', updateSize);

        // Specify how to clean up after this effect:
        return function cleanup() {
            window.removeEventListener('resize', updateSize);
            wsStatusSub.unsubscribe();
            lastSecuritiesSubscription.unsubscribe();
            tradePremiseSubscription.unsubscribe();
            ordersSetupSubscription.unsubscribe();
            activeTradeSubscription.unsubscribe();
        };
    }, []);

    const updateSize = () => {
        setChart1Width(chart1Ref.current ? chart1Ref.current.clientWidth : 200);
        setChart2Width(chart2Ref.current ? chart2Ref.current.clientWidth : 200);
        setChart3Width(chart3Ref.current ? chart3Ref.current.clientWidth : 200);
        setChart4Width(chart4Ref.current ? chart4Ref.current.clientWidth : 200);
    };

    const informServerAboutRequiredData = (securityLastInfo: SecurityLastInfo): void => {
        if (securityLastInfo) {
            WebsocketService.getInstance().send(WSEvent.GET_TRADE_PREMISE_AND_SETUP, {
                brokerId: 1,
                tradingPlatform: TradingPlatform.QUIK,
                classCode: securityLastInfo.classCode,
                secCode: securityLastInfo.secCode,
                timeFrameTrading: timeFrame1,
                timeFrameMin: timeFrame4
            });
            WebsocketService.getInstance().send(WSEvent.GET_TRADES_AND_ORDERS, securityLastInfo.secCode);
        }
    };

    const onStart = (filter: MarketBotStartDto): void => {
        setFilter(filter)
    }

    const onSecuritySelected = (secLastInfo: SecurityLastInfo): void => {
        setSecurityLastInfo(secLastInfo)
        informServerAboutRequiredData(secLastInfo)
    }

    return (
        <div className="p-grid sample-layout analysis">
            <div className="p-col-12" style={{padding: 0}}>
                <Filter filter={filterData} onStart={onStart}/>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-6">
                        <TradingChartsSecurities classCode={filter?.classCode}
                                                 securities={securities}
                                                 onSelectRow={onSecuritySelected} />
                    </div>
                    <div className="p-col-6" ref={chart1Ref} style={{padding: '0'}}>
                        <ChartWrapper interval={timeFrame1}
                                      initialNumberOfCandles={500}
                                      onIntervalChanged={()=>{}}
                                      onStartChanged={()=>{}}
                                      width={chart1Width}
                                      chartHeight={400}
                                      security={securityLastInfo}
                                      premise={premise}
                                      orders={orders}
                                      activeTrade={activeTrade}
                                      showGrid={true}/>
                    </div>
                    <div className="p-col-4" ref={chart2Ref} style={{padding: '0'}}>
                        <ChartWrapper interval={timeFrame2}
                                      initialNumberOfCandles={500}
                                      onIntervalChanged={()=>{}}
                                      onStartChanged={()=>{}}
                                      width={chart2Width}
                                      chartHeight={400}
                                      security={securityLastInfo}
                                      premise={premise}
                                      orders={orders}
                                      activeTrade={activeTrade}
                                      showGrid={true}/>
                    </div>
                    <div className="p-col-4" ref={chart3Ref} style={{padding: '0'}}>
                        <ChartWrapper interval={timeFrame3}
                                      initialNumberOfCandles={500}
                                      onIntervalChanged={()=>{}}
                                      onStartChanged={()=>{}}
                                      width={chart3Width}
                                      chartHeight={400}
                                      security={securityLastInfo}
                                      premise={premise}
                                      orders={orders}
                                      activeTrade={activeTrade}
                                      showGrid={true}/>
                    </div>
                    <div className="p-col-4" ref={chart4Ref} style={{padding: '0'}}>
                        <ChartWrapper interval={timeFrame4}
                                      initialNumberOfCandles={120}
                                      onIntervalChanged={()=>{}}
                                      onStartChanged={()=>{}}
                                      width={chart4Width}
                                      chartHeight={400}
                                      security={securityLastInfo}
                                      premise={premise}
                                      orders={orders}
                                      activeTrade={activeTrade}
                                      showGrid={true}/>
                    </div>
                </div>
            </div>
        </div>
    );
};
