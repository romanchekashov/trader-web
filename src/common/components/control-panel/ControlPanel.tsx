import * as React from "react";
import ActiveTradeView from "./components/ActiveTradeView";
import {Growl} from "primereact/components/growl/Growl";
import {SelectButton} from "primereact/components/selectbutton/SelectButton";
import {ToggleButton} from "primereact/components/togglebutton/ToggleButton";
import {FastBtn} from "./btn/FastBtn";
import {GeneralBtn} from "./btn/GeneralBtn";
import {CatchBtn} from "./btn/CatchBtn";
import {InputText} from "primereact/components/inputtext/InputText";
import StrategyBtn from "./btn/StrategyBtn";
import {SecurityLastInfo} from "../../data/SecurityLastInfo";
import {ActiveTrade} from "../../data/ActiveTrade";
import {WebsocketService, WSEvent} from "../../api/WebsocketService";
import {SubscriptionLike} from "rxjs";
import "./ControlPanel.css";

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
    notVisible: boolean
    viewTop: number
};

export class ControlPanel extends React.Component<Props, States> {

    private lastSecuritiesSubscription: SubscriptionLike = null;
    private activeTradeSubscription: SubscriptionLike = null;

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
            hasStop: true, stop: 0.05, security: null, activeTrade: null, notVisible: true, viewTop: -140
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

    stopChangeByKeydown = (e) => {
        let {stop} = this.state;

        if (e.key === 'ArrowUp') {
            stop += 0.01;
        } else if (e.key === 'ArrowDown' && stop > 0.01) {
            stop -= 0.01;
        }

        this.setState({stop});
    };

    toggleView = (notVisible: boolean) => {
        this.setState({notVisible, viewTop: notVisible ? -140 : 0});
    };

    render() {
        const {stop, btnSet, isMarket, hasStop, security, activeTrade, notVisible, viewTop} = this.state;

        return (
            <div id="control-panel" className="p-grid" style={{top: viewTop}}>
                <Growl ref={(el) => this.growl = el}/>
                <div className="p-col-12">
                    <div className="p-grid">
                        <div className="p-col-12">
                            <div className="p-grid">
                                <div className="p-col-2">
                                    <ToggleButton style={{width: '100%'}} checked={hasStop}
                                                  onLabel="Stop" offLabel="Stop"
                                                  onChange={(e) => this.setState({hasStop: e.value})}/>
                                </div>
                                <div className="p-col-1"
                                     style={{paddingLeft: 0, paddingRight: 0}}>
                                    <InputText id="td__control-panel-stops"
                                               value={stop}
                                               onKeyDown={this.stopChangeByKeydown}
                                               onChange={(e) => this.setState({stop: e.target['value']})}
                                               disabled={!hasStop}/>
                                </div>
                                <div className="p-col-7">
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
                        <div className="p-col-12">
                            <div className="p-grid">
                                <div className="p-col-12">
                                    {/*<SessionTradeResultView result={result}/>*/}
                                </div>
                                <div className="p-col-12">
                                    <ActiveTradeView trade={activeTrade}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ToggleButton id="control-panel-toggle-btn"
                              checked={notVisible}
                              onChange={(e) => this.toggleView(e.value)}
                              onLabel="Show controls"
                              offLabel="Hide"/>
            </div>
        )
    }
}