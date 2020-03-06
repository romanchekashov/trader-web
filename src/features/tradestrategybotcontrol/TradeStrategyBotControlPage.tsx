import * as React from "react";
import {connect} from "react-redux";
import {MarketBotFilterDataDto} from "./dto/MarketBotFilterDataDto";
import {bindActionCreators} from "redux";
import {loadFilterData} from "./tradeStrategyBotControlActions";
import {AppDispatch} from "../../app/store";
import {RootState} from "../../app/rootReducer";
import Filter from "./Filter";


function mapStateToProps(state: RootState) {
    return {
        filterData: state.tradeStrategyBotControl
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
        const { filterData } = this.props;

        return (
            <>
                <Filter filter={filterData}/>
            </>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TradeStrategyBotControlPage);
