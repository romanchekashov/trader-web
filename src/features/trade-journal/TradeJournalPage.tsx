import * as React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {AppDispatch} from "../../app/store";
import {RootState} from "../../app/rootReducer";
import {loadStat} from "./TradeJournalActions";
import {ResultDto} from "../../common/data/journal/ResultDto";
import {Trade} from "../../common/data/journal/Trade";
import ProfitLossChart from "./profitLossChart/ProfitLossChart";
import {TradeJournalFilter} from "./filter/TradeJournalFilter";
import {TradeJournalFilterDto} from "./filter/TradeJournalFilterDto";
import {getStat} from "../../common/api/rest/journalRestApi";
import {TradeJournalTable} from "./table/TradeJournalTable";
import {TradeJournalStatistic} from "./statistic/TradeJournalStatistic";

function mapStateToProps(state: RootState) {
    return {
        stat: state.tradeJournal.stat
    };
}

function mapDispatchToProps(dispatch: AppDispatch) {
    return {
        actions: {
            loadStat: bindActionCreators(loadStat, dispatch)
        }
    };
}

interface TradeJournalState {
    stat: ResultDto[];
    expandedRows: Trade[];
}

type Props = ReturnType<typeof mapStateToProps> &
    ReturnType<typeof mapDispatchToProps>;

class TradeJournalPage extends React.Component<Props, TradeJournalState> {

    constructor(props) {
        super(props);
        this.state = {stat: [], expandedRows: []};
    }

    componentDidMount(): void {
        const {actions, stat} = this.props;

        if (stat.length === 0) {
            actions.loadStat();
        }
    }

    onFilter = (filter: TradeJournalFilterDto): void => {
        getStat(filter)
            .then(stat => this.setState({stat}))
    };

    render() {
        const {stat} = this.state;

        if (stat.length === 0) {
            return (
                <div className="p-grid sample-layout">
                    <div className="p-col-12">
                        <TradeJournalFilter onFilter={this.onFilter}/>
                    </div>
                </div>
            )
        }

        return (
            <div className="p-grid sample-layout">
                <div className="p-col-12">
                    <TradeJournalFilter onFilter={this.onFilter}/>
                </div>
                <div className="p-col-6">
                    <ProfitLossChart stat={stat.length > 0 ? stat[0] : null}/>
                </div>
                <div className="p-col-6">
                    <TradeJournalStatistic stat={stat.length > 0 ? stat[0] : null}/>
                </div>
                <div className="p-col-12 journal-trades-table">
                    <TradeJournalTable stat={stat}/>
                </div>
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TradeJournalPage);
