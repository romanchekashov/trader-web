import * as React from "react";
import {useEffect, useState} from "react";
import "./TradeJournalTable.css";
import {ClassCode} from "../../../common/data/ClassCode";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import {ColumnGroup} from "primereact/columngroup";
import {Row} from "primereact/row";
import {ResultDto} from "../../../common/data/journal/ResultDto";
import {Trade} from "../../../common/data/journal/Trade";
import {JournalTradeDto} from "../../../common/data/journal/JournalTradeDto";
import TreeNode from "primereact/components/treenode/TreeNode";
import moment = require("moment");

export interface TradeJournalTableState {
    expandedRows: Trade[]
}

type Props = {
    stat: ResultDto[]
};

export const TradeJournalTable: React.FC<Props> = ({stat}) => {
    let initState: TradeJournalTableState = {
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
                    <div className="p-col-1">{trade.sell ? 'SELL' : 'BUY'}</div>
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

    const rowBgColor = (t: JournalTradeDto): any => {
        if (t.totalGainAndLoss > 0) {
            if (t.totalGainAndLoss > 3000) {
                return {'win-lg': true};
            } else if (t.totalGainAndLoss > 1000) {
                return {'win': true};
            } else {
                return {'win-sm': true};
            }
        }

        if (t.totalGainAndLoss < 0) {
            if (t.totalGainAndLoss < -3000) {
                return {'loss-lg': true};
            } else if (t.totalGainAndLoss < -1000) {
                return {'loss': true};
            } else {
                return {'loss-sm': true};
            }
        }
    };

    const headerGroup = (
        <ColumnGroup>
            <Row>
                <Column header="" rowSpan={3} style={{width: '30px'}}/>
                <Column header="№" rowSpan={3} style={{width: '30px'}}/>
                <Column header="Тикер" rowSpan={3}/>
                <Column header="Short / Long" rowSpan={3} style={{width: '40px'}}/>
                <Column header="Вход" rowSpan={2} colSpan={6}/>
                <Column header="Выход" rowSpan={2} colSpan={6}/>
                <Column header="Коммисия" rowSpan={2} colSpan={3}/>
                <Column header="Риск менеджмент" colSpan={10}/>
                <Column header="Время в сделке" rowSpan={3}/>
            </Row>
            <Row>
                <Column header="Цели по прибыли" colSpan={3}/>
                <Column header="Цели по убыткам(Макс. стоп)" colSpan={3}/>
                <Column header="Р/П" colSpan={2}/>
                <Column header="Прибыль/Убыток" colSpan={2}/>
            </Row>
            <Row>
                <Column header="Дата"/>
                <Column header="Нед."/>
                <Column header="Время"/>
                <Column header="Поз."/>
                <Column header="Сумма отк."/>
                <Column header="Цена за 1шт."/>

                <Column header="Дата"/>
                <Column header="Нед."/>
                <Column header="Время"/>
                <Column header="Закр."/>
                <Column header="Сумма закр."/>
                <Column header="Цена за 1шт."/>

                <Column header="% брокера"/>
                <Column header="Вход"/>
                <Column header="Выход"/>

                <Column header="Изм. цены за 1шт"/>
                <Column header="Сумма (руб)"/>
                <Column header="Сумма (%)"/>

                <Column header="Изм. цены за 1шт"/>
                <Column header="Сумма (руб)"/>
                <Column header="Сумма (%)"/>

                <Column header="Изм. цены за 1шт"/>
                <Column header="Сумма (%)"/>
                <Column header="Чистая сумма (руб)"/>
                <Column header={stat[0].totalGainAndLoss}/>
            </Row>
        </ColumnGroup>
    );

    return (
        <DataTable value={stat[0].trades}
                   headerColumnGroup={headerGroup}
                   expandedRows={expandedRows}
                   onRowToggle={onRowToggle}
                   rowClassName={rowBgColor}
                   rowExpansionTemplate={rowExpansionTemplate} dataKey="id">
            <Column expander={true}/>
            <Column field="id"/>
            <Column field="security.symbol"/>
            <Column field="isShort" body={isShortTemplate}/>
            <Column field="open" body={dateTemplate}/>
            <Column field="open" body={dayOfWeekTemplate} style={{width: '10%'}}/>
            <Column field="open" body={timeTemplate}/>
            <Column field="openPosition"/>
            <Column field="openSum"/>
            <Column field="openPrice"/>
            <Column field="close" body={dateTemplate}/>
            <Column field="close" body={dayOfWeekTemplate}/>
            <Column field="close" body={timeTemplate}/>
            <Column field="closePosition"/>
            <Column field="closeSum"/>
            <Column field="closePrice"/>
            <Column field="security.brokerCommission"/>
            <Column field="openCommission"/>
            <Column field="closeCommission"/>
            <Column/>
            <Column/>
            <Column/>
            <Column/>
            <Column/>
            <Column/>
            <Column/>
            <Column field="priceChange"/>
            <Column field="priceChangePercentage"/>
            <Column field="totalGainAndLoss"/>
            <Column body={timeSpent}/>
        </DataTable>
    )
};
