import * as React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {AppDispatch} from "../../app/store";
import {RootState} from "../../app/rootReducer";
import {loadFilterData, loadSecurityShares} from "./tradeStrategyAnalysisActions";
import {MarketBotFilterDataDto} from "../tradestrategybotcontrol/dto/MarketBotFilterDataDto";
import {MarketBotStartDto} from "../tradestrategybotcontrol/dto/MarketBotStartDto";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import {SecurityShare} from "../../api/dto/SecurityShare";
import Filter from "./filter/Filter";
import {ClassCode} from "../../api/dto/ClassCode";
import Analysis from "./analysis/Analysis";


function mapStateToProps(state: RootState) {
    return {
        filterData: state.tradeStrategyAnalysis.filter,
        shares: state.tradeStrategyAnalysis.shares
    };
}

function mapDispatchToProps(dispatch: AppDispatch) {
    return {
        actions: {
            loadFilterData: bindActionCreators(loadFilterData, dispatch),
            loadSecurityShares: bindActionCreators(loadSecurityShares, dispatch)
        }
    };
}

interface TradeStrategyAnalysisState {
    selectedShares: SecurityShare[]
    isDetailsShown: boolean
    columns: any[]
    selectedColumns: any[]
    filter: MarketBotStartDto
}

type Props = {
    filterData: MarketBotFilterDataDto
    shares: SecurityShare[]
} & ReturnType<typeof mapDispatchToProps>;

class TradeStrategyAnalysisPage extends React.Component<Props, TradeStrategyAnalysisState> {

    private columns = [
        {field: 'secCode', header: 'secCode'},
        {field: 'shortName', header: 'shortName'},
        {field: 'lastTradePrice', header: 'lastTradePrice'},
        {field: 'lastChange', header: 'lastChange'},
        {field: 'lastTradeQuantity', header: 'lastTradeQuantity'},
        {field: 'lotSize', header: 'lotSize'},
        {field: 'issueSize', header: 'issueSize'},
        {field: 'weightedAveragePrice', header: 'weightedAveragePrice'},
        {field: 'todayMoneyTurnover', header: 'todayMoneyTurnover'},
        {field: 'numberOfTradesToday', header: 'numberOfTradesToday'}
    ];

    constructor(props) {
        super(props);

        this.state = {
            selectedShares: [],
            isDetailsShown: false,
            columns: this.columns,
            selectedColumns: this.columns,
            filter: null
        };
    }

    componentDidMount(): void {
        const { actions, filterData } = this.props;

        if (!filterData) {
            actions.loadFilterData();
        }
    }

    onStart = (data: MarketBotStartDto): void => {
        console.log(data);
        this.setState({filter: data});
        if (data) {
            if (data.classCode === ClassCode.TQBR) {
                this.props.actions.loadSecurityShares();
            }
        }
    };

    onSelectRow = (e) => {
        const selectedShares = e.value;
        if (selectedShares && selectedShares.length > 0) {
            this.setState({selectedShares, isDetailsShown: true, selectedColumns: [
                    {field: 'secCode', header: 'secCode'},
                    {field: 'shortName', header: 'shortName'},
                    {field: 'lastTradePrice', header: 'lastTradePrice'},
                    {field: 'lastChange', header: 'lastChange'}
                ]});
        } else {
            this.setState({selectedShares, isDetailsShown: false, selectedColumns: this.columns});
        }
    };

    render() {
        const { filterData, shares } = this.props;
        const { selectedShares, isDetailsShown, filter } = this.state;
        let selectedSharesView = [];
        if (selectedShares) {
            selectedSharesView = selectedShares.map(share => (
                <div key={share.secCode}>{share.secCode}</div>
            ));
        }
        const classDataTable = isDetailsShown ? 'p-col-6' : 'p-col-12';
        const classDetails = isDetailsShown ? 'p-col-6' : 'hidden';

        const columnComponents = this.state.selectedColumns.map(col=> {
            return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true} />;
        });

        return (
            <div className="p-grid sample-layout">
                <div className="p-col-12">
                    <Filter filter={filterData} onStart={this.onStart}/>
                </div>
                <div className="p-col-12">
                    <div className="p-col-12 p-col-nogutter">
                        Top Bar
                    </div>
                    <div className="p-col-12 p-col-nogutter">
                        {selectedSharesView}
                    </div>
                    <div className="p-col-12">
                        <div className="p-grid">
                            <div className={classDataTable}>
                                <DataTable value={shares} responsive
                                           selection={selectedShares}
                                           onSelectionChange={this.onSelectRow}>
                                    <Column selectionMode="multiple" style={{width:'2em'}}/>
                                    {columnComponents}
                                </DataTable>
                            </div>
                            <div className={classDetails}>
                                <Analysis classCode={filter ? filter.classCode : null} security={selectedShares[0]}/>
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
)(TradeStrategyAnalysisPage);
