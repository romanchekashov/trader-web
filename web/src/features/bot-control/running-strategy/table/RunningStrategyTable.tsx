import * as React from "react";
import { useState } from "react";
import "./RunningStrategyTable.css";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import TreeNode from "primereact/components/treenode/TreeNode";
import { TradingStrategyResult } from "../../../../common/data/history/TradingStrategyResult";
import { ClassCode } from "../../../../common/data/ClassCode";
import { JournalTradeDto } from "../../../../common/data/journal/JournalTradeDto";
import { TradingStrategyTrade } from "../../../../common/data/history/TradingStrategyTrade";
import { TradingStrategyTradeState } from "../../../../common/data/history/TradingStrategyTradeState";
import { TradeSystemType } from "../../../../common/data/trading/TradeSystemType";
import moment = require("moment");
import { OperationType } from "../../../../common/data/OperationType";
import { TradingStrategyStatus } from "../../../../common/data/trading/TradingStrategyStatus";
import botControlRestApi from "../../../../common/api/rest/botControlRestApi";
import { useEffect } from "react";

interface TableElementData {
    id: number
    start: string
    name: string
    type: TradeSystemType
    secName: string
    deposit: number
    lastTradeOperation: OperationType
    lastTradeEntryRealPrice: number
    lastTradeState: TradingStrategyTradeState
    total: number
}

interface LazyParams {
    first: number;
    rows: number;
    page: number;
}

type Props = {
    results: TradingStrategyResult[]
    onSelectedTsId: (tsId: number) => void
}

export const RunningStrategyTable: React.FC<Props> = ({ results, onSelectedTsId }) => {
    const [selectedTsId, setSelectedTsId] = useState<number>(null)
    const classCodes = [ClassCode.SPBFUT, ClassCode.TQBR, ClassCode.CETS]
    const [selectedRows, setSelectedRows] = useState<TableElementData[]>([])
    const [loading, setLoading] = useState<boolean>(false);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [lazyParams, setLazyParams] = useState<LazyParams>({
        first: 0,
        rows: 15,
        page: 1
    });
    const [nonRunning, setNonRunning] = useState<TradingStrategyResult[]>([])

    useEffect(() => {
        botControlRestApi.getAllStrategies(lazyParams.first, lazyParams.rows)
            .then(page => {
                setTotalRecords(page.totalElements);
                setNonRunning(page.content
                    .filter(value => value.tradingStrategyData.status !== TradingStrategyStatus.RUNNING)
                    .sort((a, b) => b.tradingStrategyData.id - a.tradingStrategyData.id))
            })
            .catch(console.error)
    }, [lazyParams]);

    const mapToData = (results: TradingStrategyResult[]): TableElementData[] => (results
        .map(result => {
            const lastTrade = result.tradingStrategyData.trades.length > 0
                ? result.tradingStrategyData.trades[0] : null

            return {
                id: result.tradingStrategyData.id,
                start: moment(result.tradingStrategyData.start).format("DD-MM-YY HH:mm"),
                name: result.tradingStrategyData.name,
                type: result.tradingStrategyData.systemType,
                secName: result.tradingStrategyData.security.shortName,
                deposit: result.tradingStrategyData.deposit,
                lastTradeOperation: lastTrade?.operation,
                lastTradeEntryRealPrice: lastTrade?.entryRealPrice,
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
    }

    const isShortTemplate = (rowData: any, { field }) => {
        return rowData[field] ? <span className="fin-short">S</span> : <span className="fin-long">L</span>;
    };

    const dateTemplate = (rowData: any, { field }) => {
        return moment(rowData[field]).format("DD-MM-YYYY");
    };

    const dayOfWeekTemplate = (rowData: any, { field }) => {
        return moment(rowData[field]).format("ddd");
    };

    const timeTemplate = (rowData: any, { field }) => {
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

    const isAllRunning = (): boolean => {
        return results.length > 0 && results.length === results
            .filter(value => value.tradingStrategyData.status === TradingStrategyStatus.RUNNING).length
    }

    const sum = () => {
        if (isAllRunning()) {
            const sum = results
                .map(value => value.stat?.totalGainAndLoss || 0)
                .reduce((a, b) => a + b, 0)
            return Math.floor(sum)
        }

        const sum = selectedRows
            .map(value => value.total || 0)
            .reduce((a, b) => a + b, 0)
        return Math.floor(sum)
    }

    const footerGroup = (
        <ColumnGroup>
            <Row>
                <Column footer="Totals:" colSpan={10} footerStyle={{ textAlign: 'right' }} />
                <Column footer={sum()} />
            </Row>
        </ColumnGroup>
    )

    return (
        <DataTable value={mapToData(results)}
            className="history-strategy-result-table"
            footerColumnGroup={footerGroup}
            onRowClick={e => {
                if (e.originalEvent.target["innerHTML"].indexOf('checkbox') === -1) {
                    onSelectedTsId(e.data.id)
                }
            }}
            rowClassName={rowBgColor}
            dataKey="id"
            selection={selectedRows}
            onSelectionChange={e => {
                setSelectedRows(e.value)
            }}
            lazy
            first={lazyParams.first}
            paginator
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
            rows={lazyParams.rows}
            rowsPerPageOptions={[15, 30, 50]}
            totalRecords={totalRecords}
            loading={loading}
            onPage={console.log}
        >
            <Column selectionMode="multiple" headerStyle={{ width: '10px' }} />
            <Column field="id" style={{ width: '10px' }} header="№" headerStyle={{ width: '10px' }} />
            <Column field="name" filter style={{ width: '30px', overflow: "hidden" }} header="Strategy" headerStyle={{ width: '30px' }} />
            <Column field="type" filter style={{ width: '20px' }} header="Type" headerStyle={{ width: '20px' }} />
            <Column field="start" style={{ width: '30px' }} header="Start" headerStyle={{ width: '30px' }} />
            <Column field="secName" filter style={{ width: '30px' }} header="Sec. Name" headerStyle={{ width: '30px' }} />
            <Column field="deposit" style={{ width: '30px' }} header="Deposit" headerStyle={{ width: '30px' }} />
            <Column field="lastTradeOperation" style={{ width: '30px' }} header="LT Op" headerStyle={{ width: '30px' }} />
            <Column field="lastTradeEntryRealPrice" style={{ width: '30px' }} header="LT Entry R" headerStyle={{ width: '30px' }} />
            <Column field="lastTradeState" style={{ width: '30px', overflow: 'hidden' }} header="LT State" headerStyle={{ width: '30px' }} />
            <Column field="total" style={{ width: '30px' }} header="Result" headerStyle={{ width: '30px' }} />

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
}
