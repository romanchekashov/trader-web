import * as React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import {AppDispatch} from "../../app/store";
import {RootState} from "../../app/rootReducer";
import {loadStat} from "./tradeJournalActions";
import {ResultDto} from "../../api/tradejournal/dto/ResultDto";
import {Column} from "primereact/column";
import {Row} from "primereact/row";
import {ColumnGroup} from "primereact/columngroup";
import TreeNode from "primereact/components/treenode/TreeNode";
import {JournalTradeDto} from "../../api/tradejournal/dto/JournalTradeDto";
import {DataTable} from "primereact/datatable";
import {Trade} from "../../api/tradejournal/dto/Trade";
import moment = require("moment");
import "./TradeJournalPage.css";

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
        this.state = { stat: [], expandedRows: [] };
    }

    componentDidMount(): void {
        const { actions, stat } = this.props;

        if (stat.length === 0) {
            actions.loadStat();
        }
    }

    createNodes(trades: JournalTradeDto[]): TreeNode[] {
        const nodes: TreeNode[] = [];
        trades.forEach(journalTrade => {
            const tradesNodes: TreeNode[] = [];
            journalTrade.trades.forEach(trade => {
                tradesNodes.push({
                    data: trade, children: null
                });
            });

            nodes.push({
                data: journalTrade,
                children: tradesNodes
            })
        });
        return nodes;
    }

    onRowToggle = (e) => {
        console.log(e.data);
        this.setState({expandedRows: e.data});
    };

    rowExpansionTemplate = (data: Trade) => {
        return  (
            <div className="p-grid p-fluid" style={{padding: '2em 1em 1em 1em'}}>
                <div className="p-col-12">
                    <div className="p-grid">
                        <div className="p-md-2">Vin: </div>
                        <div className="p-md-10" style={{fontWeight:'bold'}}>{data.price}</div>

                        <div className="p-md-2">Year: </div>
                        <div className="p-md-10" style={{fontWeight:'bold'}}>{data.quantity}</div>

                        <div className="p-md-2">Brand: </div>
                        <div className="p-md-10" style={{fontWeight:'bold'}}>{data.value}</div>

                        <div className="p-md-2">Color: </div>
                        <div className="p-md-10" style={{fontWeight:'bold'}}>{data.sell}</div>
                    </div>
                </div>
            </div>
        );
    };

    isShortTemplate = (rowData: any, {field}) => {
        return rowData[field] ? (<span className="fin-long">L</span>) : (<span className="fin-short">S</span>);
    };

    dateTemplate = (rowData: any, {field}) => {
        return moment(rowData[field]).format("DD-MM-YYYY");
    };

    dayOfWeekTemplate = (rowData: any, {field}) => {
        return moment(rowData[field]).format("ddd");
    };

    timeTemplate = (rowData: any, {field}) => {
        return moment(rowData[field]).format("HH:mm:ss");
    };

    render() {
        const { stat } = this.props;

        if (stat.length === 0) {
            return (<div>Loading...</div>)
        }

        // const nodes = this.createNodes(stat[0].trades);

        const headerGroup = (
            <ColumnGroup>
                <Row>
                    <Column header="" rowSpan={3} />
                    <Column header="№" rowSpan={3} />
                    <Column header="Тикер" rowSpan={3} />
                    <Column header="Short/Long" rowSpan={3} />
                    <Column header="Вход" rowSpan={2} colSpan={6} />
                    <Column header="Выход" rowSpan={2} colSpan={6} />
                    <Column header="Коммисия" rowSpan={2} colSpan={3} />
                    <Column header="Риск менеджмент" colSpan={10} />
                    <Column header="Кол-во переносов через ночь(Рабочих дней в сделке)" rowSpan={3} />
                </Row>
                <Row>
                    <Column header="Цели по прибыли" colSpan={3} />
                    <Column header="Цели по убыткам(Макс. стоп)" colSpan={3} />
                    <Column header="Р/П" colSpan={2} />
                    <Column header="Прибыль/Убыток" colSpan={3} />
                </Row>
                <Row>
                    <Column header="Дата" />
                    <Column header="Неделя" />
                    <Column header="Время" />
                    <Column header="Позиция" />
                    <Column header="Сумма открытия" />
                    <Column header="Цена за 1шт." />

                    <Column header="Дата" />
                    <Column header="Неделя" />
                    <Column header="Время" />
                    <Column header="Закрыто" />
                    <Column header="Сумма закрытия" />
                    <Column header="Цена за 1шт." />

                    <Column header="% брокера" />
                    <Column header="Вход" />
                    <Column header="Выход" />

                    <Column header="Изменение цены за 1шт" />
                    <Column header="Сумма(руб)" />
                    <Column header="Сумма(%)" />

                    <Column header="Изменение цены за 1шт" />
                    <Column header="Сумма(руб)" />
                    <Column header="Сумма(%)" />

                    <Column header="Изменение цены за 1шт" />
                    <Column header="Сумма(%)" />
                    <Column header="Чистая Сумма(руб)" />
                </Row>
            </ColumnGroup>
        );

        return (
            <div className="p-grid sample-layout">
                <div className="p-col-12">
                </div>
                <div className="p-col-12 journal-trades-table">
                    <DataTable value={stat[0].trades}
                               headerColumnGroup={headerGroup}
                               expandedRows={this.state.expandedRows}
                               onRowToggle={this.onRowToggle}
                               rowExpansionTemplate={this.rowExpansionTemplate} dataKey="id">
                        <Column expander={true} style={{width: '2em'}} />
                        <Column field="id" />
                        <Column field="security.symbol" />
                        <Column field="isShort" body={this.isShortTemplate} />
                        <Column field="open" body={this.dateTemplate} />
                        <Column field="open" body={this.dayOfWeekTemplate} />
                        <Column field="open" body={this.timeTemplate} />
                        <Column field="openPosition" />
                        <Column field="openSum" />
                        <Column field="openPrice" />
                        <Column field="close" body={this.dateTemplate} />
                        <Column field="close" body={this.dayOfWeekTemplate} />
                        <Column field="close" body={this.timeTemplate} />
                        <Column field="closePosition" />
                        <Column field="closeSum" />
                        <Column field="closePrice" />
                        <Column field="security.brokerCommission" />
                        <Column field="openCommission" />
                        <Column field="closeCommission" />
                        <Column />
                        <Column />
                        <Column />
                        <Column />
                        <Column />
                        <Column />
                        <Column />
                        <Column field="priceChange" />
                        <Column field="priceChangePercentage" />
                        <Column field="totalGainAndLoss" />
                        <Column />
                    </DataTable>
                </div>
            </div>
        );
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TradeJournalPage);
