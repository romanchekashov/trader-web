import * as React from "react";
import {connect} from "react-redux";
import {MarketBotFilterDataDto} from "../../common/data/bot/MarketBotFilterDataDto";
import {bindActionCreators} from "redux";
import {loadFilterData} from "./BotControlActions";
import {AppDispatch} from "../../app/store";
import {RootState} from "../../app/rootReducer";
import {BotControlFilter} from "./filter/BotControlFilter";
import {MarketBotStartDto} from "../../common/data/bot/MarketBotStartDto";
import {runHistory, startBot, stopHistory} from "../../common/api/rest/botControlRestApi";
import {ResultDto} from "../../common/data/journal/ResultDto";
import ProfitLossChart from "../trade-journal/profitLossChart/ProfitLossChart";
import {TradeJournalStatistic} from "../trade-journal/statistic/TradeJournalStatistic";
import {TradeJournalTable} from "../trade-journal/table/TradeJournalTable";


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
    stat: ResultDto[]
}

type Props = ReturnType<typeof mapStateToProps> &
    ReturnType<typeof mapDispatchToProps>;

class BotControlPage extends React.Component<Props, BotControlState> {

    constructor(props) {
        super(props);
        this.state = {filterData: null, stat: []};
    }

    componentDidMount = (): void => {
        const { actions, filterData } = this.props;

        if (!filterData) {
            actions.loadFilterData();
        }
    }

    onStart = (data: MarketBotStartDto): void => {
        if (data.historySetup) {
            runHistory(data)
                .then(stat => this.setState({stat}))
                .catch(console.error);
        } else {
            startBot(data).then(value => {
                console.log(data, value);
            }).catch(console.error);
        }
    }

    onStopHistory = (data: MarketBotStartDto): void => {
        if (data.historySetup) {
            stopHistory(data).then(value => {
                console.log(data, value);
            }).catch(console.error);
        }
    }

    render() {
        const { filterData } = this.props;
        const { stat } = this.state;

        return (
            <div className="p-grid sample-layout">
                <div className="p-col-12" style={{backgroundColor: "aliceblue"}}>
                    <BotControlFilter filter={filterData}
                                      onStart={this.onStart}
                                      onStopHistory={this.onStopHistory}/>
                </div>
                {
                    stat.length > 0 ?
                        <>
                            <div className="p-col-12">
                                <ProfitLossChart stat={stat[0]}/>
                            </div>
                            <div className="p-col-12">
                                <TradeJournalStatistic stat={stat[0]}/>
                            </div>
                            <div className="p-col-12 journal-trades-table">
                                <TradeJournalTable stat={stat}/>
                            </div>
                        </>
                        : null
                }
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(BotControlPage);
