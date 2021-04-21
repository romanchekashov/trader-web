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
import {SecurityVolume} from "../../common/data/SecurityVolume";
import {Trend} from "../../common/data/strategy/Trend";
import {TradeStrategyAnalysisFilterDto} from "../../common/data/TradeStrategyAnalysisFilterDto";
import AnalysisLine from "../../components/analysis/AnalysisLine";
import {playSound} from "../../common/assets/assets";
import {StopOrder} from "../../common/data/StopOrder";
import {getTradePremise} from "../../common/api/rest/analysisRestApi";
import {TrendsView} from "../../common/components/trend/TrendsView";
import {getAllSecurityFutures} from "../../common/api/rest/traderRestApi";
import {Security} from "../../common/data/Security";

type Props = {};

type States = {
    chart1Width: number
    chart2Width: number
    securities: SecurityLastInfo[]
    securityLastInfo: SecurityLastInfo
    security: Security
    premise: TradePremise
    setup: TradeSetup
    orders: Order[]
    volumes: SecurityVolume[]
    activeTrade: ActiveTrade
    result: SessionTradeResult
    trendLowTF: Trend
};

export class Real extends React.Component<Props, States> {

    chart1Ref: any;
    chart2Ref: any;
    previousOrdersNumber: number = 0;
    previousStopOrder: StopOrder;
    securityFutures: Security[] = [];

    private setIntervalIdForFetchTradePremise: NodeJS.Timeout = null;
    private lastSecuritiesSubscription: SubscriptionLike = null;
    private tradePremiseSubscription: SubscriptionLike = null;
    private tradeSetupSubscription: SubscriptionLike = null;
    private ordersSetupSubscription: SubscriptionLike = null;
    private activeTradeSubscription: SubscriptionLike = null;
    private volumesSubscription: SubscriptionLike = null;
    private trendLowTFSubscription: SubscriptionLike = null;
    private wsStatusSub: SubscriptionLike = null;


    timeFrameHigh = Interval.M30;
    timeFrameTrading = Interval.M5;
    timeFrameLow = Interval.M1;

    constructor(props) {
        super(props);
        this.state = {
            chart1Width: 200, chart2Width: 200, securityLastInfo: null, securities: [], security: null,
            premise: null, setup: null, orders: [], activeTrade: null, result: null, volumes: [], trendLowTF: null
        };
        this.chart1Ref = React.createRef();
        this.chart2Ref = React.createRef();
    }

    fetchTradePremise = () => {
        const {securityLastInfo} = this.state;

        if (securityLastInfo) {
            getTradePremise({
                brokerId: 1, tradingPlatform: TradingPlatform.QUIK,
                classCode: securityLastInfo.classCode, secCode: securityLastInfo.secCode,
                timeFrameHigh: this.timeFrameHigh,
                timeFrameTrading: this.timeFrameTrading,
                timeFrameLow: this.timeFrameLow
            })
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
            .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
            .subscribe(value => {
                const securities = value.map(c => {
                    c.timeLastTrade = new Date(c.timeLastTrade);
                    return c;
                });
                let securityLastInfo = this.state.securityLastInfo;
                if (securityLastInfo) {
                    securityLastInfo = securities.find(o => o.secCode === securityLastInfo.secCode);
                }
                this.setState({securities, securityLastInfo});
            });

        this.tradePremiseSubscription = WebsocketService.getInstance()
            .on<TradePremise>(WSEvent.TRADE_PREMISE).subscribe(premise => {
                // console.log("premise", premise);
                for (const srZone of premise.analysis.srZones) {
                    srZone.timestamp = new Date(srZone.timestamp)
                }
                this.setState({premise});
            });

        this.tradeSetupSubscription = WebsocketService.getInstance()
            .on<TradeSetup>(WSEvent.TRADE_SETUP).subscribe(setup => {
                // console.log(setup);
                this.setState({setup});
            });

        this.ordersSetupSubscription = WebsocketService.getInstance()
            .on<Order[]>(WSEvent.ORDERS).subscribe(orders => {
                this.setState({orders});
            });

        this.volumesSubscription = WebsocketService.getInstance()
            .on<SecurityVolume[]>(WSEvent.VOLUMES).subscribe(volumes => {
                this.setState({volumes});
            });

        this.activeTradeSubscription = WebsocketService.getInstance()
            .on<ActiveTrade>(WSEvent.ACTIVE_TRADE).subscribe(activeTrade => {
                this.setState({activeTrade});
            });

        this.trendLowTFSubscription = WebsocketService.getInstance()
            .on<Trend>(WSEvent.TREND).subscribe(trendLowTF => {
                this.setState({trendLowTF});
            });

        this.wsStatusSub = WebsocketService.getInstance().connectionStatus()
            .subscribe(isConnected => {
                const {securityLastInfo} = this.state;
                if (isConnected && securityLastInfo) {
                    this.informServerAboutRequiredData(securityLastInfo);
                }
            });

        // this.setIntervalIdForFetchTradePremise = setInterval(() => {this.fetchTradePremise()}, 5000);

        getAllSecurityFutures()
            .then(value => {
                this.securityFutures = value;
            })
            .catch(console.error);
    };

    componentWillUnmount = (): void => {
        this.lastSecuritiesSubscription.unsubscribe();
        this.tradePremiseSubscription.unsubscribe();
        this.tradeSetupSubscription.unsubscribe();
        this.ordersSetupSubscription.unsubscribe();
        this.activeTradeSubscription.unsubscribe();
        this.volumesSubscription.unsubscribe();
        this.trendLowTFSubscription.unsubscribe();
        this.wsStatusSub.unsubscribe();
        // clearInterval(this.setIntervalIdForFetchTradePremise);
    };

    updateSize = () => {
        const {chart1Width, chart2Width} = this.state;
        const chart1RefWidth = this.chart1Ref.current.clientWidth;
        const chart2RefWidth = this.chart2Ref.current.clientWidth;

        if (chart1Width !== chart1RefWidth) {
            this.setState({
                chart1Width: chart1RefWidth < 100 ? 100 : chart1RefWidth,
                chart2Width: chart2RefWidth < 100 ? 100 : chart2RefWidth
            });
        }
    };

    onSecuritySelected = (securityLastInfo: SecurityLastInfo): void => {
        const security = this.securityFutures
            .find((item) => item.classCode === securityLastInfo.classCode && item.secCode === securityLastInfo.secCode);
        this.setState({securityLastInfo, security});
        this.informServerAboutRequiredData(securityLastInfo);
    };

    informServerAboutRequiredData = (securityLastInfo: SecurityLastInfo): void => {
        if (securityLastInfo) {
            WebsocketService.getInstance().send(WSEvent.GET_TRADE_PREMISE_AND_SETUP, {
                brokerId: 1,
                tradingPlatform: TradingPlatform.QUIK,
                classCode: securityLastInfo.classCode,
                secCode: securityLastInfo.secCode,
                timeFrameHigh: this.timeFrameHigh,
                timeFrameTrading: this.timeFrameTrading,
                timeFrameLow: this.timeFrameLow
            });
            WebsocketService.getInstance().send(WSEvent.GET_TRADES_AND_ORDERS, securityLastInfo.secCode);
        }
    };

    onStrategySelected = (filter: TradeStrategyAnalysisFilterDto) => {
        const {securityLastInfo} = this.state;
        this.timeFrameHigh = filter.timeFrameHigh;
        this.timeFrameTrading = filter.timeFrameTrading;
        this.timeFrameLow = filter.timeFrameLow;
        this.informServerAboutRequiredData(securityLastInfo);
    };

    cancelOrder = (order: Order) => {
        WebsocketService.getInstance().send(WSEvent.CANCEL_ORDERS, [order])
    };

    notifyIfOrderHit = (): void => {
        const {orders} = this.state;
        if (orders && orders.length !== this.previousOrdersNumber) {
            playSound(1);
            this.previousOrdersNumber = orders.length;
        }
    };

    notifyIfStopHit = (): void => {
        const {activeTrade} = this.state;
        if (activeTrade && ((activeTrade.stopOrder && !this.previousStopOrder)
            || (!activeTrade.stopOrder && this.previousStopOrder)
            || (this.previousStopOrder && activeTrade.stopOrder.price !== this.previousStopOrder.price))) {
            playSound(2);
            this.previousStopOrder = activeTrade.stopOrder;
        }
    };

    render() {
        const {
            chart1Width, chart2Width, securityLastInfo, security, securities, premise, setup, orders, activeTrade,
            result, volumes, trendLowTF
        } = this.state;

        this.notifyIfOrderHit();
        this.notifyIfStopHit();

        return (
            <>
                <div className="p-grid td__real_main">
                    <div className="p-col-fixed" style={{width: '100px', padding: 0}}>
                        <Securities securities={securities}
                                    onSecuritySelected={this.onSecuritySelected}/>
                    </div>
                    <div className="p-col" style={{padding: '0', minWidth: '600px'}}>
                        <div className="p-grid" style={{margin: '0'}}>
                            <div className="p-col-12" style={{padding: 0}}>
                                {/*<Analysis premise={premise} setup={setup}/>*/}
                                <ControlPanel security={securityLastInfo}
                                              activeTrade={activeTrade}
                                              result={result}
                                              onSelectStrategy={this.onStrategySelected}/>
                            </div>
                            <div className="p-col-12" style={{padding: 0}}>
                                <AnalysisLine premise={premise} setup={setup}/>
                            </div>
                            <div className="p-col-12" style={{padding: 0}}>
                                <TrendsView trends={premise ? premise.analysis.trends : []}/>
                            </div>
                            <div className="p-col-7" ref={this.chart1Ref} style={{padding: '0'}}>
                                <ChartWrapper interval={this.timeFrameTrading}
                                              width={chart1Width}
                                              security={securityLastInfo}
                                              premise={premise}
                                              orders={orders}
                                              activeTrade={activeTrade}
                                              showGrid={true}/>
                            </div>
                            <div className="p-col-5" ref={this.chart2Ref} style={{padding: '0'}}>
                                <ChartWrapper interval={this.timeFrameLow}
                                              width={chart2Width}
                                              security={securityLastInfo}
                                              trend={trendLowTF}
                                              showGrid={true}/>
                            </div>
                        </div>
                    </div>
                    <div className="p-col-fixed" style={{width: '240px', padding: 0}}>
                        <Stack orders={orders}
                               onCancelOrder={this.cancelOrder}
                               volumes={volumes}
                               securityLastInfo={securityLastInfo}
                               security={security}
                               activeTrade={activeTrade}/>
                    </div>
                </div>
            </>
        )
    }
}
