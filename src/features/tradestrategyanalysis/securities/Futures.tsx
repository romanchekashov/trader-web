import * as React from "react";
import {useEffect} from "react";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import {SecurityFuture} from "../../../api/dto/SecurityFuture";
import {useState} from "react";

type Props = {
    futures: SecurityFuture[]
    selectedFuture: SecurityFuture
    onSelectRow: (e: any) => void
};

const Futures: React.FC<Props> = ({futures, selectedFuture, onSelectRow}) => {

    const columns = [
        {field: 'shortName', header: 'Наз'},
        {field: 'lastChange', header: '% изм'},
        {field: 'lastTradePrice', header: 'Цен посл'},
        {field: 'totalDemand', header: 'Общ спрос'},
        {field: 'totalSupply', header: 'Общ предл'},
        {field: 'sellDepoPerContract', header: 'ГО прод'},
        {field: 'buyDepoPerContract', header: 'ГО покуп'},
        {field: 'todayMoneyTurnover', header: 'Оборот'},
        {field: 'numberOfTradesToday', header: 'numberOfTradesToday'}
    ];

    const lessColumns = [
        {field: 'shortName', header: 'Наз'},
        {field: 'lastChange', header: '% изм'},
        {field: 'lastTradePrice', header: 'Цен посл'}
    ];

    useEffect(() => {
    });

    const selectedColumns = selectedFuture ? lessColumns : columns;
    const columnComponents = selectedColumns.map(col=> {
        return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true} />;
    });

    const onSelect = (e) => {
        if (!Array.isArray(e.value)) {
            console.log(e.value);
            onSelectRow(e.value);
        }
    };

    return (
        <DataTable value={futures} responsive
                   selectionMode="single"
                   selection={selectedFuture}
                   onSelectionChange={onSelect}
                   scrollable={!!selectedFuture}
                   scrollHeight="600px">
            <Column selectionMode="multiple" style={{width:'2em'}}/>
            {columnComponents}
        </DataTable>
    )
};

export default Futures;