import * as React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {AppDispatch} from "../../app/store";
import {RootState} from "../../app/rootReducer";
import {loadFilterData, loadSecurityCurrency, loadSecurityFuture, loadSecurityShares} from "./AnalysisActions";
import {MarketBotFilterDataDto} from "../../common/data/bot/MarketBotFilterDataDto";
import {MarketBotStartDto} from "../../common/data/bot/MarketBotStartDto";
import {SecurityShare} from "../../common/data/SecurityShare";
import Filter from "./filter/Filter";
import {ClassCode} from "../../common/data/ClassCode";
import Analysis from "./analysis/Analysis";
import {TradePremise} from "../../common/data/strategy/TradePremise";
import {SecurityCurrency} from "../../common/data/SecurityCurrency";
import {SecurityFuture} from "../../common/data/SecurityFuture";
import AnalysisFutures from "./analysis/AnalysisFutures";
import "./Analysis.css";
import {SecurityLastInfo} from "../../common/data/SecurityLastInfo";
import {WebsocketService, WSEvent} from "../../common/api/WebsocketService";
import {SubscriptionLike} from "rxjs";
import {getTradePremise} from "../../common/api/rest/analysisRestApi";
import {setSelectedSecurity} from "../../common/utils/Cache";
import {Securities} from "./securities/Securities";
import {SecurityAnalysis} from "../../common/data/SecurityAnalysis";

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
    selectedSecurity: SecurityAnalysis
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

    private lastSecuritiesSubscription: SubscriptionLike = null;

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
        const {actions, filterData} = this.props;

        if (!filterData) {
            actions.loadFilterData();
        }

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
    }

    componentWillUnmount = (): void => {
        this.lastSecuritiesSubscription.unsubscribe();
    };

    loadPremise = (share: SecurityShare) => {
        const {filter} = this.state;

        if (filter && share) {
            if (ClassCode.SPBFUT !== filter.classCode) {
                getTradePremise({
                    brokerId: filter.brokerId,
                    tradingPlatform: filter.tradingPlatform,
                    classCode: filter.classCode,
                    secCode: share.secCode,
                    timeFrameTrading: filter.timeFrameTrading,
                    timeFrameMin: filter.timeFrameMin
                })
                    .then(premise => this.setState({premise}))
                    .catch(console.error);
            }
        }
    };

    onStart = (filter: MarketBotStartDto): void => {
        this.setState({filter, selectedSecurity: null, isDetailsShown: false});
        // if (filter) {
        //     switch (filter.classCode) {
        //         case ClassCode.CETS:
        //             this.props.actions.loadSecurityCurrency();
        //             break;
        //         case ClassCode.TQBR:
        //             this.props.actions.loadSecurityShares();
        //             break;
        //         case ClassCode.SPBFUT:
        //             this.props.actions.loadSecurityFuture();
        //             break;
        //     }
        // }
    };

    onSelectRow = (selectedSecurity: SecurityAnalysis) => {
        if (selectedSecurity) {
            const {securities} = this.state;
            const securityLastInfo = securities.find(o => o.secCode === selectedSecurity.secCode);
            this.setState({selectedSecurity, isDetailsShown: true, securityLastInfo});
            setSelectedSecurity(selectedSecurity);
        } else {
            this.setState({selectedSecurity, isDetailsShown: false});
        }
    };

    render() {
        const {filterData, shares, currencies, futures} = this.props;
        const {selectedSecurity, isDetailsShown, filter} = this.state;
        let selectedSecuritiesView = null;

        if (selectedSecurity) {
            selectedSecuritiesView = (
                <div key={selectedSecurity.secCode}>{selectedSecurity.secCode}</div>
            );
        }
        const classDataTable = isDetailsShown ? 'p-col-3' : 'p-col-12';
        const classDetails = isDetailsShown ? 'p-col-9' : 'hidden';

        let analysis = <div>Select security</div>;
        if (selectedSecurity) {
            switch (selectedSecurity.classCode) {
                case ClassCode.TQBR:
                case ClassCode.CETS:
                    analysis = (
                        <Analysis security={selectedSecurity}/>
                    );
                    break;
                case ClassCode.SPBFUT:
                    analysis = (
                        <AnalysisFutures security={selectedSecurity}/>
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
                                        <Securities onSelectRow={this.onSelectRow}/>
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
