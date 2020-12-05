import * as React from "react";
import {useState} from "react";
import "./RunningStrategyTable.css";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import {ColumnGroup} from "primereact/columngroup";
import {Row} from "primereact/row";
import TreeNode from "primereact/components/treenode/TreeNode";
import {TradingStrategyResult} from "../../../../common/data/history/TradingStrategyResult";
import {ClassCode} from "../../../../common/data/ClassCode";
import {JournalTradeDto} from "../../../../common/data/journal/JournalTradeDto";
import {OperationType} from "../../../../common/data/OperationType";
import {TradingStrategyTrade} from "../../../../common/data/history/TradingStrategyTrade";
import {TradingStrategyTradeState} from "../../../../common/data/history/TradingStrategyTradeState";
import {TradeSystemType} from "../../../../common/data/trading/TradeSystemType";
import moment = require("moment");

export interface RunningStrategyTableState {
    expandedRows: TradingStrategyResult[]
}

interface TableElementData {
    id: number
    name: string
    type: TradeSystemType
    secName: string
    deposit: number
    lastTradeState: TradingStrategyTradeState
    total: number
}

type Props = {
    results: TradingStrategyResult[]
    onSelectedTsId: (tsId: number) => void
}

export const RunningStrategyTable: React.FC<Props> = ({results, onSelectedTsId}) => {
    let initState: RunningStrategyTableState = {
        expandedRows: []
    }

    const [selectedTsId, setSelectedTsId] = useState<number>(null)
    const classCodes = [ClassCode.SPBFUT, ClassCode.TQBR, ClassCode.CETS]
    const [expandedRows, setExpandedRows] = useState(initState.expandedRows)

    const mapToData = (results: TradingStrategyResult[]): TableElementData[] => (results
        .map(result => {
            const lastTrade = result.tradingStrategyData.trades.length > 0
                ? result.tradingStrategyData.trades[0] : null

            return {
                id: result.tradingStrategyData.id,
                name: result.tradingStrategyData.name,
                type: result.tradingStrategyData.systemType,
                secName: result.tradingStrategyData.security.shortName,
                deposit: result.tradingStrategyData.deposit,
                lastTradeState: lastTrade?.state,
                total: result.stat?.totalGainAndLoss
            }
        }))

    const createNodes = (trades: JournalTradeDto[]): TreeNode[] => {
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
    };

    const onRowToggle = (e) => {
        setExpandedRows(e.data);
    };

    const rowExpansionTemplate = (data: any) => {
        return data.trades.map(trade => {
            return (
                <div className="p-grid" key={trade.id}>
                    <div className="p-col-1">{trade.id}</div>
                    <div className="p-col-1">{trade.operation === OperationType.SELL ? 'SELL' : 'BUY'}</div>
                    <div className="p-col-1">{trade.price}</div>
                    <div className="p-col-1">{trade.quantity}</div>
                    <div className="p-col-1">{trade.value}</div>
                    <div className="p-col-1">{moment(trade.dateTime).format("DD-MM-YYYY HH:mm:ss")}</div>
                </div>
            );
        });
    };

    const isShortTemplate = (rowData: any, {field}) => {
        return rowData[field] ? <span className="fin-short">S</span> : <span className="fin-long">L</span>;
    };

    const dateTemplate = (rowData: any, {field}) => {
        return moment(rowData[field]).format("DD-MM-YYYY");
    };

    const dayOfWeekTemplate = (rowData: any, {field}) => {
        return moment(rowData[field]).format("ddd");
    };

    const timeTemplate = (rowData: any, {field}) => {
        return moment(rowData[field]).format("HH:mm:ss");
    };

    const timeSpent = (rowData: any) => {
        const dates = rowData.trades.map(trade => trade.dateTime).sort((a, b) => {
            return new Date(a).getTime() - new Date(b).getTime();
        });
        // console.log(dates);
        return moment.duration(moment(dates[dates.length - 1]).diff(moment(dates[0]))).humanize();
        // return moment(rowData[field]).format("HH:mm:ss");
    };

    const getTotalGainAndLoss = (tsTrade: TradingStrategyTrade): number => {
        let totalGainAndLoss = 0;
        tsTrade.trades.forEach(trade => {
            if (trade.operation === tsTrade.operation) {
                totalGainAndLoss += trade.value;
            } else {
                totalGainAndLoss -= trade.value;
            }
        });
        return totalGainAndLoss;
    }

    const rowBgColor = (data: TableElementData): any => {
        let totalGainAndLoss = data.total
        const className = {
            // 'no-expander': !tsTrade.trades || tsTrade.trades.length === 0
        }

        if (totalGainAndLoss > 0) {
            if (totalGainAndLoss > 3000) {
                className['win-lg'] = true
            } else if (totalGainAndLoss > 1000) {
                className['win'] = true
            } else {
                className['win-sm'] = true
            }
        }

        if (totalGainAndLoss < 0) {
            if (totalGainAndLoss < -3000) {
                className['loss-lg'] = true
            } else if (totalGainAndLoss < -1000) {
                className['loss'] = true
            } else {
                className['loss-sm'] = true
            }
        }

        return className
    }

    const headerGroup = (
        <ColumnGroup>
            <Row>
                <Column header="" style={{width: '10px'}}/>
                <Column header="№" style={{width: '10px'}}/>
                <Column header="Strategy" style={{width: '30px'}}/>
                <Column header="Type" style={{width: '20px'}}/>
                <Column header="Sec. Name" style={{width: '30px'}}/>
                <Column header="Deposit" style={{width: '30px'}}/>
                <Column header="Result" style={{width: '30px'}}/>
                <Column header="Last Trade" style={{width: '30px'}}/>

                {/*<Column header="Op." style={{width: '30px'}}/>*/}
                {/*<Column header="In Order N."/>*/}
                {/*<Column header="Stop Order TransId"/>*/}
                {/*<Column header="T1 Order N."/>*/}
                {/*<Column header="T2 Order N."/>*/}
                {/*<Column header="Kill Order N."/>*/}
                {/*<Column header="Kill Exc. Order N."/>*/}
                {/*<Column header="State"/>*/}

                {/*<Column header="Stop"/>*/}
                {/*<Column header="T1"/>*/}
                {/*<Column header="T2"/>*/}
                {/*<Column header="Last Wholesale Price"/>*/}
                {/*<Column header="Last Reward Risk Ratio Price"/>*/}
                {/*<Column header="Qty" style={{width: '50px'}}/>*/}

                {/*<Column header="Real In Qty" style={{width: '50px'}}/>*/}
                {/*<Column header="Real In"/>*/}
                {/*<Column header="Real Stop"/>*/}
                {/*<Column header="Real T1"/>*/}
                {/*<Column header="Real T2"/>*/}
                {/*<Column header="Real Kill"/>*/}
                {/*<Column header="Real Kill Exc."/>*/}
                {/*<Column header="Left Qty" style={{width: '50px'}}/>*/}
            </Row>
        </ColumnGroup>
    )

    const sum = () => {
        const sum = results
            .map(value => value.stat?.totalGainAndLoss || 0)
            .reduce((a, b) => a + b, 0)
        return Math.floor(sum)
    }

    const footerGroup = (
        <ColumnGroup>
            <Row>
                <Column footer="Totals:" colSpan={6} footerStyle={{textAlign: 'right'}}/>
                <Column footer={sum()}/>
                <Column/>
            </Row>
        </ColumnGroup>
    )

    return (
        <DataTable value={mapToData(results)}
                   className="history-strategy-result-table"
                   headerColumnGroup={headerGroup}
                   footerColumnGroup={footerGroup}
                   expandedRows={expandedRows}
                   onRowClick={e => onSelectedTsId(e.data.id)}
            // onRowToggle={onRowToggle}
            rowClassName={rowBgColor}
            // rowExpansionTemplate={rowExpansionTemplate}
                   dataKey="id"
                   paginator
                   paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                   currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
                   rows={15}
                   rowsPerPageOptions={[15,20,50]}>

            <Column expander={true}/>
            <Column field="id" style={{width: '10px'}}/>
            <Column field="name" style={{width: '30px'}}/>
            <Column field="type" style={{width: '20px'}}/>
            <Column field="secName" style={{width: '30px'}}/>
            <Column field="deposit" style={{width: '30px'}}/>
            <Column field="total" style={{width: '30px'}}/>
            <Column field="lastTradeState" style={{width: '30px'}}/>

            {/*<Column field="operation" style={{width: '30px'}}/>*/}
            {/*<Column field="enterOrderNumber" style={{overflow: 'auto'}}/>*/}
            {/*<Column field="stopOrderTransactionId" style={{overflow: 'auto'}}/>*/}
            {/*<Column field="firstTargetOrderNumber" style={{overflow: 'auto'}}/>*/}
            {/*<Column field="secondTargetOrderNumber" style={{overflow: 'auto'}}/>*/}
            {/*<Column field="killOrderNumber" style={{overflow: 'auto'}}/>*/}
            {/*<Column field="killExceptionOrderNumber" style={{overflow: 'auto'}}/>*/}
            {/*<Column field="state" style={{overflow: 'auto'}}/>*/}

            {/*<Column field="stopPrice"/>*/}
            {/*<Column field="targetPrice1"/>*/}
            {/*<Column field="targetPrice2"/>*/}
            {/*<Column field="lastWholesalePrice"/>*/}
            {/*<Column field="lastRewardRiskRatioPrice"/>*/}
            {/*<Column field="quantity" style={{width: '50px'}}/>*/}

            {/*<Column field="realEntryQuantity" style={{width: '50px'}}/>*/}
            {/*<Column field="realEntryPrice"/>*/}
            {/*<Column field="realStoppedPrice"/>*/}
            {/*<Column field="realTargetPrice1"/>*/}
            {/*<Column field="realTargetPrice2"/>*/}
            {/*<Column field="realKillPrice"/>*/}
            {/*<Column field="realKillExceptionPrice"/>*/}
            {/*<Column field="leftQuantity" style={{width: '50px'}}/>*/}
        </DataTable>
    )
};
