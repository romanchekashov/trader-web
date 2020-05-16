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

function mapStateToProps(state: RootState) {
    return {
        filterData: state.tradeStrategyAnalysis.filter,
        shares: state.tradeStrategyAnalysis.shares,
        currencies: state.tradeStrategyAnalysis.currencies,
        futures: state.tradeStrategyAnalysis.futures,
        premise: state.tradeStrategyAnalysis.premise
    };
}

function mapDispatchToProps(dispatch: AppDispatch) {
    return {
        actions: {
            loadFilterData: bindActionCreators(loadFilterData, dispatch),
            loadSecurityShares: bindActionCreators(loadSecurityShares, dispatch),
            loadSecurityCurrency: bindActionCreators(loadSecurityCurrency, dispatch),
            loadSecurityFuture: bindActionCreators(loadSecurityFuture, dispatch),
            loadTradePremise: bindActionCreators(loadTradePremise, dispatch)
        }
    };
}

interface TradeStrategyAnalysisState {
    selectedSecurity: any
    isDetailsShown: boolean
    filter: MarketBotStartDto
}

type Props = {
    filterData: MarketBotFilterDataDto
    shares: SecurityShare[]
    premise: TradePremise
    currencies: SecurityCurrency[]
    futures: SecurityFuture[]
} & ReturnType<typeof mapDispatchToProps>;

class AnalysisPage extends React.Component<Props, TradeStrategyAnalysisState> {


    constructor(props) {
        super(props);

        this.state = {
            selectedSecurity: null,
            isDetailsShown: false,
            filter: null
        };
    }

    componentDidMount(): void {
        const { actions, filterData } = this.props;

        if (!filterData) {
            actions.loadFilterData();
        }
    }

    loadPremise = (share: SecurityShare) => {
        const { filter } = this.state;
        const { actions, premise } = this.props;

        if (filter && share) {
            if (ClassCode.SPBFUT !== filter.classCode) {
                actions.loadTradePremise({
                    brokerId: filter.brokerId,
                    tradingPlatform: filter.tradingPlatform,
                    classCode: filter.classCode,
                    secCode: share.secCode,
                    timeFrameHigh: filter.timeFrameHigh,
                    timeFrameTrading: filter.timeFrameTrading,
                    timeFrameLow: filter.timeFrameLow
                });
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
            this.loadPremise(selectedSecurity);
            this.setState({selectedSecurity, isDetailsShown: true});
        } else {
            this.setState({selectedSecurity, isDetailsShown: false});
        }
    };

    render() {
        const { filterData, shares, premise, currencies, futures } = this.props;
        const { selectedSecurity, isDetailsShown, filter } = this.state;
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
                <div className="p-col-12">
                    <Filter filter={filterData} onStart={this.onStart}/>
                </div>
                <div className="p-col-12">
                    {/*<div className="p-col-12 p-col-nogutter">
                        Top Bar
                    </div>*/}
                    <div className="p-col-12">
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
                </div>
                <div className="p-col-12">
                    Footer
                </div>
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AnalysisPage);