import * as React from "react";
import {useEffect, useState} from "react";
import "./HistoryStrategyResultTable.css";
import {ClassCode} from "../../../common/data/ClassCode";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import {ColumnGroup} from "primereact/columngroup";
import {Row} from "primereact/row";
import {Trade} from "../../../common/data/journal/Trade";
import {JournalTradeDto} from "../../../common/data/journal/JournalTradeDto";
import TreeNode from "primereact/components/treenode/TreeNode";
import {TradingStrategyResult} from "../../../common/data/history/TradingStrategyResult";
import {OperationType} from "../../../common/data/OperationType";
import {TradingStrategyTrade} from "../../../common/data/history/TradingStrategyTrade";
import moment = require("moment");

export interface HistoryStrategyResultTableState {
    expandedRows: Trade[]
}

type Props = {
    stat: TradingStrategyResult
};

export const HistoryStrategyResultTable: React.FC<Props> = ({stat}) => {
    let initState: HistoryStrategyResultTableState = {
        expandedRows: []
    };

    const classCodes = [ClassCode.SPBFUT, ClassCode.TQBR, ClassCode.CETS];

    const [expandedRows, setExpandedRows] = useState(initState.expandedRows);

    useEffect(() => {
    }, []);

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

    const rowBgColor = (tsTrade: TradingStrategyTrade): any => {
        let totalGainAndLoss = getTotalGainAndLoss(tsTrade);
        const className = {
            'no-expander': !tsTrade.trades || tsTrade.trades.length === 0
        };

        if (totalGainAndLoss > 0) {
            if (totalGainAndLoss > 3000) {
                className['win-lg'] = true;
            } else if (totalGainAndLoss > 1000) {
                className['win'] = true;
            } else {
                className['win-sm'] = true;
            }
        }

        if (totalGainAndLoss < 0) {
            if (totalGainAndLoss < -3000) {
                className['loss-lg'] = true;
            } else if (totalGainAndLoss < -1000) {
                className['loss'] = true;
            } else {
                className['loss-sm'] = true;
            }
        }

        return className;
    };

    const headerGroup = (
        <ColumnGroup>
            <Row>
                <Column header="" style={{width: '30px'}}/>
                <Column header="№" style={{width: '30px'}}/>

                <Column header="Op." style={{width: '30px'}}/>
                <Column header="In Order N."/>
                <Column header="Stop Order TransId"/>
                <Column header="T1 Order N."/>
                <Column header="T2 Order N."/>
                <Column header="Kill Order N."/>
                <Column header="Kill Exc. Order N."/>
                <Column header="State"/>

                <Column header="Stop"/>
                <Column header="T1"/>
                <Column header="T2"/>
                <Column header="Last Wholesale Price"/>
                <Column header="Last Reward Risk Ratio Price"/>
                <Column header="Qty" style={{width: '50px'}}/>

                <Column header="Real In Qty" style={{width: '50px'}}/>
                <Column header="Real In"/>
                <Column header="Real Stop"/>
                <Column header="Real T1"/>
                <Column header="Real T2"/>
                <Column header="Real Kill"/>
                <Column header="Real Kill Exc."/>
                <Column header="Left Qty" style={{width: '50px'}}/>
            </Row>
        </ColumnGroup>
    );

    if (!stat || !stat.tradingStrategyData) {
        return (
            <div className="p-grid">
                <div className="p-col-12">
                    No Data
                </div>
            </div>
        );
    }

    return (
        <DataTable value={stat.tradingStrategyData.trades}
                   className="history-strategy-result-table"
                   headerColumnGroup={headerGroup}
                   expandedRows={expandedRows}
                   onRowToggle={onRowToggle}
                   rowClassName={rowBgColor}
                   rowExpansionTemplate={rowExpansionTemplate}
                   dataKey="id">
            <Column expander={true}/>
            <Column field="id" style={{width: '30px'}}/>

            <Column field="operation" style={{width: '30px'}}/>
            <Column field="enterOrderNumber" style={{overflow: 'auto'}}/>
            <Column field="stopOrderTransactionId" style={{overflow: 'auto'}}/>
            <Column field="firstTargetOrderNumber" style={{overflow: 'auto'}}/>
            <Column field="secondTargetOrderNumber" style={{overflow: 'auto'}}/>
            <Column field="killOrderNumber" style={{overflow: 'auto'}}/>
            <Column field="killExceptionOrderNumber" style={{overflow: 'auto'}}/>
            <Column field="state" style={{overflow: 'auto'}}/>

            <Column field="stopPrice"/>
            <Column field="targetPrice1"/>
            <Column field="targetPrice2"/>
            <Column field="lastWholesalePrice"/>
            <Column field="lastRewardRiskRatioPrice"/>
            <Column field="quantity" style={{width: '50px'}}/>

            <Column field="realEntryQuantity" style={{width: '50px'}}/>
            <Column field="realEntryPrice"/>
            <Column field="realStoppedPrice"/>
            <Column field="realTargetPrice1"/>
            <Column field="realTargetPrice2"/>
            <Column field="realKillPrice"/>
            <Column field="realKillExceptionPrice"/>
            <Column field="leftQuantity" style={{width: '50px'}}/>
        </DataTable>
    )
};
