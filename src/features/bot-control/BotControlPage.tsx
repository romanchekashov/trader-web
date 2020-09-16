import * as React from "react";
import {connect} from "react-redux";
import {MarketBotFilterDataDto} from "../../common/data/bot/MarketBotFilterDataDto";
import {bindActionCreators} from "redux";
import {loadFilterData} from "./BotControlActions";
import {AppDispatch} from "../../app/store";
import {RootState} from "../../app/rootReducer";
import {BotControlFilter} from "./filter/BotControlFilter";
import {MarketBotStartDto} from "../../common/data/bot/MarketBotStartDto";
import {
    runHistory,
    search,
    searchByTradingStrategyId,
    startBot,
    stopHistory
} from "../../common/api/rest/botControlRestApi";
import {TradingStrategyResult} from "../../common/data/history/TradingStrategyResult";
import {HistoryStrategyResultTable} from "./table/HistoryStrategyResultTable";
import {TradeSystemType} from "../../common/data/trading/TradeSystemType";
import ProfitLossChart from "../trade-journal/profitLossChart/ProfitLossChart";
import {TradeJournalStatistic} from "../trade-journal/statistic/TradeJournalStatistic";
import {TradeJournalTable} from "../trade-journal/table/TradeJournalTable";
import {BotControlLastInfo} from "./last-info/BotControlLastInfo";
import {TabPanel, TabView} from "primereact/tabview";
import {BotControlAnalysis} from "./analysis/BotControlAnalysis";
import {getSecurity} from "../../common/utils/Cache";
import {BotControlAnalysisInfo} from "./analysis/BotControlAnalysisInfo";
import {BotControlRunningStrategies} from "./last-info/BotControlRunningStrategies";
import {RunningStrategy} from "./running-strategy/RunningStrategy";


function mapStateToProps(state: RootState) {
    return {
        filterData: state.tradeStrategyBotControl.filter
    };
}

function mapDispatchToProps(dispatch: AppDispatch) {
    return {
        actions: {
            loadFilterData: bindActionCreators(loadFilterData, dispatch)
        }
    };
}

interface BotControlState {
    filterData: MarketBotFilterDataDto
    items: any[]
    activeItem: any
    selectedSecurity: any
    selectedTSResult: TradingStrategyResult
}

type Props = ReturnType<typeof mapStateToProps> &
    ReturnType<typeof mapDispatchToProps>;

class BotControlPage extends React.Component<Props, BotControlState> {

    private items = [
        {label: 'Current State', icon: 'pi pi-fw pi-home'},
        {label: 'Real Deposit Stats', icon: 'pi pi-fw pi-calendar'},
        {label: 'Demo Deposit Stats', icon: 'pi pi-fw pi-pencil'},
        {label: 'History Stats', icon: 'pi pi-fw pi-file'}
    ]

    constructor(props) {
        super(props);
        this.state = {
            filterData: null,
            items: this.items,
            activeItem: this.items[0],
            selectedSecurity: null,
            selectedTSResult: null
        };
    }

    componentDidMount = (): void => {
        const {actions, filterData} = this.props;

        if (!filterData) {
            actions.loadFilterData();
        }
    }

    onStart = (data: MarketBotStartDto): void => {
        if (data.systemType === TradeSystemType.HISTORY) {
            runHistory(data)
                .then(selectedTSResult => this.setState({selectedTSResult}))
                .catch(console.error);
        } else {
            startBot(data).then(value => {
                console.log(data, value);
            }).catch(console.error);
        }
    }

    onSearch = (data: MarketBotStartDto): void => {
        search(data)
            .then(selectedTSResult => this.setState({selectedTSResult}))
            .catch(console.error);
    }

    onStopHistory = (data: MarketBotStartDto): void => {
        if (data.systemType === TradeSystemType.HISTORY) {
            stopHistory(data).then(value => {
                console.log(data, value);
            }).catch(console.error);
        }
    }

    onSelectedTSResultUpdate = (result: TradingStrategyResult): void => {
        this.setState({
            selectedTSResult: result
        });
    }

    onStrategyResultSelected = (result: TradingStrategyResult): void => {
        this.setState({
            selectedTSResult: result,
            selectedSecurity: getSecurity(
                result.tradingStrategyData.security.classCode,
                result.tradingStrategyData.security.secCode)
        })

        if (result.tradingStrategyData.id) {
            searchByTradingStrategyId(result.tradingStrategyData.id)
                .then(selectedTSResult => this.setState({selectedTSResult}))
                .catch(console.error);
        }
    }

    render() {
        const {filterData} = this.props;
        const {selectedTSResult, selectedSecurity} = this.state;

        return (
            <div className="p-grid sample-layout">
                <div className="p-col-12">
                    <BotControlFilter filter={filterData}
                                      onStart={this.onStart}
                                      onSearch={this.onSearch}
                                      onStopHistory={this.onStopHistory}/>
                </div>
                <div className="p-col-12">
                    <div className="p-grid">
                        <div className="p-col-2">
                            <TabView>
                                <TabPanel header="History">
                                    <BotControlLastInfo outerHeight={400}
                                                        onStrategyResultSelected={this.onStrategyResultSelected}
                                                        onSelectedTSResultUpdate={this.onSelectedTSResultUpdate}/>
                                </TabPanel>
                                <TabPanel header="Running">
                                    <RunningStrategy tradingStrategyResult={selectedTSResult}/>
                                </TabPanel>
                            </TabView>
                        </div>
                        <div className="p-col-10" style={{padding: 0}}>
                            <TabView>
                                <TabPanel header="Analysis">
                                    <BotControlAnalysis security={selectedSecurity}
                                                        tradingStrategyResult={selectedTSResult}/>
                                </TabPanel>
                                <TabPanel header="Strategy Stat">
                                    <HistoryStrategyResultTable stat={selectedTSResult}/>
                                </TabPanel>
                                <TabPanel header="Profit Loss Stat">
                                    <div className="p-col-12">
                                        <ProfitLossChart stat={selectedTSResult?.stat}/>
                                    </div>
                                    <div className="p-col-12">
                                        <TradeJournalStatistic stat={selectedTSResult?.stat}/>
                                    </div>
                                </TabPanel>
                                <TabPanel header="Trades">
                                    <TradeJournalTable stat={selectedTSResult?.stat}/>
                                </TabPanel>
                                <TabPanel header="Info">
                                    <BotControlAnalysisInfo security={selectedSecurity}/>
                                </TabPanel>
                            </TabView>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BotControlPage);
