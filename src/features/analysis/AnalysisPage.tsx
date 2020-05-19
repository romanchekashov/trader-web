import * as React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {AppDispatch} from "../../app/store";
import {RootState} from "../../app/rootReducer";
import {
    loadFilterData,
    loadSecurityCurrency,
    loadSecurityFuture,
    loadSecurityShares,
    loadTradePremise
} from "./AnalysisActions";
import {MarketBotFilterDataDto} from "../../common/data/bot/MarketBotFilterDataDto";
import {MarketBotStartDto} from "../../common/data/bot/MarketBotStartDto";
import {SecurityShare} from "../../common/data/SecurityShare";
import Filter from "./filter/Filter";
import {ClassCode} from "../../common/data/ClassCode";
import Analysis from "./analysis/Analysis";
import {TradePremise} from "../../common/data/strategy/TradePremise";
import {SecurityCurrency} from "../../common/data/SecurityCurrency";
import {SecurityFuture} from "../../common/data/SecurityFuture";
import Shares from "./securities/Shares";
import Currencies from "./securities/Currencies";
import Futures from "./securities/Futures";
import AnalysisFutures from "./analysis/AnalysisFutures";
import "./Analysis.css";
import {Stack} from "../../common/components/stack/Stack";
import {SecurityLastInfo} from "../../common/data/SecurityLastInfo";
import {WebsocketService, WSEvent} from "../../common/api/WebsocketService";
import {SubscriptionLike} from "rxjs";
import {TradingPlatform} from "../../common/data/TradingPlatform";
import {getTradePremise} from "../../common/api/rest/analysisRestApi";

function mapStateToProps(state: RootState) {
    return {
        filterData: state.tradeStrategyAnalysis.filter,
        shares: state.tradeStrategyAnalysis.shares,
        currencies: state.tradeStrategyAnalysis.currencies,
        futures: state.tradeStrategyAnalysis.futures
    };
}

function mapDispatchToProps(dispatch: AppDispatch) {
    return {
        actions: {
            loadFilterData: bindActionCreators(loadFilterData, dispatch),
            loadSecurityShares: bindActionCreators(loadSecurityShares, dispatch),
            loadSecurityCurrency: bindActionCreators(loadSecurityCurrency, dispatch),
            loadSecurityFuture: bindActionCreators(loadSecurityFuture, dispatch)
        }
    };
}

interface TradeStrategyAnalysisState {
    selectedSecurity: any
    isDetailsShown: boolean
    filter: MarketBotStartDto
    securityLastInfo: SecurityLastInfo
    securities: SecurityLastInfo[],
    premise: TradePremise
}

type Props = {
    filterData: MarketBotFilterDataDto
    shares: SecurityShare[]
    currencies: SecurityCurrency[]
    futures: SecurityFuture[]
} & ReturnType<typeof mapDispatchToProps>;

class AnalysisPage extends React.Component<Props, TradeStrategyAnalysisState> {

    private wsStatusSub: SubscriptionLike = null;
    private lastSecuritiesSubscription: SubscriptionLike = null;
    private tradePremiseSubscription: SubscriptionLike = null;

    constructor(props) {
        super(props);

        this.state = {
            selectedSecurity: null,
            isDetailsShown: false,
            filter: null,
            securityLastInfo: null,
            securities: [],
            premise: null
        };
    }

    componentDidMount(): void {
        const { actions, filterData } = this.props;

        if (!filterData) {
            actions.loadFilterData();
        }

        this.wsStatusSub = WebsocketService.getInstance().connectionStatus()
            .subscribe(isConnected => {
                const {securityLastInfo} = this.state;
                if (isConnected && securityLastInfo) {
                    this.informServerAboutRequiredData(securityLastInfo);
                }
            });

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
                for (const srZone of premise.analysis.srZones) {
                    srZone.timestamp = new Date(srZone.timestamp)
                }
                this.setState({premise});
            });
    }

    componentWillUnmount = (): void => {
        this.wsStatusSub.unsubscribe();
        this.lastSecuritiesSubscription.unsubscribe();
        this.tradePremiseSubscription.unsubscribe();
    };

    informServerAboutRequiredData = (securityLastInfo: SecurityLastInfo): void => {
        const {filter} = this.state;

        if (securityLastInfo) {
            WebsocketService.getInstance().send(WSEvent.GET_TRADE_PREMISE_AND_SETUP, {
                brokerId: 1,
                tradingPlatform: TradingPlatform.QUIK,
                classCode: securityLastInfo.classCode,
                secCode: securityLastInfo.secCode,
                timeFrameHigh: filter.timeFrameHigh,
                timeFrameTrading: filter.timeFrameTrading,
                timeFrameLow: filter.timeFrameLow
            });
            WebsocketService.getInstance().send(WSEvent.GET_TRADES_AND_ORDERS, securityLastInfo.secCode);
        }
    };

    loadPremise = (share: SecurityShare) => {
        const { filter } = this.state;

        if (filter && share) {
            if (ClassCode.SPBFUT !== filter.classCode) {
                getTradePremise({
                    brokerId: filter.brokerId,
                    tradingPlatform: filter.tradingPlatform,
                    classCode: filter.classCode,
                    secCode: share.secCode,
                    timeFrameHigh: filter.timeFrameHigh,
                    timeFrameTrading: filter.timeFrameTrading,
                    timeFrameLow: filter.timeFrameLow
                })
                    .then(premise => this.setState({premise}))
                    .catch(console.error);
            }
        }
    };

    onStart = (filter: MarketBotStartDto): void => {
        this.setState({filter, selectedSecurity: null, isDetailsShown: false});
        if (filter) {
            switch (filter.classCode) {
                case ClassCode.CETS:
                    this.props.actions.loadSecurityCurrency();
                    break;
                case ClassCode.TQBR:
                    this.props.actions.loadSecurityShares();
                    break;
                case ClassCode.SPBFUT:
                    this.props.actions.loadSecurityFuture();
                    break;
            }
        }
    };

    onSelectRow = (selectedSecurity) => {
        if (selectedSecurity) {
            const {securities} = this.state;
            // this.loadPremise(selectedSecurity);
            const securityLastInfo = securities.find(o => o.secCode === selectedSecurity.secCode);
            this.informServerAboutRequiredData(securityLastInfo);
            this.setState({selectedSecurity, isDetailsShown: true, securityLastInfo});
        } else {
            this.setState({selectedSecurity, isDetailsShown: false});
        }
    };

    render() {
        const { filterData, shares, currencies, futures } = this.props;
        const { selectedSecurity, isDetailsShown, filter, securityLastInfo, premise } = this.state;
        let selectedSecuritiesView = null;

        if (selectedSecurity) {
            selectedSecuritiesView = (
                <div key={selectedSecurity.secCode}>{selectedSecurity.secCode}</div>
            );
        }
        const classDataTable = isDetailsShown ? 'p-col-2' : 'p-col-12';
        const classDetails = isDetailsShown ? 'p-col-10' : 'hidden';

        let dataTable = <div>Select classCode</div>;
        if (filter) {
            switch (filter.classCode) {
                case ClassCode.TQBR:
                    dataTable = (
                        <Shares shares={shares}
                                onSelectRow={this.onSelectRow}
                                selectedShare={selectedSecurity}/>
                    );
                    break;
                case ClassCode.CETS:
                    dataTable = (
                        <Currencies currencies={currencies}
                                    onSelectRow={this.onSelectRow}
                                    selectedCurrency={selectedSecurity}/>
                    );
                    break;
                case ClassCode.SPBFUT:
                    dataTable = (
                        <Futures futures={futures}
                                 onSelectRow={this.onSelectRow}
                                 selectedFuture={selectedSecurity}/>
                    );
                    break;
            }
        }

        let analysis = <div>Select security</div>;
        if (filter) {
            switch (filter.classCode) {
                case ClassCode.TQBR:
                    analysis = (
                        <Analysis classCode={filter ? filter.classCode : null}
                                  timeFrameHigh={filter ? filter.timeFrameHigh : null}
                                  timeFrameTrading={filter ? filter.timeFrameTrading : null}
                                  timeFrameLow={filter ? filter.timeFrameLow : null}
                                  security={selectedSecurity}
                                  premise={premise}/>
                    );
                    break;
                case ClassCode.CETS:
                    analysis = (
                        <Analysis classCode={filter ? filter.classCode : null}
                                  timeFrameHigh={filter ? filter.timeFrameHigh : null}
                                  timeFrameTrading={filter ? filter.timeFrameTrading : null}
                                  timeFrameLow={filter ? filter.timeFrameLow : null}
                                  security={selectedSecurity}
                                  premise={premise}/>
                    );
                    break;
                case ClassCode.SPBFUT:
                    analysis = (
                        <AnalysisFutures classCode={filter ? filter.classCode : null}
                                         future={selectedSecurity} />
                    );
                    break;
            }
        }

        return (
            <div className="p-grid sample-layout analysis">
                <div className="p-col-12" style={{padding: 0}}>
                    <Filter filter={filterData} onStart={this.onStart}/>
                </div>
                <div className="p-col-12">
                    <div className="p-grid">
                        <div className="p-col">
                            <div className="p-grid">
                                <div className={classDataTable}>
                                    <div className="p-grid analysis-securities">
                                        {dataTable}
                                    </div>
                                </div>
                                <div className={classDetails}>
                                    {analysis}
                                </div>
                            </div>
                        </div>
                        {
                            isDetailsShown ?
                                <div className="p-col-fixed" style={{width: '240px', padding: 0}}>
                                    <Stack securityLastInfo={securityLastInfo}/>
                                </div>
                                : null
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AnalysisPage);
