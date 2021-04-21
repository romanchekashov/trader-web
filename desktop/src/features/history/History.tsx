import * as React from "react";
import {ChartWrapper} from "../../common/components/chart/ChartWrapper";
import {Interval} from "../../common/data/Interval";
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import {Securities} from "../../components/securities/Securities";
import {SecurityLastInfo} from "../../common/data/SecurityLastInfo";
import {SubscriptionLike} from "rxjs";
import {WebsocketService, WSEvent} from "../../common/api/WebsocketService";
import {TradingPlatform} from "../../common/data/TradingPlatform";
import {TradePremise} from "../../common/data/strategy/TradePremise";
import {ControlPanel} from "../../components/control-panel/ControlPanel";
import {TradeSetup} from "../../common/data/strategy/TradeSetup";
import {Order} from "../../common/data/Order";
import {Stack} from "../../components/stack/Stack";
import {ActiveTrade} from "../../common/data/ActiveTrade";
import {SessionTradeResult} from "../../common/data/SessionTradeResult";
import {Calendar} from "primereact/components/calendar/Calendar";
import {Button} from "primereact/components/button/Button";
import {ClassCode} from "../../common/data/ClassCode";
import {startHistory, stopHistory} from "../../common/api/rest/historyRestApi";
import {SecurityVolume} from "../../common/data/SecurityVolume";
import {Trend} from "../../common/data/strategy/Trend";
import moment = require("moment");
import {TradeStrategyAnalysisFilterDto} from "../../common/data/TradeStrategyAnalysisFilterDto";
import {getTradePremise} from "../../common/api/rest/analysisRestApi";

type Props = {};

type States = {
    chart1Width: number
    chart2Width: number
    securities: SecurityLastInfo[]
    security: SecurityLastInfo
    premise: TradePremise
    setup: TradeSetup
    orders: Order[]
    activeTrade: ActiveTrade
    result: SessionTradeResult
    start: Date
    end: Date
    timeInHistory: Date
    volumes: SecurityVolume[]
    trendLowTF: Trend
};

export class History extends React.Component<Props, States> {

    chart1Ref: any;
    chart2Ref: any;
    private setIntervalIdForFetchTradePremise: NodeJS.Timeout = null;
    private lastSecuritiesSubscription: SubscriptionLike = null;
    private tradePremiseSubscription: SubscriptionLike = null;
    private tradeSetupSubscription: SubscriptionLike = null;
    private ordersSetupSubscription: SubscriptionLike = null;
    private activeTradeSubscription: SubscriptionLike = null;
    private trendLowTFSubscription: SubscriptionLike = null;
    private wsStatusSub: SubscriptionLike = null;

    timeFrameHigh = Interval.M30;
    timeFrameTrading = Interval.M5;
    timeFrameLow = Interval.M1;

    constructor(props) {
        super(props);
        this.state = { chart1Width: 200, chart2Width: 200, security: null, securities: [], premise: null, setup: null,
            orders: [], activeTrade: null, result: null, volumes: [],
            start: moment().hours(10).minutes(0).seconds(0).toDate(),
            end: moment().hours(23).minutes(50).seconds(0).toDate(),
            timeInHistory: null,
            trendLowTF: null };
        this.chart1Ref = React.createRef();
        this.chart2Ref = React.createRef();
    }

    fetchTradePremise = () => {
        const { security } = this.state;

        if (security) {
            getTradePremise({brokerId: 1, tradingPlatform: TradingPlatform.QUIK,
                classCode: security.classCode, secCode: security.secCode,
                timeFrameHigh: this.timeFrameHigh,
                timeFrameTrading: this.timeFrameTrading,
                timeFrameLow: this.timeFrameLow})
                .then(premise => {
                    this.setState({premise});
                })
                .catch(reason => console.log);
        }
    };

    componentDidMount = (): void => {
        this.updateSize();
        window.addEventListener('resize', this.updateSize);

        this.lastSecuritiesSubscription = WebsocketService.getInstance()
            .on<SecurityLastInfo[]>(WSEvent.HISTORY_LAST_SECURITIES)
            .subscribe(value => {
                if (value.length > 0) {
                    const securities = value.map(c => {
                        c.timeLastTrade = new Date(c.timeLastTrade);
                        return c;
                    });
                    let security = this.state.security;
                    if (security) {
                        security = securities.find(o => o.secCode === security.secCode);
                    }
                    // console.log(securities[0]);
                    this.setState({ securities, security, timeInHistory: security?.timeLastTrade });
                } else {
                    this.setState({ securities: [], security: null, timeInHistory: null });
                }
            });

        this.tradePremiseSubscription = WebsocketService.getInstance()
            .on<TradePremise>(WSEvent.HISTORY_TRADE_PREMISE).subscribe(premise => {
                this.setState({premise});
            });

        this.tradeSetupSubscription = WebsocketService.getInstance()
            .on<TradeSetup>(WSEvent.HISTORY_TRADE_SETUP).subscribe(setup => {
                console.log(setup);
                this.setState({setup});
            });

        this.ordersSetupSubscription = WebsocketService.getInstance()
            .on<Order[]>(WSEvent.HISTORY_ORDERS).subscribe(orders => {
                this.setState({orders});
            });

        this.activeTradeSubscription = WebsocketService.getInstance()
            .on<ActiveTrade>(WSEvent.ACTIVE_TRADE).subscribe(activeTrade => {
                this.setState({activeTrade});
            });

        this.trendLowTFSubscription = WebsocketService.getInstance()
            .on<Trend>(WSEvent.HISTORY_TREND).subscribe(trendLowTF => {
                this.setState({trendLowTF});
            });

        this.wsStatusSub = WebsocketService.getInstance().connectionStatus()
            .subscribe(isConnected => {
                const { security } = this.state;
                if (isConnected && security) {
                    this.informServerAboutRequiredData(security);
                }
            });

        // this.setIntervalIdForFetchTradePremise = setInterval(() => {this.fetchTradePremise()}, 5000);
    };

    componentWillUnmount = (): void => {
        this.lastSecuritiesSubscription.unsubscribe();
        this.tradePremiseSubscription.unsubscribe();
        this.tradeSetupSubscription.unsubscribe();
        this.ordersSetupSubscription.unsubscribe();
        this.activeTradeSubscription.unsubscribe();
        this.trendLowTFSubscription.unsubscribe();
        this.wsStatusSub.unsubscribe();
        // clearInterval(this.setIntervalIdForFetchTradePremise);
    };

    updateSize = () => {
        const {chart1Width, chart2Width} = this.state;
        const chart1RefWidth = this.chart1Ref.current.clientWidth;
        const chart2RefWidth = this.chart2Ref.current.clientWidth;

        if (chart1Width !== chart1RefWidth || chart2Width !== chart2RefWidth) {
            this.setState({
                chart1Width: chart1RefWidth < 100 ? 100 : chart1RefWidth,
                chart2Width: chart2RefWidth < 100 ? 100 : chart2RefWidth
            });
        }
    };

    onSecuritySelected = (security: SecurityLastInfo): void => {
        this.setState({security});
        this.informServerAboutRequiredData(security);
    };

    informServerAboutRequiredData = (security: SecurityLastInfo): void => {
        if (security) {
            WebsocketService.getInstance().send(WSEvent.HISTORY_GET_TRADE_PREMISE_AND_SETUP, {
                brokerId: 1,
                tradingPlatform: TradingPlatform.QUIK,
                classCode: security.classCode,
                secCode: security.secCode,
                timeFrameHigh: this.timeFrameHigh,
                timeFrameTrading: this.timeFrameTrading,
                timeFrameLow: this.timeFrameLow});
            WebsocketService.getInstance().send(WSEvent.HISTORY_GET_TRADES_AND_ORDERS, security.secCode)
        }
    };

    onStrategySelected = (filter: TradeStrategyAnalysisFilterDto) => {
        const {security} = this.state;
        this.timeFrameHigh = filter.timeFrameHigh;
        this.timeFrameTrading = filter.timeFrameTrading;
        this.timeFrameLow = filter.timeFrameLow;
        this.informServerAboutRequiredData(security);
    };

    setStartDate = (start: any) => {
        this.setState({start})
    };

    setEndDate = (end: any) => {
        this.setState({end})
    };

    start = () => {
        startHistory({
            brokerId: 1,
            tradingPlatform: TradingPlatform.QUIK,
            classCode: ClassCode.SPBFUT, secCode: "BRK0",
            timeFrameHigh: this.timeFrameHigh,
            timeFrameTrading: this.timeFrameTrading,
            timeFrameLow: this.timeFrameLow,
            realDeposit: false,
            start: this.state.start,
            end: this.state.end
        })
            .then(res => {
                console.log(res)
            })
            .catch(reason => console.log);
    };

    stop = () => {
        stopHistory({
            brokerId: 1,
            tradingPlatform: TradingPlatform.QUIK,
            classCode: ClassCode.SPBFUT, secCode: "BRJ0",
            timeFrameHigh: this.timeFrameHigh,
            timeFrameTrading: this.timeFrameTrading,
            timeFrameLow: this.timeFrameLow,
            realDeposit: false,
            start: this.state.start,
            end: this.state.end
        })
            .then(res => {
                console.log("stop: " + res);
            })
            .catch(reason => console.log);
    };

    cancelOrder = (order: Order) => {
        WebsocketService.getInstance().send(WSEvent.HISTORY_CANCEL_ORDERS, [order])
    };

    render() {
        const {chart1Width, chart2Width, security, securities, premise, setup, orders, activeTrade,
            result, start, end, timeInHistory, volumes, trendLowTF} = this.state;
        const timeInHistoryView = timeInHistory ? moment(timeInHistory).format("DD.MM.YYYY HH:mm:ss") : "";

        return (
            <>
                <div style={{height: '33px'}}>
                    Start:
                    <Calendar value={start} onChange={(e) => this.setStartDate(e.value)}
                              showTime={true} showSeconds={true} />
                    End:
                    <Calendar value={end} onChange={(e) => this.setEndDate(e.value)}
                              showTime={true} showSeconds={true} />
                    <Button label="Start" onClick={this.start} />
                    <Button label="Stop" onClick={this.stop} />
                    <span>{timeInHistoryView}</span>
                </div>
                <div className="p-grid td__history_main">
                    <div className="p-col-fixed" style={{width:'100px', padding: 0}}>
                        <Securities securities={securities} onSecuritySelected={this.onSecuritySelected}/>
                    </div>
                    <div className="p-col" style={{padding:'0', minWidth:'600px'}}>
                        <div className="p-grid" style={{margin:'0'}}>
                            <div className="p-col-12" style={{padding: 0}}>
                                {/*<Analysis premise={premise} setup={setup}/>*/}
                                <ControlPanel security={security}
                                              activeTrade={activeTrade}
                                              result={result}
                                              history={true}
                                              onSelectStrategy={this.onStrategySelected}/>
                            </div>
                            <div className="p-col-7" ref={this.chart1Ref} style={{padding:'0'}}>
                                <ChartWrapper interval={this.timeFrameTrading}
                                              numberOfCandles={168}
                                              width={chart1Width}
                                              security={security}
                                              premise={premise}
                                              orders={orders}
                                              history={true}
                                              showGrid={true}/>
                            </div>
                            <div className="p-col-5" ref={this.chart2Ref} style={{padding:'0'}}>
                                <ChartWrapper interval={this.timeFrameLow}
                                              numberOfCandles={150}
                                              width={chart2Width}
                                              security={security}
                                              history={true}
                                              trend={trendLowTF}
                                              showGrid={true}/>
                            </div>
                        </div>
                    </div>
                    <div className="p-col-fixed" style={{width:'100px', padding: 0}}>
                        {/*<Stack orders={orders}
                               onCancelOrder={this.cancelOrder}
                               volumes={volumes}
                               security={security}/>*/}
                    </div>
                </div>
            </>
        )
    }
}
