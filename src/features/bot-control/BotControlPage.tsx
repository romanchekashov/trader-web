import * as React from "react";
import {connect} from "react-redux";
import {MarketBotFilterDataDto} from "../../common/data/bot/MarketBotFilterDataDto";
import {bindActionCreators} from "redux";
import {loadFilterData} from "./BotControlActions";
import {AppDispatch} from "../../app/store";
import {RootState} from "../../app/rootReducer";
import {BotControlFilter} from "./filter/BotControlFilter";
import {MarketBotStartDto} from "../../common/data/bot/MarketBotStartDto";
import {runHistory, search, startBot, stopHistory} from "../../common/api/rest/botControlRestApi";
import {HistoryStrategyResultDto} from "../../common/data/history/HistoryStrategyResultDto";
import {HistoryStrategyResultTable} from "./table/HistoryStrategyResultTable";
import {TradeSystemType} from "../../common/data/trading/TradeSystemType";
import ProfitLossChart from "../trade-journal/profitLossChart/ProfitLossChart";
import {TradeJournalStatistic} from "../trade-journal/statistic/TradeJournalStatistic";
import {TradeJournalTable} from "../trade-journal/table/TradeJournalTable";
import {TabMenu} from "primereact/tabmenu";
import {BotControlLastInfo} from "./last-info/BotControlLastInfo";
import {TabPanel, TabView} from "primereact/tabview";
import {BotControlAnalysis} from "./analysis/BotControlAnalysis";
import {getSecurity} from "../../common/utils/Cache";
import {BotControlAnalysisInfo} from "./analysis/BotControlAnalysisInfo";


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
    stat: HistoryStrategyResultDto
    items: any[]
    activeItem: any
    selectedSecurity: any
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
            stat: null,
            items: this.items,
            activeItem: this.items[0],
            selectedSecurity: null
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
                .then(stat => this.setState({stat}))
                .catch(console.error);
        } else {
            startBot(data).then(value => {
                console.log(data, value);
            }).catch(console.error);
        }
    }

    onSearch = (data: MarketBotStartDto): void => {
        search(data)
            .then(stat => this.setState({stat}))
            .catch(console.error);
    }

    onStopHistory = (data: MarketBotStartDto): void => {
        if (data.systemType === TradeSystemType.HISTORY) {
            stopHistory(data).then(value => {
                console.log(data, value);
            }).catch(console.error);
        }
    }

    onStrategyResultSelected = (stat: HistoryStrategyResultDto): void => {
        this.setState({
            stat,
            selectedSecurity: getSecurity(stat.tradingStrategyData.security.classCode, stat.tradingStrategyData.security.futureSecCode)
        })
    }

    render() {
        const {filterData} = this.props;
        const {stat, selectedSecurity} = this.state;

        return (
            <div className="p-grid sample-layout">
                <div className="p-col-12" style={{backgroundColor: "aliceblue"}}>
                    <BotControlFilter filter={filterData}
                                      onStart={this.onStart}
                                      onSearch={this.onSearch}
                                      onStopHistory={this.onStopHistory}/>
                </div>
                <div className="p-col-12">
                    <div className="p-grid">
                        <div className="p-col-2">
                            <BotControlLastInfo outerHeight={400}
                                                onStrategyResultSelected={this.onStrategyResultSelected}/>
                        </div>
                        <div className="p-col-10" style={{padding: 0}}>
                            <TabView>
                                <TabPanel header="Analysis">
                                    <BotControlAnalysis security={selectedSecurity}/>
                                </TabPanel>
                                <TabPanel header="Strategy Stat">
                                    {
                                        stat != null ? <HistoryStrategyResultTable stat={stat}/> : null
                                    }
                                </TabPanel>
                                <TabPanel header="Profit Loss Stat">
                                    {
                                        stat != null ? <>
                                            <div className="p-col-12">
                                                <ProfitLossChart stat={stat.stat}/>
                                            </div>
                                            <div className="p-col-12">
                                                <TradeJournalStatistic stat={stat.stat}/>
                                            </div>
                                        </> : null
                                    }
                                </TabPanel>
                                <TabPanel header="Trades">
                                    {
                                        stat != null ? <TradeJournalTable stat={stat.stat}/> : null
                                    }
                                </TabPanel>
                                <TabPanel header="Info">
                                    <BotControlAnalysisInfo security={selectedSecurity}/>
                                </TabPanel>
                            </TabView>
                            {/*<TabMenu model={this.state.items}
                                     activeItem={this.state.activeItem}
                                     onTabChange={(e) => this.setState({activeItem: e.value})}/>*/}
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
