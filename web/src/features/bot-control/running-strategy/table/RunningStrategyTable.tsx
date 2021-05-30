import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import TreeNode from "primereact/components/treenode/TreeNode";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { Row } from "primereact/row";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { LoadingState } from "../../../../app/LoadingState";
import { loadStrategiesHistory, loadStrategiesRunning, loadStrategiesStopped, selectStrategies } from "../../../../app/strategies/strategiesSlice";
import { ClassCode } from "../../../../common/data/ClassCode";
import { TradingStrategyResult } from "../../../../common/data/history/TradingStrategyResult";
import { TradingStrategyTrade } from "../../../../common/data/history/TradingStrategyTrade";
import { TradingStrategyTradeState } from "../../../../common/data/history/TradingStrategyTradeState";
import { JournalTradeDto } from "../../../../common/data/journal/JournalTradeDto";
import { OperationType } from "../../../../common/data/OperationType";
import { Page } from "../../../../common/data/Page";
import { SecurityInfo } from "../../../../common/data/security/SecurityInfo";
import { TradeSystemType } from "../../../../common/data/trading/TradeSystemType";
import { TradingStrategyStatus } from "../../../../common/data/trading/TradingStrategyStatus";
import { PrimeDropdownItem } from "../../../../common/utils/utils";
import "./RunningStrategyTable.css";
import moment = require("moment");

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
    filters?: any;
}

type Props = {
    status: TradingStrategyStatus
    onSelectedStrategyResult: (tsId: TradingStrategyResult) => void
}

export const RunningStrategyTable: React.FC<Props> = ({ status, onSelectedStrategyResult }) => {

    const dispatch = useAppDispatch();
    const {
        strategiesSecurities,
        strategyResultsRunning, strategyResultsRunningLoading,
        strategyResultsStopped, strategyResultsStoppedLoading,
        strategyResultsHistory, strategyResultsHistoryLoading
    } = useAppSelector(selectStrategies);

    const dt = useRef(null);

    const [sec, setSec] = useState<SecurityInfo>(null);
    const [secs, setSecs] = useState<PrimeDropdownItem<SecurityInfo>[]>([{ label: "ALL", value: null }]);
    const [selectedTsId, setSelectedTsId] = useState<number>(null)
    const classCodes = [ClassCode.SPBFUT, ClassCode.TQBR, ClassCode.CETS]
    const [selectedRows, setSelectedRows] = useState<TableElementData[]>([])
    const [lazyParams, setLazyParams] = useState<LazyParams>({
        first: 0,
        rows: 15,
        page: 0
    });

    let page: Page<TradingStrategyResult> = strategyResultsHistory;
    let loading = strategyResultsHistoryLoading === LoadingState.LOADING;

    if (status === TradingStrategyStatus.RUNNING) {
        page = strategyResultsRunning;
        loading = strategyResultsRunningLoading === LoadingState.LOADING;
    }

    if (status === TradingStrategyStatus.STOPPED) {
        page = strategyResultsStopped;
        loading = strategyResultsStoppedLoading === LoadingState.LOADING;
    }

    const results: TradingStrategyResult[] = page.content;
    const totalRecords = page.totalElements;

    useEffect(() => {
        console.log(lazyParams);
        let secId = null;
        if (lazyParams.filters && lazyParams.filters.secName) {
            secId = strategiesSecurities.find(({ shortName }) => shortName === lazyParams.filters.secName.value)?.id;
        }

        switch (status) {
            case TradingStrategyStatus.RUNNING:
                dispatch(loadStrategiesRunning({ secId, page: lazyParams.page, size: lazyParams.rows }));
                break;
            case TradingStrategyStatus.STOPPED:
                dispatch(loadStrategiesStopped({ secId, page: lazyParams.page, size: lazyParams.rows }));
                break;
            case TradingStrategyStatus.FINISHED:
                dispatch(loadStrategiesHistory({ secId, page: lazyParams.page, size: lazyParams.rows }));
                break;

        }
    }, [status, lazyParams, strategiesSecurities]);

    useEffect(() => {
        if (!strategiesSecurities.length) return;

        const newSecCodes: PrimeDropdownItem<SecurityInfo>[] = [
            { label: "ALL", value: null },
        ];

        for (const sec of strategiesSecurities) {
            newSecCodes.push({ label: sec.shortName, value: sec });
        }

        setSecs(newSecCodes);
    }, [strategiesSecurities]);

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
                total: result.stat?.totalGainAndLoss,
                data: result
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

    const onSecChange = (e) => {
        const sec: SecurityInfo = e.value;
        dt.current.filter(sec?.shortName, 'secName', 'equals');
        setSec(sec);
    }

    const footerGroup = (
        <ColumnGroup>
            <Row>
                <Column footer="Totals:" colSpan={10} footerStyle={{ textAlign: 'right' }} />
                <Column footer={sum()} />
            </Row>
        </ColumnGroup>
    )

    const secFilter = <Dropdown
        value={sec}
        options={secs}
        onChange={onSecChange}
        filter={true}
        style={{ width: "150px" }}
    />

    return (
        <DataTable
            ref={dt}
            value={mapToData(results)}
            className="history-strategy-result-table"
            footerColumnGroup={footerGroup}
            onRowClick={e => {
                if (e.originalEvent.target["innerHTML"].indexOf('checkbox') === -1) {
                    onSelectedStrategyResult(e.data.data)
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
            onPage={e => setLazyParams({ ...lazyParams, ...e })}
            onFilter={e => setLazyParams({ ...lazyParams, ...e, first: 0, page: 0 })}
            filters={lazyParams.filters}
            loading={loading}
        >
            <Column selectionMode="multiple" headerStyle={{ width: '10px' }} />
            <Column field="id" style={{ width: '10px' }} header="№" headerStyle={{ width: '10px' }} />
            <Column field="name" filter style={{ width: '30px', overflow: "hidden" }} header="Strategy" headerStyle={{ width: '30px' }} />
            <Column field="type" filter style={{ width: '20px' }} header="Type" headerStyle={{ width: '20px' }} />
            <Column field="start" style={{ width: '30px' }} header="Start" headerStyle={{ width: '30px' }} />
            <Column field="secName" filter filterElement={secFilter} style={{ width: '30px' }} header="Sec. Name" headerStyle={{ width: '30px' }} />
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
