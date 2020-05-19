import * as React from "react";
import ActiveTradeView from "./components/ActiveTradeView";
import {Growl} from "primereact/components/growl/Growl";
import {SelectButton} from "primereact/components/selectbutton/SelectButton";
import {ToggleButton} from "primereact/components/togglebutton/ToggleButton";
import {FastBtn} from "./btn/FastBtn";
import {GeneralBtn} from "./btn/GeneralBtn";
import {CatchBtn} from "./btn/CatchBtn";
import StrategyBtn from "./btn/StrategyBtn";
import {SecurityLastInfo} from "../../data/SecurityLastInfo";
import {ActiveTrade} from "../../data/ActiveTrade";
import {WebsocketService, WSEvent} from "../../api/WebsocketService";
import {SubscriptionLike} from "rxjs";
import "./ControlPanel.css";
import {StopCalc} from "../stack/stop-calc/StopCalc";
import {SessionTradeResult} from "../../data/SessionTradeResult";
import SessionTradeResultView from "./components/SessionTradeResultView";

type Props = {};

type States = {
    price: number
    quantity: number
    steps: number
    multiplier: number
    btnSet: string
    isMarket: boolean
    hasStop: boolean
    stop: number
    security: SecurityLastInfo
    activeTrade: ActiveTrade
    sessionResult: SessionTradeResult
    visible: string
};

export class ControlPanel extends React.Component<Props, States> {

    private lastSecuritiesSubscription: SubscriptionLike = null;
    private activeTradeSubscription: SubscriptionLike = null;
    private VisibleType = {
        HIDE: 'HIDE',
        VISIBLE: 'VISIBLE',
        VISIBLE_PART: 'VISIBLE_PART'
    };

    private ToggleVisibleType = {
        HIDE: -24,
        VISIBLE: -16,
        VISIBLE_PART: -17
    };

    private VisibleTypeViewTop = {
        HIDE: -180,
        VISIBLE: 8,
        VISIBLE_PART: -85
    };

    growl: any;
    btnSets = [
        {label: 'General', value: 'general'},
        {label: 'Catch', value: 'catch'},
        {label: 'Fast', value: 'fast'},
        {label: 'Strategy', value: 'strategy'}
    ];

    constructor(props) {
        super(props);
        this.state = {
            price: 0, quantity: 1, steps: 2, multiplier: 1, btnSet: 'general', isMarket: false,
            hasStop: true, stop: 0.05, security: null, activeTrade: null,
            visible: this.VisibleType.HIDE,
            sessionResult: null
        };
    }

    componentDidMount = (): void => {

        this.lastSecuritiesSubscription = WebsocketService.getInstance()
            .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
            .subscribe(securities => {
                const {activeTrade} = this.state;
                if (activeTrade) {
                    const security = securities.find(o => o.secCode === activeTrade.secCode);
                    if (security) {
                        security.timeLastTrade = new Date(security.timeLastTrade);
                    }
                    this.setState({security});
                }
            });

        this.activeTradeSubscription = WebsocketService.getInstance()
            .on<ActiveTrade>(WSEvent.ACTIVE_TRADE).subscribe(activeTrade => {
                this.setState({activeTrade});
            });
    };

    componentWillUnmount = (): void => {
        this.lastSecuritiesSubscription.unsubscribe();
        this.activeTradeSubscription.unsubscribe();
    };

    toggleView = (toggle: boolean) => {
        this.setState({
            visible: !toggle ? this.VisibleType.VISIBLE : this.VisibleType.HIDE
        });
    };

    toggleViewPart = (toggle: boolean) => {
        this.setState({
            visible: !toggle ? this.VisibleType.VISIBLE_PART : this.VisibleType.HIDE
        });
    };

    render() {
        const {stop, btnSet, isMarket, hasStop, security, activeTrade, visible, sessionResult} = this.state;

        return (
            <div id="control-panel" className="p-grid" style={{top: this.VisibleTypeViewTop[visible]}}>
                <Growl ref={(el) => this.growl = el}/>
                <div className="p-col-fixed"
                     style={{
                         width: '100px',
                         padding: 0,
                         paddingTop: visible === this.VisibleType.VISIBLE_PART ? 73 : 0
                     }}>
                    <StopCalc securityLastInfo={security}
                              showSmall={visible === this.VisibleType.VISIBLE_PART}/>
                </div>
                <div className="p-col" style={{padding: 0}}>
                    <div className="p-grid" style={{marginTop: 0, marginRight: 0}}>
                        <div className="p-col-12" style={{paddingBottom: 0, paddingTop: 0, height: 90}}>
                            <div className="p-grid">
                                <div className="p-col-5">
                                    <SelectButton value={btnSet}
                                                  options={this.btnSets}
                                                  onChange={(e) => this.setState({btnSet: e.value})}/>
                                </div>
                                <div className="p-col-2">
                                    <ToggleButton style={{width: '100%'}} checked={isMarket}
                                                  className={isMarket ? "p-button-danger" : ""}
                                                  onLabel="Market" offLabel="Limit"
                                                  onChange={(e) => this.setState({isMarket: e.value})}/>
                                </div>
                            </div>
                            {btnSet === 'general' ?
                                <GeneralBtn growl={this.growl} history={false} security={security}/> : null}
                            {btnSet === 'catch' ?
                                <CatchBtn growl={this.growl} history={false}
                                          security={security} isMarket={isMarket}/> : null}
                            {btnSet === 'fast' ?
                                <FastBtn growl={this.growl} history={false} activeTrade={activeTrade}/> : null}
                            {btnSet === 'strategy' ?
                                <StrategyBtn onSelectStrategy={console.log}/> : null}
                        </div>
                        <div className="p-col-12" style={{paddingBottom: 0}}>
                            <SessionTradeResultView result={sessionResult}/>
                            <ActiveTradeView trade={activeTrade}/>
                        </div>
                    </div>
                </div>
                <ToggleButton id="control-panel-toggle-btn"
                              checked={visible !== this.VisibleType.VISIBLE}
                              onChange={(e) => this.toggleView(e.value)}
                              style={{bottom: this.ToggleVisibleType[visible]}}
                              onLabel="Show controls"
                              offLabel="Hide controls"/>
                <ToggleButton id="control-panel-toggle-btn-2"
                              checked={visible !== this.VisibleType.VISIBLE_PART}
                              onChange={(e) => this.toggleViewPart(e.value)}
                              style={{bottom: this.ToggleVisibleType[visible]}}
                              onLabel="Show part"
                              offLabel="Hide part"/>
            </div>
        )
    }
}