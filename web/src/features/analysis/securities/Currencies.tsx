import * as React from "react";
import {useEffect, useState} from "react";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import {SecurityCurrency} from "../../../common/data/security/SecurityCurrency";

type Props = {
    currencies: SecurityCurrency[]
    selectedCurrency: SecurityCurrency
    onSelectRow: (e: any) => void
};

const Currencies: React.FC<Props> = ({currencies, selectedCurrency, onSelectRow}) => {

    const columns = [
        {field: 'shortName', header: 'Наз'},
        {field: 'lastChange', header: '% изм'},
        {field: 'lastTradePrice', header: 'Цен посл'},
        {field: 'lastTradeQuantity', header: 'Кол-во посл'},
        {field: 'lotSize', header: 'Лот'},
        {field: 'issueSize', header: 'Объем обр.'},
        {field: 'weightedAveragePrice', header: 'Ср. взв. цена'},
        {field: 'valueToday', header: 'Оборот'},
        {field: 'numTradesToday', header: 'Кол-во сделок'}
    ];

    const lessColumns = [
        {field: 'shortName', header: 'Наз'},
        {field: 'lastChange', header: '% изм'},
        {field: 'numTradesToday', header: 'Кол-во сделок'}
    ];

    useEffect(() => {
    });

    const selectedColumns = selectedCurrency ? lessColumns : columns;
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
        <DataTable value={currencies} responsive
                   selectionMode="single"
                   selection={selectedCurrency}
                   onSelectionChange={onSelect}
                   scrollable={!!selectedCurrency}
                   scrollHeight="600px">
            {columnComponents}
        </DataTable>
    )
};

export default Currencies;