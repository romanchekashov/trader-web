import * as React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {AppDispatch} from "../../app/store";
import {RootState} from "../../app/rootReducer";
import {loadFilterData, loadSecurityCurrency, loadSecurityFuture, loadSecurityShares} from "./AnalysisActions";
import {MarketBotFilterDataDto} from "../../common/data/bot/MarketBotFilterDataDto";
import {MarketBotStartDto} from "../../common/data/bot/MarketBotStartDto";
import {SecurityShare} from "../../common/data/SecurityShare";
import {ClassCode} from "../../common/data/ClassCode";
import Analysis from "./analysis/Analysis";
import {SecurityCurrency} from "../../common/data/SecurityCurrency";
import {SecurityFuture} from "../../common/data/SecurityFuture";
import AnalysisFutures from "./analysis/AnalysisFutures";
import "./Analysis.css";
import {SecurityLastInfo} from "../../common/data/SecurityLastInfo";
import {setSelectedSecurity} from "../../common/utils/Cache";
import {Securities} from "./securities/Securities";

function mapStateToProps(state: RootState) {
    return {
        filterData: state.tradeStrategyAnalysis.filter,
        shares: state.tradeStrategyAnalysis.shares,
        currencies: state.tradeStrategyAnalysis.currencies,
        futures: state.tradeStrategyAnalysis.futures
    }
}

function mapDispatchToProps(dispatch: AppDispatch) {
    return {
        actions: {
            loadFilterData: bindActionCreators(loadFilterData, dispatch),
            loadSecurityShares: bindActionCreators(loadSecurityShares, dispatch),
            loadSecurityCurrency: bindActionCreators(loadSecurityCurrency, dispatch),
            loadSecurityFuture: bindActionCreators(loadSecurityFuture, dispatch)
        }
    }
}

interface TradeStrategyAnalysisState {
    selectedSecurity: SecurityLastInfo
    isDetailsShown: boolean
    filter: MarketBotStartDto
}

type Props = {
    filterData: MarketBotFilterDataDto
    shares: SecurityShare[]
    currencies: SecurityCurrency[]
    futures: SecurityFuture[]
} & ReturnType<typeof mapDispatchToProps>

class AnalysisPage extends React.Component<Props, TradeStrategyAnalysisState> {

    constructor(props) {
        super(props)

        this.state = {
            selectedSecurity: null,
            isDetailsShown: false,
            filter: null
        }
    }

    componentDidMount(): void {
        const {actions, filterData} = this.props

        if (!filterData) {
            actions.loadFilterData()
        }
    }

    componentWillUnmount = (): void => {
    }

    onSelectRow = (selectedSecurity: SecurityLastInfo) => {
        if (selectedSecurity) {
            this.setState({selectedSecurity, isDetailsShown: true})
            setSelectedSecurity(selectedSecurity)
        } else {
            this.setState({selectedSecurity, isDetailsShown: false})
        }
    }

    render() {
        const {selectedSecurity, isDetailsShown} = this.state
        let selectedSecuritiesView = null

        if (selectedSecurity) {
            selectedSecuritiesView = (
                <div key={selectedSecurity.secCode}>{selectedSecurity.secCode}</div>
            )
        }
        const classDataTable = isDetailsShown ? 'p-col-3' : 'p-col-12'
        const classDetails = isDetailsShown ? 'p-col-9' : 'hidden'

        let analysis = <div>Select security</div>
        if (selectedSecurity) {
            if (ClassCode.SPBFUT === selectedSecurity.classCode) {
                analysis = (
                    <AnalysisFutures security={selectedSecurity}/>
                )
            } else {
                analysis = (
                    <Analysis security={selectedSecurity}/>
                )
            }
        }

        return (
            <div className="p-grid sample-layout analysis">
                {/*<div className="p-col-12" style={{padding: 0}}>
                    <Filter filter={filterData} onStart={this.onStart}/>
                </div>*/}
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
        )
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AnalysisPage)
