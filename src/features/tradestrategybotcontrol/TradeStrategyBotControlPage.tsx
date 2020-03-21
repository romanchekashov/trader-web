import * as React from "react";
import {connect} from "react-redux";
import {MarketBotFilterDataDto} from "./dto/MarketBotFilterDataDto";
import {bindActionCreators} from "redux";
import {loadFilterData} from "./tradeStrategyBotControlActions";
import {AppDispatch} from "../../app/store";
import {RootState} from "../../app/rootReducer";
import Filter from "./Filter";
import {MarketBotStartDto} from "./dto/MarketBotStartDto";


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

class TradeStrategyBotControlPage extends React.Component<Props, TradeStrategyBotControlState> {
    componentDidMount(): void {
        const { actions, filterData } = this.props;

        if (!filterData) {
            actions.loadFilterData();
        }
    }

    onStart(data: MarketBotStartDto): void {
        console.log(data);
    }

    render() {
        const { filterData } = this.props;

        return (
            <div className="p-grid sample-layout">
                <div className="p-col-12">
                    <Filter filter={filterData} onStart={this.onStart}/>
                </div>
                <div className="p-col-12 p-md-2">
                    Menu
                </div>
                <div className="p-col-12 p-md-10 p-col-nogutter">
                    <div className="p-col-12 p-col-nogutter">
                        Top Bar
                    </div>
                    <div className="p-col-12">
                        <div className="p-grid">
                            <div className="p-col-12 p-md-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed imperdiet, orci nec
                                dictum convallis, ligula mauris vestibulum turpis, nec varius tortor quam at diam. Nullam a viverra nibh.
                                In tincidunt tempor lectus quis vulputate. Pellentesque nec dui aliquam, lobortis est in, lobortis ante</div>
                            <div className="p-col-12 p-md-4">Maecenas vel nisi aliquet, vulputate tortor id, laoreet massa. Maecenas mattis
                                tristique bibendum. Suspendisse vel mi dictum, vestibulum lacus quis, pulvinar quam. Proin vulputate, nibh
                                at finibus varius, leo eros lacinia elit, nec blandit odio tellus a justo. Donec nec ex auctor, tristique
                                nulla nec, rutrum sapien.</div>
                            <div className="p-col-12 p-md-4">Proin efficitur in leo eget ornare. Nam vestibulum neque sed velit sagittis
                                sodales. Sed scelerisque hendrerit magna a hendrerit. Cras tempor sem at justo pharetra convallis.
                                Curabitur vel sodales purus. Vestibulum interdum facilisis nulla imperdiet suscipit. Quisque lectus felis,
                                condimentum eget hendrerit sit amet.</div>


                            <div className="p-col-12 p-md-6">Phasellus faucibus purus volutpat mauris lacinia sodales. Ut sit amet sapien
                                facilisis, commodo dui non, fringilla tellus. Quisque tempus facilisis nisi sodales finibus. Pellentesque
                                neque orci, ullamcorper vitae ligula quis, dignissim euismod augue.</div>
                            <div className="p-col-12 p-md-6">Fusce ullamcorper congue massa, eget ullamcorper nunc lobortis egestas. Lorem
                                ipsum dolor sit amet, consectetur adipiscing elit. Quisque ultrices dui eget dolor feugiat dapibus. Aliquam
                                pretium leo et egestas luctus. Nunc facilisis gravida tellus.</div>
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
)(TradeStrategyBotControlPage);
