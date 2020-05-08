import * as React from "react";
import {useEffect, useState} from "react";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import {SecurityCurrency} from "../../../common/api/data/SecurityCurrency";

type Props = {
    currencies: SecurityCurrency[]
    selectedCurrency: SecurityCurrency
    onSelectRow: (e: any) => void
};

const Currencies: React.FC<Props> = ({currencies, selectedCurrency, onSelectRow}) => {

    const columns = [
        {field: 'secCode', header: 'secCode'},
        {field: 'name', header: 'name'},
        {field: 'lastTradePrice', header: 'lastTradePrice'},
        {field: 'lastChange', header: 'lastChange'},
        {field: 'lastTradeQuantity', header: 'lastTradeQuantity'},
        {field: 'lotSize', header: 'lotSize'},
        {field: 'weightedAveragePrice', header: 'weightedAveragePrice'},
        {field: 'todayMoneyTurnover', header: 'todayMoneyTurnover'},
        {field: 'numberOfTradesToday', header: 'numberOfTradesToday'}
    ];

    const [selectedColumns, setSelectedColumns] = useState(columns);

    if (selectedCurrency) {
        setSelectedColumns([
            {field: 'secCode', header: 'secCode'},
            {field: 'name', header: 'name'},
            {field: 'lastTradePrice', header: 'lastTradePrice'},
            {field: 'lastChange', header: 'lastChange'}
        ]);
    }

    useEffect(() => {
    });

    const columnComponents = selectedColumns.map(col=> {
        return <Column key={col.field} field={col.field} header={col.header} sortable={true} filter={true} />;
    });

    return (
        <DataTable value={currencies} responsive
                   selection={selectedCurrency}
                   onSelectionChange={(e) => onSelectRow(e.value[0])}>
            <Column selectionMode="multiple" style={{width:'2em'}}/>
            {columnComponents}
        </DataTable>
    )
};

export default Currencies;