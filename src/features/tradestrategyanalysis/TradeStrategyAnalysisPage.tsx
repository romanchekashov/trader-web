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
} from "./tradeStrategyAnalysisActions";
import {MarketBotFilterDataDto} from "../../api/dto/MarketBotFilterDataDto";
import {MarketBotStartDto} from "../../api/dto/MarketBotStartDto";
import {SecurityShare} from "../../api/dto/SecurityShare";
import Filter from "./filter/Filter";
import {ClassCode} from "../../api/dto/ClassCode";
import Analysis from "./analysis/Analysis";
import {TradePremise} from "../../api/tradestrategyanalysis/dto/TradePremise";
import {SecurityCurrency} from "../../api/dto/SecurityCurrency";
import {SecurityFuture} from "../../api/dto/SecurityFuture";
import Shares from "./securities/Shares";
import Currencies from "./securities/Currencies";
import Futures from "./securities/Futures";
import AnalysisFutures from "./analysis/AnalysisFutures";


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
    selectedSecurities: any[]
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

class TradeStrategyAnalysisPage extends React.Component<Props, TradeStrategyAnalysisState> {


    constructor(props) {
        super(props);

        this.state = {
            selectedSecurities: [],
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
    };

    onStart = (data: MarketBotStartDto): void => {
        this.setState({filter: data});
        if (data) {
            switch (data.classCode) {
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

    onSelectRow = (e) => {
        const selectedSecurities = e.value;
        if (selectedSecurities && selectedSecurities.length > 0) {
            this.loadPremise(selectedSecurities[0]);
            this.setState({selectedSecurities: selectedSecurities, isDetailsShown: true});
        } else {
            this.setState({selectedSecurities: selectedSecurities, isDetailsShown: false});
        }
    };

    render() {
        const { filterData, shares, premise, currencies, futures } = this.props;
        const { selectedSecurities, isDetailsShown, filter } = this.state;
        let selectedSecuritiesView = [];
        if (selectedSecurities) {
            selectedSecuritiesView = selectedSecurities.map(share => (
                <div key={share.secCode}>{share.secCode}</div>
            ));
        }
        const classDataTable = isDetailsShown ? 'p-col-3' : 'p-col-12';
        const classDetails = isDetailsShown ? 'p-col-9' : 'hidden';

        let dataTable = <div>Select classCode</div>;
        if (filter) {
            switch (filter.classCode) {
                case ClassCode.TQBR:
                    dataTable = (
                        <Shares shares={shares} onSelectRow={this.onSelectRow} selectedShares={selectedSecurities}/>
                    );
                    break;
                case ClassCode.CETS:
                    dataTable = (
                        <Currencies currencies={currencies} onSelectRow={this.onSelectRow} selectedCurrencies={selectedSecurities}/>
                    );
                    break;
                case ClassCode.SPBFUT:
                    dataTable = (
                        <Futures futures={futures} onSelectRow={this.onSelectRow} selectedFutures={selectedSecurities}/>
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
                                  security={selectedSecurities.length === 1 ? selectedSecurities[0] : null}
                                  premise={premise}/>
                    );
                    break;
                case ClassCode.CETS:
                    analysis = (
                        <Analysis classCode={filter ? filter.classCode : null}
                                  security={selectedSecurities.length === 1 ? selectedSecurities[0] : null}
                                  premise={premise}/>
                    );
                    break;
                case ClassCode.SPBFUT:
                    analysis = (
                        <AnalysisFutures classCode={filter ? filter.classCode : null}
                                  future={selectedSecurities.length === 1 ? selectedSecurities[0] : null}/>
                    );
                    break;
            }
        }

        return (
            <div className="p-grid sample-layout">
                <div className="p-col-12">
                    <Filter filter={filterData} onStart={this.onStart}/>
                </div>
                <div className="p-col-12">
                    <div className="p-col-12 p-col-nogutter">
                        Top Bar
                    </div>
                    <div className="p-col-12 p-col-nogutter">
                        {selectedSecuritiesView}
                    </div>
                    <div className="p-col-12">
                        <div className="p-grid">
                            <div className={classDataTable}>
                                {dataTable}
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
)(TradeStrategyAnalysisPage);
