import * as React from "react";
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import {SubscriptionLike} from "rxjs";
import {WebsocketService, WSEvent} from "../../../common/api/WebsocketService";
import {Interval} from "../../../common/data/Interval";
import {ChartWrapper} from "../../../common/components/chart/ChartWrapper";
import {BotControlAnalysis} from "./BotControlAnalysis";
import {SecurityLastInfo} from "../../../common/data/SecurityLastInfo";
import {TradingStrategyState} from "../../../common/data/strategy/TradingStrategyState";
import {TradeSetup} from "../../../common/data/strategy/TradeSetup";
import {Order} from "../../../common/data/Order";
import {TradingPlatform} from "../../../common/data/TradingPlatform";
import {ActiveTrade} from "../../../common/data/ActiveTrade";
import {SessionTradeResult} from "../../../common/data/SessionTradeResult";
import moment = require("moment");

type Props = {};

type States = {
    chart1Width: number
    chart2Width: number
    securities: SecurityLastInfo[]
    security: SecurityLastInfo
    setup: TradeSetup
    orders: Order[]
    activeTrade: ActiveTrade
    result: SessionTradeResult
    start: Date
    end: Date
    timeInHistory: Date
    tradingStrategyState: TradingStrategyState
};

export class BotControlHistory extends React.Component<Props, States> {

    chart1Ref: any;
    chart2Ref: any;
    private setIntervalIdForFetchTradePremise: NodeJS.Timeout = null;
    private lastSecuritiesSubscription: SubscriptionLike = null;
    private tradeSetupSubscription: SubscriptionLike = null;
    private ordersSetupSubscription: SubscriptionLike = null;
    private activeTradeSubscription: SubscriptionLike = null;
    private tradingStrategyStateSubscription: SubscriptionLike = null;

    constructor(props) {
        super(props);
        this.state = { chart1Width: 200, chart2Width: 200, security: null, securities: [], setup: null,
            orders: [], activeTrade: null, result: null,
            start: moment().hours(10).minutes(0).seconds(0).toDate(),
            end: moment().hours(23).minutes(50).seconds(0).toDate(), timeInHistory: null,
            tradingStrategyState: null };
        this.chart1Ref = React.createRef();
        this.chart2Ref = React.createRef();
    }

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

        this.tradingStrategyStateSubscription = WebsocketService.getInstance()
            .on<TradingStrategyState>(WSEvent.HISTORY_TRADING_STRATEGY_STATE).subscribe(tradingStrategyState => {
                this.setState({tradingStrategyState});
            });

        // this.setIntervalIdForFetchTradePremise = setInterval(() => {this.fetchTradePremise()}, 5000);

    };

    componentWillUnmount = (): void => {
        this.lastSecuritiesSubscription.unsubscribe();
        this.tradeSetupSubscription.unsubscribe();
        this.ordersSetupSubscription.unsubscribe();
        this.activeTradeSubscription.unsubscribe();
        this.tradingStrategyStateSubscription.unsubscribe();
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
        if (security) {
            WebsocketService.getInstance().send(WSEvent.HISTORY_GET_TRADE_PREMISE_AND_SETUP, {
                brokerId: 1, tradingPlatform: TradingPlatform.QUIK,
                classCode: security.classCode, secCode: security.secCode,
                timeFrameHigh: Interval.M30, timeFrameTrading: Interval.M5, timeFrameLow: Interval.M1});
            WebsocketService.getInstance().send(WSEvent.HISTORY_GET_TRADES_AND_ORDERS, security.secCode)
        }
    };

    render() {
        const {chart1Width, chart2Width, security, securities, setup, orders, activeTrade,
            result, start, end, timeInHistory, tradingStrategyState} = this.state;
        const timeInHistoryView = timeInHistory ? moment(timeInHistory).format("DD.MM.YYYY HH:mm:ss") : "";

        return (
            <>
                <span>{timeInHistoryView}</span>
                <div className="p-grid td__history_main">
                    <div className="p-col-7" style={{padding:'0', minWidth:'600px'}}>
                        <div className="p-grid" style={{margin:'0'}}>
                            <div className="p-col-7" ref={this.chart1Ref} style={{padding:'0'}}>
                                <ChartWrapper interval={Interval.M5} numberOfCandles={168} width={chart1Width}
                                              security={security} premise={tradingStrategyState ? tradingStrategyState.currentPremise : null}
                                              orders={orders} history={true} securityInfo={null}/>
                            </div>
                            <div className="p-col-5" ref={this.chart2Ref} style={{padding:'0'}}>
                                <ChartWrapper interval={Interval.M1} numberOfCandles={50} width={chart2Width}
                                              security={security} history={true} securityInfo={null}/>
                            </div>
                        </div>
                    </div>
                    <div className="p-col-5" style={{width:'500px', padding: 0}}>
                        <BotControlAnalysis premise={tradingStrategyState ? tradingStrategyState.currentPremise : null}
                                            setup={setup}/>
                    </div>
                </div>
            </>
        )
    }
}
