import * as React from "react";
import { connect } from "react-redux";
import {Link} from "react-router-dom";
import {MarketBotFilterDataDto} from "./dto/MarketBotFilterDataDto";
import {bindActionCreators, Dispatch} from "redux";
import {loadFilterData} from "./tradeStrategyBotControlActions";
import {AppDispatch} from "../../app/store";
import {RootState} from "../../app/rootReducer";


function mapStateToProps(state: RootState) {
    return {
        filterData: state.filterData
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

class TradeStrategyBotControlPage extends React.Component<Props, TradeStrategyBotControlState> {
    componentDidMount(): void {
        const { actions, filterData } = this.props;

        if (!filterData) {
            actions.loadFilterData();
        }
    }

    render() {
        return (
            <div className="jumbotron">
                <h1>TradeStrategyBotControlPage</h1>
                <p>React, Redux and React Router for ultra-responsive web apps.</p>
                <Link to="about" className="btn btn-primary btn-lg">
                    Learn more
                </Link>
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TradeStrategyBotControlPage);
