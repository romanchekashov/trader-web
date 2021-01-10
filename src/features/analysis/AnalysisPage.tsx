import * as React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { AppDispatch } from "../../app/store";
import { RootState } from "../../app/rootReducer";
import { loadFilterData, loadSecurityCurrency, loadSecurityFuture, loadSecurityShares } from "./AnalysisActions";
import { MarketBotFilterDataDto } from "../../common/data/bot/MarketBotFilterDataDto";
import { MarketBotStartDto } from "../../common/data/bot/MarketBotStartDto";
import { SecurityShare } from "../../common/data/security/SecurityShare";
import { ClassCode } from "../../common/data/ClassCode";
import Analysis from "./analysis/Analysis";
import { SecurityCurrency } from "../../common/data/security/SecurityCurrency";
import { SecurityFuture } from "../../common/data/security/SecurityFuture";
import AnalysisFutures from "./analysis/AnalysisFutures";
import "./Analysis.css";
import { SecurityLastInfo } from "../../common/data/security/SecurityLastInfo";
import { setSelectedSecurity } from "../../common/utils/Cache";
import { Securities } from "./securities/Securities";
import { Market } from "../../common/data/Market";
import { AnalysisTinkoff } from "./analysis/AnalysisTinkoff";
import { StackEvent, StackService } from "../../common/components/stack/StackService";

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
        const { actions, filterData } = this.props

        if (!filterData) {
            actions.loadFilterData()
        }
    }

    componentWillUnmount = (): void => {
    }

    onSelectRow = (selectedSecurity: SecurityLastInfo) => {
        if (selectedSecurity) {
            this.setState({ selectedSecurity, isDetailsShown: true })
            setSelectedSecurity(selectedSecurity)
            StackService.getInstance().send(StackEvent.SECURITY_SELECTED, selectedSecurity)
        } else {
            this.setState({ selectedSecurity, isDetailsShown: false })
        }
    }

    render() {
        const { selectedSecurity, isDetailsShown } = this.state
        const classDataTable = isDetailsShown ? 'p-col-12' : 'p-col-12'
        const classDetails = isDetailsShown ? 'p-col-8' : 'hidden'

        return (
            <div className="p-grid sample-layout analysis">
                {/*<div className="p-col-12" style={{padding: 0}}>
                    <Filter filter={filterData} onStart={this.onStart}/>
                </div>*/}
                <div className={classDataTable}>
                    <div className="p-grid analysis-securities">
                        <Securities onSelectRow={this.onSelectRow} />
                    </div>
                </div>
                <div className={classDetails}>
                    {
                        !selectedSecurity ? <div>Select security</div>
                            : Market.SPB === selectedSecurity.market ?
                                <AnalysisTinkoff security={selectedSecurity} />
                                : ClassCode.SPBFUT === selectedSecurity.classCode ?
                                    <AnalysisFutures security={selectedSecurity} /> :
                                    <Analysis security={selectedSecurity} />
                    }
                </div>
            </div>
        )
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AnalysisPage)
