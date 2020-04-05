import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {ClassCode} from "../../../api/dto/ClassCode";
import {TradePremise} from "../../../api/dto/strategy/TradePremise";
import {SecurityFuture} from "../../../api/dto/SecurityFuture";
import {ChartWrapper} from "../../../common/chart/ChartWrapper";
import {Interval} from "../../../api/dto/Interval";
import {WebsocketService, WSEvent} from "../../../api/WebsocketService";
import {SecurityLastInfo} from "../../../api/dto/SecurityLastInfo";
import {TradeSetup} from "../../../api/dto/strategy/TradeSetup";
import {TradingPlatform} from "../../../api/dto/TradingPlatform";
import TrendView from "./TrendView";

type Props = {
    classCode: ClassCode
    future: SecurityFuture
};

const AnalysisFutures: React.FC<Props> = ({classCode, future}) => {
    const [premise, setPremise] = useState(null);
    const [tradeSetup, setTradeSetup] = useState(null);
    const [securityLastInfo, setSecurityLastInfo] = useState(null);
    const [chartWidth, setChartWidth] = useState(200);
    const chartRef = useRef(null);

    const updateSize = () => {
        setChartWidth(chartRef.current ? chartRef.current.clientWidth : 200);
    };

    useEffect(() => {
        if (future) {
            WebsocketService.getInstance().send(WSEvent.GET_TRADE_PREMISE_AND_SETUP, {
                brokerId: 1, tradingPlatform: TradingPlatform.QUIK,
                classCode: classCode, secCode: future.secCode,
                timeFrameHigh: Interval.M30, timeFrameTrading: Interval.M5, timeFrameLow: Interval.M1});
        }

        const lastSecuritiesSubscription = WebsocketService.getInstance()
            .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
            .subscribe(value => {
                const securities = value.map(c => {
                    c.timeLastTrade = new Date(c.timeLastTrade);
                    return c;
                });
                if (future) {
                    let security = securities.find(o => o.secCode === future.secCode);
                    setSecurityLastInfo(security);
                }
            });

        const tradePremiseSubscription = WebsocketService.getInstance()
            .on<TradePremise>(WSEvent.TRADE_PREMISE).subscribe(premise => {
                setPremise(premise);
            });

        const tradeSetupSubscription = WebsocketService.getInstance()
            .on<TradeSetup>(WSEvent.TRADE_SETUP).subscribe(setup => {
                setTradeSetup(setup);
            });


        updateSize();
        window.addEventListener('resize', updateSize);
        // Specify how to clean up after this effect:
        return function cleanup() {
            lastSecuritiesSubscription.unsubscribe();
            tradePremiseSubscription.unsubscribe();
            tradeSetupSubscription.unsubscribe();
            window.removeEventListener('resize', updateSize);
        };
    });

    if (future && premise) {
        return (
            <div ref={chartRef}>
                <div>Analysis for {future.secCode}</div>
                <ChartWrapper interval={Interval.M5} numberOfCandles={168} width={chartWidth}
                              security={securityLastInfo} premise={premise}/>
                <TrendView trend={premise.analysis.trend} />
            </div>
        )
    } else {
        return (
            <div>Select security for analysis</div>
        )
    }
};

export default AnalysisFutures;