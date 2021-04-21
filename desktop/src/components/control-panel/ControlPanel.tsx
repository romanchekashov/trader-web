import * as React from "react";
import {SecurityLastInfo} from "../../common/data/SecurityLastInfo";
import ActiveTradeView from "./components/ActiveTradeView";
import SessionTradeResultView from "./components/SessionTradeResultView";
import {ActiveTrade} from "../../common/data/ActiveTrade";
import {SessionTradeResult} from "../../common/data/SessionTradeResult";
import {Growl} from "primereact/components/growl/Growl";
import {SelectButton} from "primereact/components/selectbutton/SelectButton";
import {ToggleButton} from "primereact/components/togglebutton/ToggleButton";
import {FastBtn} from "./btn/FastBtn";
import {GeneralBtn} from "./btn/GeneralBtn";
import {CatchBtn} from "./btn/CatchBtn";
import {InputText} from "primereact/components/inputtext/InputText";
import StrategyBtn from "./btn/StrategyBtn";
import {TradeStrategyAnalysisFilterDto} from "../../common/data/TradeStrategyAnalysisFilterDto";
import Alerts from "../../common/components/alerts/Alerts";
import {AlertsFilter} from "../../common/components/alerts/data/AlertsFilter";
import {PatternResult} from "../../common/components/alerts/data/PatternResult";
import {AlertsSize} from "../../common/components/alerts/data/AlertsSize";

type Props = {
    security: SecurityLastInfo
    activeTrade: ActiveTrade
    result: SessionTradeResult
    history?: boolean
    onSelectStrategy: (filter: TradeStrategyAnalysisFilterDto) => void
};

type States = {
    price: number
    quantity: number
    steps: number
    multiplier: number
    btnSet: string
    isMarket: boolean
    hasStop: boolean
    stop: number
};

export class ControlPanel extends React.Component<Props, States> {

    private multipliers = [1, 2, 4, 8];
    private alertsFilter: AlertsFilter = null;
    growl: any;
    btnSets = [
        {label: 'General', value: 'general'},
        {label: 'Catch', value: 'catch'},
        {label: 'Fast', value: 'fast'},
        {label: 'Strategy', value: 'strategy'}
    ];

    constructor(props) {
        super(props);
        this.state = {price: 0, quantity: 1, steps: 2, multiplier: 1, btnSet: 'general', isMarket: false,
            hasStop: true, stop: 0.05};
    }

    stopChangeByKeydown = (e) => {
        let {stop} = this.state;

        if (e.key === 'ArrowUp') {
            stop += 0.01;
        } else if (e.key === 'ArrowDown' && stop > 0.01) {
            stop -= 0.01;
        }

        this.setState({stop});
    };

    onAlertSelected = (alert: PatternResult) => {
        console.log(alert);
    };

    render() {
        const {price, stop, steps, multiplier, btnSet, isMarket, hasStop} = this.state;
        const {activeTrade, result, history, security, onSelectStrategy} = this.props;

        if (security && (!this.alertsFilter || this.alertsFilter.secCode !== security.secCode)) {
            this.alertsFilter = {
                classCode: security.classCode,
                secCode: security.secCode,
                fetchByWS: true,
                history: false,
                size: AlertsSize.SMALL,
                all: false
            };
        }

        return (
            <div className="p-grid td__control-panel">
                <Growl ref={(el) => this.growl = el} />
                <div className="p-col-6">
                    <div className="p-grid">
                        <div className="p-col-12">
                            <Alerts filter={this.alertsFilter} onAlertSelected={this.onAlertSelected}/>
                        </div>
                    </div>
                </div>
                <div className="p-col-6">
                    <div className="p-grid">
                        <div className="p-col-12">
                            <div className="p-grid">
                                <div className="p-col-2">
                                    <ToggleButton style={{width:'100%'}} checked={hasStop}
                                                  onLabel="Stop" offLabel="Stop"
                                                  onChange={(e) => this.setState({hasStop: e.value})} />
                                </div>
                                <div className="p-col-1"
                                     style={{paddingLeft:0, paddingRight:0}}>
                                    <InputText id="td__control-panel-stops"
                                               value={stop}
                                               onKeyDown={this.stopChangeByKeydown}
                                               onChange={(e) => this.setState({stop: e.target['value']})}
                                               disabled={!hasStop}/>
                                </div>
                                <div className="p-col-7">
                                    <SelectButton value={btnSet}
                                                  options={this.btnSets}
                                                  onChange={(e) => this.setState({btnSet: e.value})} />
                                </div>
                                <div className="p-col-2">
                                    <ToggleButton style={{width:'100%'}} checked={isMarket}
                                                  className={isMarket ? "p-button-danger" : ""}
                                                  onLabel="Market" offLabel="Limit"
                                                  onChange={(e) => this.setState({isMarket: e.value})} />
                                </div>
                            </div>
                            { btnSet === 'general' ?
                                <GeneralBtn growl={this.growl} history={history} security={security} /> : null }
                            { btnSet === 'catch' ?
                                <CatchBtn growl={this.growl} history={history}
                                          security={security} isMarket={isMarket} /> : null }
                            { btnSet === 'fast' ?
                                <FastBtn growl={this.growl} history={history} activeTrade={activeTrade}/> : null }
                            { btnSet === 'strategy' ?
                                <StrategyBtn onSelectStrategy={onSelectStrategy}/> : null }
                        </div>
                        <div className="p-col-12">
                            <div className="p-grid">
                                <div className="p-col-12">
                                    <SessionTradeResultView result={result}/>
                                </div>
                                <div className="p-col-12">
                                    <ActiveTradeView trade={activeTrade}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}