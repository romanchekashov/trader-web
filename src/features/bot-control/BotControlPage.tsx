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
import {BotControlHistory} from "./history/BotControlHistory";


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

interface TradeStrategyBotControlState {
    filterData: MarketBotFilterDataDto;
}

type Props = ReturnType<typeof mapStateToProps> &
    ReturnType<typeof mapDispatchToProps>;

class BotControlPage extends React.Component<Props, TradeStrategyBotControlState> {
    componentDidMount(): void {
        const { actions, filterData } = this.props;

        if (!filterData) {
            actions.loadFilterData();
        }
    }

    onStart(data: MarketBotStartDto): void {
        if (data.history) {
            runHistory(data).then(value => {
                console.log(data, value);
            }).catch(console.error);
        } else {
            startBot(data).then(value => {
                console.log(data, value);
            }).catch(console.error);
        }
    }

    onStopHistory(data: MarketBotStartDto): void {
        if (data.history) {
            stopHistory(data).then(value => {
                console.log(data, value);
            }).catch(console.error);
        }
    }

    render() {
        const { filterData } = this.props;

        return (
            <div className="p-grid sample-layout">
                <div className="p-col-12" style={{backgroundColor: "aliceblue"}}>
                    <BotControlFilter filter={filterData} onStart={this.onStart} onStopHistory={this.onStopHistory}/>
                </div>
                <div className="p-col-12 p-md-1">
                    Menu
                </div>
                <div className="p-col-12 p-md-11 p-col-nogutter">
                    <div className="p-col-12 p-col-nogutter">
                        Top Bar
                    </div>
                    <div className="p-col-12">
                        <div className="p-grid">
                            <div className="p-col-12 p-md-12">
                                <BotControlHistory />
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
)(BotControlPage);